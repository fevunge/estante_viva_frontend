import { useNavigate } from "react-router-dom";
import { Show } from "@clerk/react";
import { History } from "lucide-react";
import Book3D from "@/components/Book3D";
import { ClerkOnly } from "@/components/auth/clerkReady";
import { useRecent } from "@/lib/library";

function Shelf() {
  const navigate = useNavigate();
  const recent = useRecent();
  const items = recent.isError ? [] : (recent.data ?? []);
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-14 sm:px-8" data-testid="recent-shelf">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-mocha-cyan" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-mocha-white">
          Continue lendo
        </p>
      </div>
      <div className="mt-6 flex gap-10 overflow-x-auto pb-6 pt-2">
        {items.map((r) => {
          const pct = Math.round((r.page / r.total_pages) * 100);
          return (
            <div
              key={r.book.id}
              className="flex w-[150px] shrink-0 flex-col items-center"
              data-testid={`recent-book-${r.book.id}`}
            >
              <Book3D
                book={r.book}
                width={130}
                onOpen={() => navigate(`/livro/${r.book.id}`)}
                testId={`recent-book-open-${r.book.id}`}
              />
              <p className="mt-5 line-clamp-1 w-full text-center font-heading text-sm font-semibold text-mocha-text">
                {r.book.title}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mocha-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mocha-cyan to-mocha-blue"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p
                className="mt-1.5 font-mono text-[11px] text-mocha-white"
                data-testid={`recent-book-progress-${r.book.id}`}
              >
                p. {r.page} de {r.total_pages} · {pct}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function RecentShelf() {
  return (
    <ClerkOnly>
      <Show when="signed-in">
        <Shelf />
      </Show>
    </ClerkOnly>
  );
}
