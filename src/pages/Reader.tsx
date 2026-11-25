import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import UserMenu from "@/components/UserMenu";
import PdfReader from "@/components/PdfReader";
import StudyNotebook from "@/components/StudyNotebook";
import { BookmarkToggle, ProgressSync } from "@/components/ReaderAccount";
import { apiGet, ApiError } from "@/lib/api";
import type { Book } from "@/lib/types";
import { pdfUrl } from "@/lib/types";

function savedPage(id: string): number {
  const n = parseInt(localStorage.getItem(`estante-page-${id}`) ?? "1", 10);
  return Number.isNaN(n) || n < 1 ? 1 : n;
}

export default function Reader() {
  const { id = "" } = useParams();
  // Visitors: last page kept on this device. Signed-in readers: also synced to their account (ProgressSync).
  const [page, setPage] = useState(() => savedPage(id));
  const [numPages, setNumPages] = useState(0);
  const [notebookOpen, setNotebookOpen] = useState(
    () => window.matchMedia("(min-width: 1024px)").matches,
  );
  const book = useQuery({
    queryKey: ["book", id],
    queryFn: () => apiGet<Book>(`/books/${id}`),
    retry: 1,
  });

  const changePage = useCallback(
    (p: number) => {
      setPage(p);
      localStorage.setItem(`estante-page-${id}`, String(p));
    },
    [id],
  );

  const notFound = book.error instanceof ApiError && book.error.status === 404;

  return (
    <div className="flex h-screen flex-col bg-mocha-base">
      <SiteHeader>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-mocha-white transition-colors hover:text-mocha-text"
          data-testid="reader-back-link"
        >
          <ArrowLeft className="h-4 w-4" /> Galeria
        </Link>
        <UserMenu />
      </SiteHeader>

      <div className="flex items-center gap-3 border-b border-mocha-surface px-5 py-2.5 sm:px-8">
        {book.data ? (
          <>
            <span
              className="h-8 w-1.5 shrink-0 rounded-full"
              style={{ background: book.data.color }}
            />
            <div className="min-w-0">
              <h1
                className="truncate font-heading text-lg font-semibold text-mocha-text"
                data-testid="reader-book-title"
              >
                {book.data.title}
              </h1>
              <p className="truncate text-xs text-mocha-white" data-testid="reader-book-author">
                {book.data.author} · {book.data.category} · {book.data.page_count} páginas
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <a
                href={pdfUrl(book.data)}
                download={`${book.data.title}.pdf`}
                className="hidden items-center gap-1.5 rounded-full border border-mocha-surface1 px-3 py-1.5 text-xs text-mocha-text transition-[border-color,background-color] duration-200 hover:border-mocha-blue hover:bg-mocha-blue/10 sm:flex"
                data-testid="reader-download-link"
              >
                <Download className="h-3.5 w-3.5 text-mocha-blue" /> Baixar PDF
              </a>
              <Button
                size="sm"
                variant={notebookOpen ? "secondary" : "outline"}
                className="rounded-full"
                onClick={() => setNotebookOpen((v) => !v)}
                aria-pressed={notebookOpen}
                data-testid="reader-notebook-toggle"
              >
                <NotebookPen className="text-mocha-yellow" /> Caderno
              </Button>
            </div>
          </>
        ) : (
          <div className="h-8 w-64 animate-pulse rounded bg-mocha-surface" />
        )}
      </div>

      {notFound ? (
        <div className="m-auto text-center" data-testid="reader-not-found">
          <p className="font-heading text-2xl text-mocha-text">Livro não encontrado</p>
          <Link to="/" className="mt-3 inline-block text-sm text-mocha-blue hover:underline">
            Voltar à galeria
          </Link>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-mocha-mantle">
            {book.data ? (
              <>
                <PdfReader
                  url={pdfUrl(book.data)}
                  page={page}
                  onPageChange={changePage}
                  onLoaded={setNumPages}
                  toolbarExtra={<BookmarkToggle bookId={book.data.id} page={page} />}
                />
                <ProgressSync
                  bookId={book.data.id}
                  page={page}
                  totalPages={numPages}
                  onRestore={changePage}
                />
              </>
            ) : (
              <div className="m-auto text-sm text-mocha-white" data-testid="reader-unavailable">
                {book.isError ? "Não foi possível carregar o livro agora." : "Carregando…"}
              </div>
            )}
          </section>
          {notebookOpen && book.data && (
            <aside
              className="fixed inset-x-0 bottom-0 top-16 z-30 flex flex-col border-l border-mocha-surface bg-mocha-base shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 lg:static lg:z-auto lg:w-[400px] lg:shrink-0 lg:shadow-none"
              data-testid="reader-notebook-panel"
            >
              <StudyNotebook
                bookId={book.data.id}
                page={page}
                onJump={(p) => {
                  changePage(p);
                  if (!window.matchMedia("(min-width: 1024px)").matches) setNotebookOpen(false);
                }}
                onClose={() => setNotebookOpen(false)}
              />
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
