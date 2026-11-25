import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ChevronLeft, ChevronRight, Loader2, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface Props {
  url: string;
  page: number;
  onPageChange: (page: number) => void;
  onLoaded?: (numPages: number) => void;
  toolbarExtra?: React.ReactNode;
}

export default function PdfReader({ url, page, onPageChange, onLoaded, toolbarExtra }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(600);
  const [jump, setJump] = useState(String(page));
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setJump(String(page)), [page]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.max(280, Math.floor(entry.contentRect.width) - 48)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(page + 1);
      if (e.key === "ArrowLeft") go(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const go = (p: number) => {
    if (!numPages) return;
    const next = Math.min(numPages, Math.max(1, p));
    if (next !== page) {
      onPageChange(next);
      boxRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const progress = numPages ? Math.round((page / numPages) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="pdf-reader">
      <div className="flex flex-wrap items-center gap-2 border-b border-mocha-surface bg-mocha-mantle/90 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            data-testid="pdf-prev-page"
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>
          <form
            className="flex items-center gap-1.5 font-mono text-xs text-mocha-white"
            onSubmit={(e) => {
              e.preventDefault();
              const n = parseInt(jump, 10);
              if (!Number.isNaN(n)) go(n);
            }}
          >
            <Input
              value={jump}
              onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))}
              className="h-7 w-14 px-1 text-center font-mono text-xs"
              aria-label="Ir para página"
              data-testid="pdf-page-input"
            />
            <span data-testid="pdf-page-total">/ {numPages || "–"}</span>
          </form>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => go(page + 1)}
            disabled={!numPages || page >= numPages}
            data-testid="pdf-next-page"
            aria-label="Próxima página"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.15).toFixed(2)))}
            data-testid="pdf-zoom-out"
            aria-label="Diminuir zoom"
          >
            <ZoomOut />
          </Button>
          <span
            className="w-12 text-center font-mono text-xs text-mocha-white"
            data-testid="pdf-zoom-level"
          >
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
            data-testid="pdf-zoom-in"
            aria-label="Aumentar zoom"
          >
            <ZoomIn />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom(1)}
            data-testid="pdf-fit-width"
            aria-label="Ajustar à largura"
          >
            <Maximize2 />
          </Button>
          {toolbarExtra}
        </div>
      </div>
      <div className="h-0.5 bg-mocha-surface">
        <div
          className="h-full bg-gradient-to-r from-mocha-blue to-mocha-magenta transition-[width] duration-500"
          style={{ width: `${progress}%` }}
          data-testid="pdf-progress"
        />
      </div>

      <div ref={boxRef} className="grain min-h-0 flex-1 overflow-auto bg-mocha-crust/60 px-6 py-6">
        {failed ? (
          <div
            className="mx-auto mt-20 max-w-sm text-center text-sm text-mocha-white"
            data-testid="pdf-error"
          >
            Não foi possível carregar o PDF agora. Tente recarregar a página.
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              onLoaded?.(n);
              if (page > n) onPageChange(1);
            }}
            onLoadError={() => setFailed(true)}
            loading={
              <div
                className="mt-24 flex flex-col items-center gap-3 text-sm text-mocha-white"
                data-testid="pdf-loading"
              >
                <Loader2 className="h-6 w-6 animate-spin text-mocha-blue" /> Abrindo o livro…
              </div>
            }
          >
            <Page
              key={`${page}-${width}`}
              pageNumber={page}
              width={Math.round(Math.min(width, 760) * zoom)}
              loading={<div style={{ height: Math.min(width, 760) * 1.3 }} />}
              className="animate-in fade-in duration-300"
            />
          </Document>
        )}
      </div>
    </div>
  );
}
