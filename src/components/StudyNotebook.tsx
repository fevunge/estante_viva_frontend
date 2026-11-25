import { useState } from "react";
import { Link } from "react-router-dom";
import { Show } from "@clerk/react";
import {
  Bookmark as BookmarkIcon,
  Check,
  NotebookPen,
  Pencil,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ClerkOnly } from "@/components/auth/clerkReady";
import { useBookmarks, useNotes } from "@/lib/library";
import type { Note } from "@/lib/types";

interface Props {
  bookId: string;
  page: number;
  onJump: (page: number) => void;
  onClose: () => void;
}

export default function StudyNotebook(props: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="study-notebook">
      <div className="flex items-center gap-3 border-b border-mocha-surface px-5 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mocha-yellow to-mocha-magenta text-mocha-crust">
          <NotebookPen className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-semibold text-mocha-text">
            Caderno de estudos
          </p>
          <p className="text-xs text-mocha-white">
            Você está na{" "}
            <span className="font-mono text-mocha-cyan" data-testid="notebook-current-page">
              p. {props.page}
            </span>
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          className="ml-auto"
          onClick={props.onClose}
          aria-label="Fechar caderno"
          data-testid="notebook-close-button"
        >
          <X />
        </Button>
      </div>
      <ClerkOnly fallback={<p className="p-6 text-sm text-mocha-white">Carregando…</p>}>
        <Show when="signed-in">
          <SignedInNotebook {...props} />
        </Show>
        <Show when="signed-out">
          <SignedOutCta />
        </Show>
      </ClerkOnly>
    </div>
  );
}

