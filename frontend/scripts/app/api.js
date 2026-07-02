const STORAGE_KEYS = {
  token: "pj_token",
  user: "pj_user",
  apiBase: "pj_api_base",
};

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8005";

export function getApiBaseUrl() {
  const saved = localStorage.getItem(STORAGE_KEYS.apiBase);
  return (saved || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function setApiBaseUrl(url) {
  if (url) {
    localStorage.setItem(STORAGE_KEYS.apiBase, url.replace(/\/+$/, ""));
  }
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function setToken(token) {
  localStorage.setItem(STORAGE_KEYS.token, token);
}

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

function buildUrl(path, params = null) {
  const url = new URL(`${getApiBaseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    params,
    requiresAuth = false,
    headers = {},
  } = options;

  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined && body !== null) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("Please login first.");
    }
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: finalHeaders,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
  });

  const payload = await parseResponseBody(response);
  if (!response.ok) {
    const detail =
      (payload && payload.detail) ||
      (typeof payload === "string" ? payload : null) ||
      `Request failed (${response.status})`;

    if (response.status === 401) {
      clearSession();
    }
    throw new Error(detail);
  }

  return payload;
}

export async function registerUser(data) {
  return request("/auth/register", { method: "POST", body: data });
}

export async function loginUser(data) {
  const payload = await request("/auth/login", { method: "POST", body: data });
  setToken(payload.access_token);
  setUser({
    name: payload.name,
    email: payload.email,
    role: payload.role,
  });
  return payload;
}

export async function getProfile() {
  return request("/auth/profile", { requiresAuth: true });
}

export async function updateProfile(data) {
  return request("/auth/profile", {
    method: "PUT",
    requiresAuth: true,
    body: data,
  });
}

export async function getProducts(params = {}) {
  return request("/products", { params });
}

export async function getProductBySlug(slug) {
  return request(`/products/${encodeURIComponent(slug)}`);
}

export async function getProductRecommendations(productId) {
  return request(`/products/${productId}/recommendations`);
}

export async function searchProducts(q) {
  return request("/products/search/autocomplete", {
    params: { q },
  });
}

export async function getCart() {
  return request("/cart", { requiresAuth: true });
}

export async function addToCart(data) {
  return request("/cart", { method: "POST", requiresAuth: true, body: data });
}

export async function updateCartItem(itemId, quantity) {
  return request(`/cart/${itemId}`, {
    method: "PUT",
    requiresAuth: true,
    body: { quantity },
  });
}

export async function removeCartItem(itemId) {
  return request(`/cart/${itemId}`, {
    method: "DELETE",
    requiresAuth: true,
  });
}

export async function clearCart() {
  return request("/cart", { method: "DELETE", requiresAuth: true });
}

export async function createOrder(data) {
  return request("/orders", { method: "POST", requiresAuth: true, body: data });
}

export async function getOrders() {
  return request("/orders", { requiresAuth: true });
}

export async function validateCoupon(code) {
  return request("/offers/validate", { params: { code } });
}
