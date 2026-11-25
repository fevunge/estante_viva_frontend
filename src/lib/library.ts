import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPost, apiPut, errorMessage } from "@/lib/api";
import type { Bookmark, Me, Note, Progress, RecentBook } from "@/lib/types";

// Signed-in reader data. Must be used inside <ClerkProvider> (wrap callers in <ClerkOnly>).

export function useMe() {
  const { getToken, isSignedIn, userId } = useAuth();
  return useQuery({
    queryKey: ["me", userId],
    queryFn: async () => apiGet<Me>("/me", await getToken()),
    enabled: !!isSignedIn,
    retry: 1,
  });
}

export function useRecent() {
  const { getToken, isSignedIn, userId } = useAuth();
  return useQuery({
    queryKey: ["recent", userId],
    queryFn: async () => apiGet<RecentBook[]>("/me/recent", await getToken()),
    enabled: !!isSignedIn,
  });
}

export function useProgress(bookId: string) {
  const { getToken, isSignedIn, userId } = useAuth();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["progress", userId, bookId],
    queryFn: async () => apiGet<Progress | null>(`/me/progress/${bookId}`, await getToken()),
    enabled: !!isSignedIn,
    staleTime: Infinity,
  });
  const save = useMutation({
    mutationFn: async (v: { page: number; total_pages: number }) =>
      apiPut<Progress>(`/me/progress/${bookId}`, v, await getToken()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recent", userId] }),
  });
  return { query, save };
}

export function useNotes(bookId: string) {
  const { getToken, userId } = useAuth();
  const qc = useQueryClient();
  const key = ["notes", userId, bookId];
  const list = useQuery({
    queryKey: key,
    queryFn: async () => apiGet<Note[]>(`/me/books/${bookId}/notes`, await getToken()),
  });
  const done = (msg: string) => () => {
    qc.invalidateQueries({ queryKey: key });
    toast.success(msg);
  };
  const fail = (err: unknown) => toast.error(errorMessage(err, "Não foi possível salvar"));
  const create = useMutation({
    mutationFn: async (v: { page: number; text: string }) =>
      apiPost<Note>(`/me/books/${bookId}/notes`, v, await getToken()),
    onSuccess: done("Anotação salva"),
    onError: fail,
  });
  const update = useMutation({
    mutationFn: async (v: { id: string; text: string }) =>
      apiPut<Note>(`/me/notes/${v.id}`, { text: v.text }, await getToken()),
    onSuccess: done("Anotação atualizada"),
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => apiDelete(`/me/notes/${id}`, await getToken()),
    onSuccess: done("Anotação apagada"),
    onError: fail,
  });
  return { list, create, update, remove };
}

export function useBookmarks(bookId: string) {
  const { getToken, userId } = useAuth();
  const qc = useQueryClient();
  const key = ["bookmarks", userId, bookId];
  const list = useQuery({
    queryKey: key,
    queryFn: async () => apiGet<Bookmark[]>(`/me/books/${bookId}/bookmarks`, await getToken()),
  });
  const fail = (err: unknown) => toast.error(errorMessage(err, "Não foi possível salvar"));
  const create = useMutation({
    mutationFn: async (v: { page: number; label?: string }) =>
      apiPost<Bookmark>(`/me/books/${bookId}/bookmarks`, v, await getToken()),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: key });
      toast.success(`Página ${b.page} marcada`);
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => apiDelete(`/me/bookmarks/${id}`, await getToken()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success("Marcador removido");
    },
    onError: fail,
  });
  return { list, create, remove };
}
