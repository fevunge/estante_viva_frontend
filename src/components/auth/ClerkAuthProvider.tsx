import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/ui/themes";
import { ptBR } from "@clerk/localizations";
import { ClerkReadyContext } from "@/components/auth/clerkReady";

const appearance = {
  theme: dark,
  captcha: { theme: "dark" as const },
  variables: {
    colorPrimary: "#89b4fa",
    colorPrimaryForeground: "#11111b",
    colorBackground: "#181825",
    colorForeground: "#cdd6f4",
    colorInput: "#313244",
    colorInputForeground: "#cdd6f4",
    colorBorder: "#45475a",
    fontFamily: "'Plus Jakarta Sans Variable', system-ui, sans-serif",
    borderRadius: "0.6rem",
  },
};

interface ClerkConfig {
  enabled: boolean;
  publishable_key: string;
  proxy_url: string;
}

// Starts Clerk from the backend's runtime config, so deploy's live keys need no rebuild.
// Children always render; Clerk widgets are gated by ClerkReadyContext (see clerkReady.tsx).
export default function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ClerkConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (attempt = 0) => {
      try {
        const cfg = (await (await fetch(`/api/clerk/config`)).json()) as ClerkConfig;
        if (cfg.enabled) {
          if (!cancelled) setConfig(cfg);
          return;
        }
      } catch {
        /* retry below */
      }
      if (cancelled || attempt >= 20) return;
      setTimeout(() => load(attempt + 1), 1500);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config)
    return <ClerkReadyContext.Provider value={false}>{children}</ClerkReadyContext.Provider>;
  return (
    <ClerkProvider
      publishableKey={config.publishable_key}
      proxyUrl={config.proxy_url || undefined}
      appearance={appearance}
      localization={ptBR}
      routerPush={(to: string) => navigate(to)}
      routerReplace={(to: string) => navigate(to, { replace: true })}
      signInUrl="/entrar"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
    >
      <ClerkReadyContext.Provider value={true}>{children}</ClerkReadyContext.Provider>
    </ClerkProvider>
  );
}
