import { apiFetch } from "./api";

export const productService = {
  getAll: () => apiFetch("/products"),
  getById: (id) => apiFetch(`/products/${id}`),
  create: (data) =>
    apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/products/${id}`, { method: "DELETE" }),
};

export const categoryService = {
  getAll: () => apiFetch("/categories"),
  create: (data) =>
    apiFetch("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) => apiFetch(`/categories/${id}`, { method: "DELETE" }),
};

export const materialService = {
  getAll: () => apiFetch("/materials"),
  create: (data) =>
    apiFetch("/materials", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiFetch(`/materials/${id}`, { method: "DELETE" }),
};
