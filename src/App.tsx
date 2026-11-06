import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import Admin from "@/pages/Admin";
import { AdminLogin, ReaderSignIn, ReaderSignUp } from "@/pages/AuthPages";

// Clerk wraps every route but never blocks public pages (see components/auth/clerkReady.tsx).
export default function App() {
  return (
    <ClerkAuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/livro/:id" element={<Reader />} />
        <Route path="/entrar/*" element={<ReaderSignIn />} />
        <Route path="/sign-up/*" element={<ReaderSignUp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login/*" element={<AdminLogin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster richColors />
    </ClerkAuthProvider>
  );
}
