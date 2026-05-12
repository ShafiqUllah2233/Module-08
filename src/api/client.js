/**
 * Same-origin `/api` and `/uploads` (Vite proxies to Express in dev).
 */

const STORAGE_KEY = "g08_token";

export function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    typeof options.body === "object"
  ) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.body);
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String(data.error)
        : res.statusText;
    const err = new Error(message || "Request failed");
    err.status = res.status;
    if (typeof data === "object" && data && "details" in data) err.details = data.details;
    throw err;
  }
  return data;
}

export async function downloadEvidence(evId, fileName) {
  const token = getToken();
  const res = await fetch(`/api/evidence/${evId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try {
      const j = JSON.parse(text);
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg || "Download failed.");
  }
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName || `evidence-${evId}`;
  a.click();
  URL.revokeObjectURL(href);
}