function SignedOutCta() {
  return (
    <div
      className="m-5 rounded-2xl border border-dashed border-mocha-surface1 p-6 animate-float-in"
      data-testid="notebook-signed-out-cta"
    >
      <p className="font-heading text-lg text-mocha-text">Estude com o seu caderno</p>
      <ul className="mt-3 space-y-2 text-sm text-mocha-white">
        <li className="flex gap-2">
          <StickyNote className="h-4 w-4 shrink-0 text-mocha-yellow" /> Anotações em cada página
        </li>
        <li className="flex gap-2">
          <BookmarkIcon className="h-4 w-4 shrink-0 text-mocha-magenta" /> Marcadores para voltar
          com um toque
        </li>
        <li className="flex gap-2">
          <Check className="h-4 w-4 shrink-0 text-mocha-green" /> Seu progresso salvo em qualquer
          aparelho
        </li>
      </ul>
      <div className="mt-5 flex gap-2">
        <Link
          to="/sign-up"
          className="rounded-full bg-mocha-blue px-4 py-2 text-sm font-medium text-mocha-crust"
          data-testid="notebook-sign-up-link"
        >
          Criar conta grátis
        </Link>
        <Link
          to="/entrar"
          className="rounded-full border border-mocha-surface1 px-4 py-2 text-sm text-mocha-text"
          data-testid="notebook-sign-in-link"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}

function SignedInNotebook({ bookId, page, onJump }: Props) {
  const notes = useNotes(bookId);
  const bookmarks = useBookmarks(bookId);
  const [draft, setDraft] = useState("");
  const [onlyPage, setOnlyPage] = useState(false);
  const [label, setLabel] = useState("");

  const allNotes = notes.list.data ?? [];
  const shown = onlyPage ? allNotes.filter((n) => n.page === page) : allNotes;
  const marks = bookmarks.list.data ?? [];
  const pageMarked = marks.some((b) => b.page === page);

  return (
    <Tabs defaultValue="notes" className="flex min-h-0 flex-1 flex-col gap-0">
      <div className="px-5 pt-3">
        <TabsList className="w-full">
          <TabsTrigger value="notes" data-testid="notebook-tab-notes">
            Anotações{" "}
            <span className="ml-1 font-mono text-[11px] opacity-70">{allNotes.length}</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" data-testid="notebook-tab-bookmarks">
            Marcadores <span className="ml-1 font-mono text-[11px] opacity-70">{marks.length}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="notes" className="flex min-h-0 flex-1 flex-col">
        <form
          className="border-b border-mocha-surface px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            notes.create.mutate({ page, text: draft }, { onSuccess: () => setDraft("") });
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Escreva uma anotação sobre a página ${page}…`}
            rows={3}
            maxLength={5000}
            className="resize-none bg-mocha-base text-sm"
            data-testid="note-input"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-mocha-white">
              <input
                type="checkbox"
                checked={onlyPage}
                onChange={(e) => setOnlyPage(e.target.checked)}
                className="accent-[#89b4fa]"
                data-testid="note-filter-page-checkbox"
              />
              Só desta página
            </label>
            <Button
              type="submit"
              size="sm"
              disabled={!draft.trim() || notes.create.isPending}
              data-testid="note-save-button"
            >
              Salvar na p. {page}
            </Button>
          </div>
        </form>
        <div
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
          data-testid="notes-list"
        >
          {shown.length === 0 ? (
            <p className="text-sm text-mocha-white" data-testid="notes-empty-state">
              {notes.list.isPending
                ? "Carregando…"
                : onlyPage
                  ? "Nenhuma anotação nesta página."
                  : "Nenhuma anotação ainda. Comece pela página atual!"}
            </p>
          ) : (
            shown.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                current={n.page === page}
                onJump={onJump}
                onSave={(text) => notes.update.mutate({ id: n.id, text })}
                onDelete={() => notes.remove.mutate(n.id)}
              />
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="bookmarks" className="flex min-h-0 flex-1 flex-col">
        <form
          className="flex gap-2 border-b border-mocha-surface px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            bookmarks.create.mutate({ page, label }, { onSuccess: () => setLabel("") });
          }}
        >
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nome do marcador (opcional)"
            maxLength={120}
            className="bg-mocha-base text-sm"
            data-testid="bookmark-label-input"
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 shrink-0"
            disabled={pageMarked || bookmarks.create.isPending}
            data-testid="bookmark-add-button"
          >
            {pageMarked ? "Já marcada" : `Marcar p. ${page}`}
          </Button>
        </form>
        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4"
          data-testid="bookmarks-list"
        >
          {marks.length === 0 ? (
            <p className="text-sm text-mocha-white" data-testid="bookmarks-empty-state">
              {bookmarks.list.isPending
                ? "Carregando…"
                : "Nenhum marcador. Marque as páginas importantes para voltar a elas num toque."}
            </p>
          ) : (
            marks.map((b) => (
              <div
                key={b.id}
                className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${b.page === page ? "border-mocha-magenta/60 bg-mocha-magenta/10" : "border-mocha-surface bg-mocha-mantle hover:border-mocha-surface1"}`}
                data-testid={`bookmark-item-${b.page}`}
              >
                <BookmarkIcon className="h-4 w-4 shrink-0 fill-mocha-magenta text-mocha-magenta" />
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onJump(b.page)}
                  data-testid={`bookmark-jump-${b.page}`}
                >
                  <span className="font-mono text-xs text-mocha-cyan">p. {b.page}</span>
                  <span className="block truncate text-sm text-mocha-text">
                    {b.label || `Página ${b.page}`}
                  </span>
                </button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  className="text-mocha-red opacity-70 hover:opacity-100"
                  onClick={() => bookmarks.remove.mutate(b.id)}
                  aria-label="Remover marcador"
                  data-testid={`bookmark-delete-${b.page}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function NoteCard({
  note,
  current,
  onJump,
  onSave,
  onDelete,
}: {
  note: Note;
  current: boolean;
  onJump: (p: number) => void;
  onSave: (t: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);
  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors animate-float-in ${current ? "border-mocha-yellow/50 bg-mocha-yellow/5" : "border-mocha-surface bg-mocha-mantle"}`}
      data-testid={`note-item-${note.id}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onJump(note.page)}
          className="rounded-full bg-mocha-surface px-2 py-0.5 font-mono text-[11px] text-mocha-cyan transition-colors hover:bg-mocha-surface1"
          data-testid={`note-jump-${note.id}`}
        >
          p. {note.page}
        </button>
        <span className="text-[11px] text-mocha-black">
          {new Date(note.updated_at).toLocaleDateString("pt-BR")}
        </span>
        <div className="ml-auto flex gap-0.5">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              setText(note.text);
              setEditing((v) => !v);
            }}
            aria-label="Editar"
            data-testid={`note-edit-${note.id}`}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-mocha-red"
            onClick={onDelete}
            aria-label="Apagar"
            data-testid={`note-delete-${note.id}`}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {editing ? (
        <div className="mt-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="resize-none bg-mocha-base text-sm"
            data-testid={`note-edit-input-${note.id}`}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button size="xs" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button
              size="xs"
              disabled={!text.trim()}
              onClick={() => {
                onSave(text);
                setEditing(false);
              }}
              data-testid={`note-edit-save-${note.id}`}
            >
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mocha-text/90">
          {note.text}
        </p>
      )}
    </div>
  );
}
