import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Show, UserButton, useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookMarked,
  ExternalLink,
  FileText,
  Layers,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SiteHeader from "@/components/SiteHeader";
import BookFormDialog from "@/components/BookFormDialog";
import { GeneratedCover } from "@/components/Book3D";
import { apiDelete, apiGet, errorMessage } from "@/lib/api";
import type { AdminStats, Book } from "@/lib/types";
import { useMe } from "@/lib/library";
import { ClerkOnly } from "@/components/auth/clerkReady";
import { coverUrl } from "@/lib/types";

export default function Admin() {
  return (
    <ClerkOnly
      fallback={
        <div className="min-h-screen bg-mocha-base">
          <SiteHeader />
          <p className="p-10 text-mocha-white" data-testid="admin-loading">
            Carregando…
          </p>
        </div>
      }
    >
      <Show when="signed-in">
        <AdminGate />
      </Show>
      <Show when="signed-out">
        <Navigate to="/admin/login" replace />
      </Show>
    </ClerkOnly>
  );
}

function AdminGate() {
  const me = useMe();

  return (
    <div className="min-h-screen bg-mocha-base">
      <SiteHeader>
        <Link
          to="/"
          className="hidden items-center gap-1.5 text-sm text-mocha-white hover:text-mocha-text sm:flex"
          data-testid="admin-view-site-link"
        >
          Ver galeria <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <div data-testid="admin-user-button">
          <UserButton />
        </div>
      </SiteHeader>
      {me.isPending ? (
        <p className="p-10 text-mocha-white" data-testid="admin-loading">
          Verificando acesso…
        </p>
      ) : me.data?.is_admin ? (
        <Dashboard />
      ) : (
        <div className="mx-auto mt-24 max-w-md px-6 text-center" data-testid="admin-access-denied">
          <ShieldAlert className="mx-auto h-10 w-10 text-mocha-red" />
          <h1 className="mt-4 font-heading text-2xl text-mocha-text">Acesso restrito</h1>
          <p className="mt-2 text-sm text-mocha-white">
            {me.isError
              ? "Não foi possível verificar seu acesso agora."
              : "Esta conta não é administradora. Entre com o e-mail de administrador (verificado)."}
          </p>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<Book | null>(null);

  const books = useQuery({
    queryKey: ["books"],
    queryFn: () => apiGet<Book[]>("/books"),
  });
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => apiGet<AdminStats>("/admin/stats", await getToken()),
  });
  const list = books.data ?? [];
  const categories = [...new Set(list.map((b) => b.category))].sort();

  const remove = useMutation({
    mutationFn: async (b: Book) => apiDelete(`/admin/books/${b.id}`, await getToken()),
    onSuccess: () => {
      toast.success("Livro removido");
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setDeleting(null);
    },
    onError: (err) => toast.error(errorMessage(err, "Não foi possível remover")),
  });

  const statCards = [
    {
      label: "Livros",
      value: stats.data?.total_books,
      icon: BookMarked,
      color: "text-mocha-blue",
    },
    {
      label: "Categorias",
      value: stats.data?.total_categories,
      icon: Layers,
      color: "text-mocha-magenta",
    },
    {
      label: "Páginas",
      value: stats.data?.total_pages,
      icon: FileText,
      color: "text-mocha-green",
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mocha-white">
            Administração
          </p>
          <h1
            className="mt-1 font-heading text-3xl font-semibold tracking-tight text-mocha-text sm:text-4xl"
            data-testid="admin-dashboard-title"
          >
            Catálogo de livros
          </h1>
        </div>
        <Button
          size="lg"
          className="rounded-full px-5"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          data-testid="admin-add-book-btn"
        >
          <Plus /> Novo livro
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-mocha-surface bg-mocha-mantle p-4"
            data-testid={`admin-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            <s.icon className={`h-4 w-4 ${s.color}`} />
            <p className="mt-3 font-mono text-2xl text-mocha-text">{s.value ?? "–"}</p>
            <p className="text-xs uppercase tracking-wider text-mocha-white">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-mocha-surface bg-mocha-mantle">
        {list.length === 0 && !books.isPending ? (
          <div className="px-6 py-16 text-center" data-testid="admin-empty-state">
            <p className="font-heading text-xl text-mocha-text">Nenhum livro ainda</p>
            <p className="mt-1 text-sm text-mocha-white">
              Clique em “Novo livro” para enviar o primeiro PDF.
            </p>
          </div>
        ) : (
          <Table data-testid="admin-books-table">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">Capa</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden sm:table-cell">Páginas</TableHead>
                <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((b) => (
                <TableRow key={b.id} data-testid={`admin-book-row-${b.id}`}>
                  <TableCell>
                    <div className="h-14 w-10 overflow-hidden rounded-[2px_4px_4px_2px]">
                      {b.has_cover ? (
                        <img src={coverUrl(b)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div
                          className="h-full w-full scale-[0.25] origin-top-left"
                          style={{ width: 160, height: 224 }}
                        >
                          <GeneratedCover book={b} compact />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-mocha-text">{b.title}</p>
                    <p className="text-xs text-mocha-white">{b.author}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="rounded-full border border-mocha-surface1 px-2.5 py-0.5 text-xs">
                      {b.category}
                    </span>
                  </TableCell>
                  <TableCell className="hidden font-mono text-sm sm:table-cell">
                    {b.page_count}
                  </TableCell>
                  <TableCell className="hidden font-mono text-sm lg:table-cell">
                    {(b.size_bytes / 1024 / 1024).toFixed(1)} MB
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/livro/${b.id}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                        })}
                        aria-label="Abrir"
                        data-testid={`admin-open-book-${b.id}`}
                      >
                        <ExternalLink />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditing(b);
                          setFormOpen(true);
                        }}
                        aria-label="Editar"
                        data-testid={`admin-edit-book-${b.id}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-mocha-red hover:text-mocha-red"
                        onClick={() => setDeleting(b)}
                        aria-label="Excluir"
                        data-testid={`admin-delete-book-${b.id}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editing}
        categories={categories}
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent data-testid="delete-confirm-dialog">
          <DialogHeader>
            <DialogTitle>Excluir “{deleting?.title}”?</DialogTitle>
            <DialogDescription>
              O PDF e a capa deste livro serão apagados. Isso não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleting(null)}
              data-testid="delete-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting)}
              data-testid="delete-confirm-button"
            >
              Excluir livro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
