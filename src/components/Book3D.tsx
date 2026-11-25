import { useState } from "react";
import type { Book } from "@/lib/types";
import { coverUrl } from "@/lib/types";

const DARK_TEXT = new Set(["#89b4fa", "#f5c2e7", "#94e2d5", "#f9e2af", "#f38ba8", "#a6e3a1"]);

export function GeneratedCover({
  book,
  compact = false,
}: {
  book: Pick<Book, "title" | "author" | "category" | "color">;
  compact?: boolean;
}) {
  const ink = DARK_TEXT.has(book.color) ? "#11111b" : "#ffffff";
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-4"
      style={{ background: book.color, color: ink }}
      data-testid="generated-cover"
    >
      <div className="absolute inset-2 rounded-[3px] border" style={{ borderColor: `${ink}40` }} />
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ background: `${ink}14` }}
      />
      <div
        className="absolute -bottom-16 -left-8 h-40 w-40 rotate-45"
        style={{ background: `${ink}0d` }}
      />
      <span className="relative font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
        {book.category}
      </span>
      <div className="relative">
        <h3
          className={`font-heading font-semibold leading-tight ${compact ? "text-base" : "text-xl"} line-clamp-4`}
        >
          {book.title}
        </h3>
        <div className="my-2 h-px w-10" style={{ background: ink, opacity: 0.5 }} />
        <p className="font-mono text-[11px] opacity-80 line-clamp-2">{book.author}</p>
      </div>
    </div>
  );
}

interface Props {
  book: Book;
  width?: number;
  onOpen?: () => void;
  testId?: string;
}

/** CSS-3D book: front cover, spine, page block and back cover with hover tilt. */
export default function Book3D({ book, width = 180, onOpen, testId }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const height = Math.round(width * 1.48);
  const showImg = book.has_cover && !imgFailed;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="book-stage relative block cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-mocha-blue focus-visible:ring-offset-4 focus-visible:ring-offset-mocha-base"
      style={{ width, height }}
      aria-label={`Abrir ${book.title}`}
      data-testid={testId ?? `book-card-${book.id}`}
    >
      <div className="book-shadow" />
      <div className="book3d h-full w-full">
        <div className="book3d-back" />
        <div
          className="book3d-spine"
          style={{
            background: `linear-gradient(90deg, ${book.color}aa, ${book.color})`,
          }}
        />
        <div className="book3d-pages" />
        <div className="book3d-front" style={{ background: book.color }}>
          {showImg ? (
            <img
              src={coverUrl(book)}
              alt={`Capa de ${book.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <GeneratedCover book={book} compact={width < 160} />
          )}
        </div>
      </div>
    </button>
  );
}
