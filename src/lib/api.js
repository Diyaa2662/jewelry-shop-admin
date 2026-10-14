export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("farfasha_admin_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("farfasha_admin_token", token);
  else localStorage.removeItem("farfasha_admin_token");
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    // لا نحط Content-Type لو FormData — المتصفح بيحطه تلقائياً مع boundary
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    setToken(null);
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
