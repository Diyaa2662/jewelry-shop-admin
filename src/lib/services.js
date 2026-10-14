import { apiFetch } from "./api";

// 🔧 authService — معطّل مؤقتاً (Login ثابت بالفرونت حالياً)

export const productService = {
  // ===== Core =====
  getAll: () => apiFetch("/api/products"),
  getById: (id) => apiFetch(`/api/products/${id}`),

  // multipart/form-data — لإضافة منتج مع صور
  create: (formData) =>
    apiFetch("/api/products", {
      method: "POST",
      body: formData,
      // لا نضع Content-Type — المتصفح بيحدده تلقائياً مع boundary
      headers: {},
    }),

  update: (id, data) =>
    apiFetch(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id) => apiFetch(`/api/products/${id}`, { method: "DELETE" }),

  // ===== Status & Flags =====
  updateStatus: (id, status) =>
    apiFetch(`/api/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateFeatured: (id, value) =>
    apiFetch(`/api/products/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  updateMostSold: (id, value) =>
    apiFetch(`/api/products/${id}/most-sold`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  updateNewlyArrived: (id, value) =>
    apiFetch(`/api/products/${id}/newly-arrived`, {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }),

  bulkUpdateStatus: (productIds, status) =>
    apiFetch("/api/products/bulk-status", {
      method: "PATCH",
      body: JSON.stringify({ product_ids: productIds, status }),
    }),

  // ===== Images =====
  addImage: (productId, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiFetch(`/api/products/${productId}/images`, {
      method: "POST",
      body: fd,
      headers: {},
    });
  },

  removeImage: (productId, imageId) =>
    apiFetch(`/api/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    }),

  reorderImages: (productId, imageIds) =>
    apiFetch(`/api/products/${productId}/images/reorder`, {
      method: "PUT",
      body: JSON.stringify({ image_ids: imageIds }),
    }),

  retryEmbedding: (imageId) =>
    apiFetch(`/api/product-images/${imageId}/retry-embedding`, {
      method: "POST",
    }),
};

// ============ Categories ============
export const categoryService = {
  getAll: () => apiFetch("/api/categories"),
  getById: (id) => apiFetch(`/api/categories/${id}`),
  create: (data) =>
    apiFetch("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    apiFetch(`/api/categories/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (id) => apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
};

// ============ Materials ============
export const materialService = {
  getAll: () => apiFetch("/api/materials"),
  getById: (id) => apiFetch(`/api/materials/${id}`),
  create: (data) =>
    apiFetch("/api/materials", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiFetch(`/api/materials/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    apiFetch(`/api/materials/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  remove: (id) => apiFetch(`/api/materials/${id}`, { method: "DELETE" }),
};

// ============ Featured Categories ============
export const featuredCategoryService = {
  getAll: () => apiFetch("/api/featured-categories"),

  getById: (id) => apiFetch(`/api/featured-categories/${id}`),

  create: (categoryId, file) => {
    const fd = new FormData();
    fd.append("category_id", categoryId);
    if (file) fd.append("image", file);
    return apiFetch("/api/featured-categories", {
      method: "POST",
      body: fd,
      headers: {},
    });
  },

  update: (id, categoryId) =>
    apiFetch(`/api/featured-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ category_id: categoryId }),
    }),

  addImage: (id, file) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiFetch(`/api/featured-categories/${id}/image`, {
      method: "POST",
      body: fd,
      headers: {},
    });
  },

  removeImage: (id) =>
    apiFetch(`/api/featured-categories/${id}/image`, { method: "DELETE" }),

  remove: (id) =>
    apiFetch(`/api/featured-categories/${id}`, { method: "DELETE" }),
};
