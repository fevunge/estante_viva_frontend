import { Link } from "react-router-dom";
import { Show, UserButton } from "@clerk/react";
import { LayoutDashboard } from "lucide-react";
import { ClerkOnly } from "@/components/auth/clerkReady";
import { useMe } from "@/lib/library";

function AdminLink() {
  const me = useMe();
  if (!me.data?.is_admin) return null;
  return (
    <Link
      to="/admin"
      className="flex items-center gap-1.5 text-sm text-mocha-yellow transition-colors hover:text-mocha-text"
      data-testid="nav-admin-link"
    >
      <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Painel</span>
    </Link>
  );
}

/** Header account area: sign-in/sign-up for visitors, admin link + user menu for readers. */
export default function UserMenu() {
  return (
    <ClerkOnly>
      <Show when="signed-out">
        <Link
          to="/entrar"
          className="text-sm text-mocha-white transition-colors hover:text-mocha-text"
          data-testid="nav-sign-in-link"
        >
          Entrar
        </Link>
        <Link
          to="/sign-up"
          className="rounded-full bg-mocha-blue px-4 py-1.5 text-sm font-medium text-mocha-crust transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-mocha-blue/90"
          data-testid="nav-sign-up-link"
        >
          Criar conta
        </Link>
      </Show>
      <Show when="signed-in">
        <AdminLink />
        <div className="flex h-8 items-center" data-testid="nav-user-button">
          <UserButton />
        </div>
      </Show>
    </ClerkOnly>
  );
}
