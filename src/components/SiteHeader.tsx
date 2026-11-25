import { Link } from "react-router-dom";
import { BookOpenText } from "lucide-react";

export default function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-mocha-surface bg-mocha-base/85 backdrop-blur-xl"
      data-testid="site-header"
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" data-testid="brand-home-link">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-mocha-blue/15 text-mocha-blue transition-transform duration-300 group-hover:-rotate-6">
            <BookOpenText className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-tight text-mocha-text">
            Estante <em className="text-mocha-magenta">Viva</em>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-3">{children}</div>
      </div>
    </header>
  );
}
