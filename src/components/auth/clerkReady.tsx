import { createContext, useContext } from "react";

// True once <ClerkProvider> is mounted. Until then (or when auth is unreachable, e.g. the static
// preview with no backend) public pages still render — only Clerk-dependent widgets wait.
export const ClerkReadyContext = createContext(false);
export const useClerkReady = () => useContext(ClerkReadyContext);

export function ClerkOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return useClerkReady() ? <>{children}</> : <>{fallback}</>;
}
