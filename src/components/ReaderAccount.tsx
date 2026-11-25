import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Show } from "@clerk/react";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ClerkOnly } from "@/components/auth/clerkReady";
import { useBookmarks, useProgress } from "@/lib/library";

/** Toolbar bookmark toggle: signed-in readers mark/unmark the current page; visitors are invited to sign in. */
export function BookmarkToggle({ bookId, page }: { bookId: string; page: number }) {
  const navigate = useNavigate();
  return (
    <ClerkOnly>
      <Show when="signed-in">
        <SignedInToggle bookId={bookId} page={page} />
      </Show>
      <Show when="signed-out">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Marcar página"
          data-testid="pdf-bookmark-toggle"
          onClick={() => {
            toast("Entre na sua conta para marcar páginas", {
              action: { label: "Entrar", onClick: () => navigate("/entrar") },
            });
          }}
        >
          <BookmarkIcon />
        </Button>
      </Show>
    </ClerkOnly>
  );
}

function SignedInToggle({ bookId, page }: { bookId: string; page: number }) {
  const { list, create, remove } = useBookmarks(bookId);
  const mark = list.data?.find((b) => b.page === page);
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label={mark ? "Remover marcador" : "Marcar página"}
      aria-pressed={!!mark}
      disabled={create.isPending || remove.isPending}
      onClick={() => (mark ? remove.mutate(mark.id) : create.mutate({ page }))}
      className={mark ? "text-mocha-magenta" : ""}
      data-testid="pdf-bookmark-toggle"
    >
      <BookmarkIcon className={mark ? "fill-current" : ""} />
    </Button>
  );
}

/** Restores the reader's saved page from the server once, then saves progress as they read. */
export function ProgressSync({
  bookId,
  page,
  totalPages,
  onRestore,
}: {
  bookId: string;
  page: number;
  totalPages: number;
  onRestore: (p: number) => void;
}) {
  return (
    <ClerkOnly>
      <Show when="signed-in">
        <SignedInSync bookId={bookId} page={page} totalPages={totalPages} onRestore={onRestore} />
      </Show>
    </ClerkOnly>
  );
}

function SignedInSync({
  bookId,
  page,
  totalPages,
  onRestore,
}: {
  bookId: string;
  page: number;
  totalPages: number;
  onRestore: (p: number) => void;
}) {
  const { query, save } = useProgress(bookId);
  const restored = useRef(false);
  const saveRef = useRef(save.mutate);
  saveRef.current = save.mutate;

  useEffect(() => {
    if (restored.current || !query.isSuccess) return;
    restored.current = true;
    if (query.data && query.data.page !== page) onRestore(query.data.page);
  }, [query.isSuccess, query.data, page, onRestore]);

  useEffect(() => {
    if (!restored.current || !totalPages) return;
    const t = setTimeout(() => saveRef.current({ page, total_pages: totalPages }), 800);
    return () => clearTimeout(t);
  }, [page, totalPages, query.isSuccess]);

  return null;
}
