import type { Category, Task, Note } from "@shared/schema";

const API_BASE = "/api";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<Category[]>("/categories"),
  getOne: (id: string) => fetchApi<Category>(`/categories/${id}`),
  create: (data: Omit<Category, "id">) => 
    fetchApi<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Omit<Category, "id">>) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/categories/${id}`, {
      method: "DELETE",
    }),
};

// Tasks API
export const tasksApi = {
  getAll: () => fetchApi<Task[]>("/tasks"),
  getOne: (id: string) => fetchApi<Task>(`/tasks/${id}`),
  create: (data: Omit<Task, "id">) =>
    fetchApi<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Omit<Task, "id">>) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/tasks/${id}`, {
      method: "DELETE",
    }),
};

// Notes API
export const notesApi = {
  getAll: () => fetchApi<Note[]>("/notes"),
  getOne: (id: string) => fetchApi<Note>(`/notes/${id}`),
  create: (data: Omit<Note, "id" | "updatedAt">) =>
    fetchApi<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Omit<Note, "id" | "updatedAt">>) =>
    fetchApi<Note>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/notes/${id}`, {
      method: "DELETE",
    }),
};
