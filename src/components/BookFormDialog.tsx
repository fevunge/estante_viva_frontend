import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUp, ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedCover } from "@/components/Book3D";
import { apiPost, apiPut, errorMessage } from "@/lib/api";
import type { Book } from "@/lib/types";
import { PALETTE, coverUrl } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | null; // null → create
  categories: string[];
}

export default function BookFormDialog({ open, onOpenChange, book, categories }: Props) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState(PALETTE[4]);
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(book?.title ?? "");
    setAuthor(book?.author ?? "");
    setDescription(book?.description ?? "");
    setCategory(book?.category ?? "");
    setColor(book?.color ?? PALETTE[4]);
    setPdf(null);
    setCover(null);
    setRemoveCover(false);
  }, [open, book]);

  useEffect(() => {
    if (!cover) return setCoverPreview(null);
    const u = URL.createObjectURL(cover);
    setCoverPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [cover]);

  const save = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("author", author);
      fd.append("description", description);
      fd.append("category", category || "Geral");
      fd.append("color", color);
      if (pdf) fd.append("pdf", pdf);
      if (cover) fd.append("cover", cover);
      if (book) fd.append("remove_cover", String(removeCover));
      const token = await getToken();
      return book
        ? apiPut<Book>(`/admin/books/${book.id}`, fd, token)
        : apiPost<Book>("/admin/books", fd, token);
    },
    onSuccess: (b) => {
      toast.success(book ? "Livro atualizado" : `“${b.title}” publicado na galeria`);
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["book", b.id] });
      onOpenChange(false);
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível salvar o livro")),
  });

  const canSave = title.trim() && author.trim() && (book || pdf) && !save.isPending;
  const showExistingCover = book?.has_cover && !removeCover && !coverPreview;

  return (
    <Dialog open={open} onOpenChange={(o) => !save.isPending && onOpenChange(o)}>
      <DialogContent
        className="max-h-[92vh] overflow-y-auto sm:max-w-3xl"
        data-testid="book-form-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {book ? "Editar livro" : "Novo livro"}
          </DialogTitle>
          <DialogDescription>
            {book
              ? "Atualize os dados, troque o PDF ou a capa."
              : "Envie o PDF; se não houver capa, usamos a primeira página do livro."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="book-form"
          className="grid gap-6 sm:grid-cols-[1fr_180px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) save.mutate();
          }}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bf-title">Título *</Label>
              <Input
                id="bf-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="book-form-title-input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bf-author">Autor *</Label>
                <Input
                  id="bf-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  data-testid="book-form-author-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bf-category">Categoria</Label>
                <Input
                  id="bf-category"
                  list="bf-categories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex.: Filosofia"
                  data-testid="book-form-category-input"
                />
                <datalist id="bf-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-desc">Descrição</Label>
              <Textarea
                id="bf-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sobre o que é o livro?"
                data-testid="book-form-description-input"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Cor da lombada / capa gerada</Label>
              <div className="flex flex-wrap gap-2" data-testid="book-form-color-picker">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110 ${color === c ? "ring-2 ring-mocha-text ring-offset-2 ring-offset-popover" : ""}`}
                    style={{ background: c }}
                    aria-label={`Cor ${c}`}
                    data-testid={`book-form-color-${c.slice(1)}`}
                  />
                ))}
              </div>
            </div>

            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mocha-surface1 p-4 transition-colors hover:border-mocha-blue/70"
              data-testid="book-form-pdf-dropzone"
            >
              <FileUp className="h-5 w-5 shrink-0 text-mocha-blue" />
              <span className="min-w-0 text-sm">
                <span className="block text-mocha-text">
                  {pdf ? pdf.name : book ? "Trocar o PDF (opcional)" : "Escolher arquivo PDF *"}
                </span>
                <span className="text-xs text-mocha-white">
                  {pdf ? `${(pdf.size / 1024 / 1024).toFixed(1)} MB` : "Até 80 MB"}
                </span>
              </span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
                data-testid="book-form-pdf-input"
              />
            </label>

            <label
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-mocha-surface1 p-4 transition-colors hover:border-mocha-magenta/70"
              data-testid="book-form-cover-dropzone"
            >
              <ImageUp className="h-5 w-5 shrink-0 text-mocha-magenta" />
              <span className="min-w-0 text-sm">
                <span className="block text-mocha-text">
                  {cover ? cover.name : "Imagem de capa (opcional)"}
                </span>
                <span className="text-xs text-mocha-white">JPG, PNG ou WebP até 8 MB</span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                data-testid="book-form-cover-input"
              />
            </label>
            {book?.has_cover && !cover && (
              <label className="flex items-center gap-2 text-sm text-mocha-white">
                <Checkbox
                  checked={removeCover}
                  onCheckedChange={(v) => setRemoveCover(!!v)}
                  data-testid="book-form-remove-cover-checkbox"
                />
                Remover capa atual e usar a capa gerada
              </label>
            )}
          </div>

          <div className="hidden sm:block">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mocha-white">
              Pré-visualização
            </p>
            <div
              className="h-[266px] w-[180px] overflow-hidden rounded-[2px_6px_6px_2px] shadow-2xl"
              data-testid="book-form-cover-preview"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="" className="h-full w-full object-cover" />
              ) : showExistingCover && book ? (
                <img src={coverUrl(book)} alt="" className="h-full w-full object-cover" />
              ) : (
                <GeneratedCover
                  book={{
                    title: title || "Título do livro",
                    author: author || "Autor",
                    category: category || "Geral",
                    color,
                  }}
                />
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={save.isPending}
            data-testid="book-form-cancel-button"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="book-form"
            disabled={!canSave}
            data-testid="book-form-submit-button"
          >
            {save.isPending && <Loader2 className="animate-spin" />}
            {save.isPending ? "Processando PDF…" : book ? "Salvar alterações" : "Publicar livro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
