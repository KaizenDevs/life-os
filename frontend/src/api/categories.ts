import { apiFetch } from "./client";
import type { Category } from "../types";

export const fetchCategories = () =>
  apiFetch<{ data: Category[] }>("/categories");

export const createCategory = (name: string) =>
  apiFetch<{ data: Category }>("/categories", {
    method: "POST",
    body: JSON.stringify({ category: { name } }),
  });

export const updateCategory = (id: number, name: string) =>
  apiFetch<{ data: Category }>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ category: { name } }),
  });

export const deleteCategory = (id: number) =>
  apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
