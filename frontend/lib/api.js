const API = process.env.NEXT_PUBLIC_API_URL;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  
  const data = await res.json().catch(() => ({}));
  
  if (res.status === 401) {
    localStorage.clear();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Fadlan mar kale gal (Session expired)");
  }
  
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}