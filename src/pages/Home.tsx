import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, BookOpen, FileText, Layers, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import Book3D from "@/components/Book3D";
import SiteHeader from "@/components/SiteHeader";
import UserMenu from "@/components/UserMenu";
import RecentShelf from "@/components/RecentShelf";
import { apiGet } from "@/lib/api";
import type { Book } from "@/lib/types";

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");

  const books = useQuery({
    queryKey: ["books"],
    queryFn: () => apiGet<Book[]>("/books"),
  });
  const all = books.isError ? [] : (books.data ?? []);
  const categories = useMemo(() => [...new Set(all.map((b) => b.category))].sort(), [all]);

  const filtered = all.filter((b) => {
    if (category && b.category !== category) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return [b.title, b.author, b.description].some((v) => v.toLowerCase().includes(s));
  });
  const featured = all.slice(0, 3);
  const open = (b: Book) => navigate(`/livro/${b.id}`);

  return (
    <div className="min-h-screen bg-mocha-base">
      <SiteHeader>
        <a
          href="#galeria"
          className="hidden text-sm text-mocha-white transition-colors hover:text-mocha-text sm:block"
          data-testid="nav-gallery-link"
        >
          Galeria
        </a>
        <UserMenu />
      </SiteHeader>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-mocha-surface">
        <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-mocha-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-mocha-magenta/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
          <div className="animate-float-in lg:col-span-6">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-mocha-surface1 bg-mocha-surface/50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-mocha-cyan"
              data-testid="hero-badge"
            >
              <Sparkles className="h-3.5 w-3.5" /> Galeria · Leitor · Estudos
            </span>
            <h1
              className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-mocha-text sm:text-5xl lg:text-6xl"
              data-testid="hero-title"
            >
              Uma estante para ler,
              <br />
              <span className="italic text-mocha-blue">entender</span> e{" "}
              <span className="italic text-mocha-magenta">lembrar</span>.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-mocha-white">
              Escolha um livro e leia o PDF aqui mesmo, sem cadastro. Crie uma conta grátis para
              anotar páginas, marcar trechos e continuar de onde parou.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#galeria"
                className={buttonVariants({ size: "lg" }) + " rounded-full px-6"}
                data-testid="hero-explore-button"
              >
                Explorar a galeria
              </a>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                {
                  icon: BookMarked,
                  label: "Livros",
                  value: books.data ? all.length : "–",
                  color: "text-mocha-yellow",
                },
                {
                  icon: FileText,
                  label: "Páginas",
                  value: books.data ? all.reduce((s, b) => s + b.page_count, 0) : "–",
                  color: "text-mocha-green",
                },
                {
                  icon: Layers,
                  label: "Categorias",
                  value: books.data ? categories.length : "–",
                  color: "text-mocha-magenta",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  data-testid={`hero-stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <dd className="mt-2 font-mono text-2xl text-mocha-text">{s.value}</dd>
                  <dt className="text-xs uppercase tracking-wider text-mocha-white">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="relative hidden h-[420px] lg:col-span-6 lg:block"
            data-testid="hero-showcase"
          >
            {featured.length > 0 ? (
              <div className="absolute inset-0 flex items-end justify-center gap-10 pb-10">
                {featured.map((b, i) => (
                  <div
                    key={b.id}
                    className="animate-drift"
                    style={{
                      animationDelay: `${i * 1.2}s`,
                      transform: `translateY(${i === 1 ? -30 : 0}px)`,
                    }}
                  >
                    <Book3D
                      book={b}
                      width={i === 1 ? 200 : 165}
                      onOpen={() => open(b)}
                      testId={`hero-book-${b.id}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-end justify-center gap-6 pb-10 opacity-60">
                {["#89b4fa", "#f5c2e7", "#94e2d5"].map((c, i) => (
                  <div
                    key={c}
                    className="animate-drift rounded-[2px_6px_6px_2px] shadow-2xl"
                    style={{
                      background: c,
                      width: i === 1 ? 190 : 150,
                      height: i === 1 ? 280 : 222,
                      animationDelay: `${i}s`,
                      transform: "rotateY(-14deg)",
                    }}
                  />
                ))}
              </div>
            )}
            <div className="shelf-plank absolute bottom-6 left-6 right-6" />
          </div>
        </div>
      </section>

      <RecentShelf />

      {/* Gallery */}
      <section id="galeria" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-mocha-white">
              A coleção
            </p>
            <h2
              className="mt-2 font-heading text-3xl font-semibold tracking-tight text-mocha-text sm:text-4xl"
              data-testid="gallery-title"
            >
              Galeria de livros
            </h2>
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha-white" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por título, autor ou tema…"
              className="h-11 rounded-full bg-mocha-mantle pl-10"
              data-testid="gallery-search-input"
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2" data-testid="category-filters">
            {["", ...categories].map((c) => (
              <button
                key={c || "all"}
                type="button"
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-[background-color,border-color,color] duration-200 ${
                  category === c
                    ? "border-mocha-blue bg-mocha-blue text-mocha-crust"
                    : "border-mocha-surface1 text-mocha-white hover:border-mocha-blue/60 hover:text-mocha-text"
                }`}
                data-testid={`category-filter-${c ? c.toLowerCase().replace(/\s+/g, "-") : "todas"}`}
              >
                {c || "Todas"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-12">
          {books.isPending ? (
            <div
              className="grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-3 lg:grid-cols-5"
              data-testid="gallery-loading"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="mx-auto h-[240px] w-[160px] animate-pulse rounded-md bg-mocha-surface"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed border-mocha-surface1 px-6 py-16 text-center"
              data-testid="gallery-empty-state"
            >
              <BookMarked className="mx-auto h-8 w-8 text-mocha-black" />
              <p className="mt-4 font-heading text-xl text-mocha-text">
                {all.length === 0 ? "A estante ainda está vazia" : "Nenhum livro encontrado"}
              </p>
              <p className="mt-2 text-sm text-mocha-white">
                {all.length === 0
                  ? "Os livros aparecerão aqui assim que o administrador publicá-los."
                  : "Tente outra busca ou categoria."}
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 gap-x-8 gap-y-16 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              data-testid="gallery-grid"
            >
              {filtered.map((b, i) => (
                <article
                  key={b.id}
                  className="group animate-float-in flex flex-col items-center"
                  style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}
                >
                  <div className="relative flex w-full flex-col items-center">
                    <Book3D book={b} onOpen={() => open(b)} />
                    <div className="shelf-plank mt-5 w-[85%]" />
                  </div>
                  <div className="mt-5 w-full max-w-[220px] text-center">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.18em]"
                      style={{
                        color: b.color === "#585b70" ? "#a6adc8" : b.color,
                      }}
                    >
                      {b.category}
                    </span>
                    <h3
                      className="mt-1 line-clamp-2 font-heading text-lg font-semibold leading-snug text-mocha-text"
                      data-testid={`book-title-${b.id}`}
                    >
                      {b.title}
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-mocha-white">{b.author}</p>
                    <Link
                      to={`/livro/${b.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-mocha-surface1 px-3.5 py-1.5 text-xs text-mocha-text transition-[background-color,border-color] duration-200 hover:border-mocha-blue hover:bg-mocha-blue/10"
                      data-testid={`book-read-button-${b.id}`}
                    >
                      <BookOpen className="h-3.5 w-3.5 text-mocha-blue" /> Ler & estudar ·{" "}
                      {b.page_count} p.
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-mocha-surface py-8 text-center text-xs text-mocha-black">
        Estante Viva · ambiente de estudos
      </footer>
    </div>
  );
}
