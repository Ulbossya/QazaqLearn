export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface Session {
  accessToken: string;
  tokenType: "Bearer";
  userId: string;
  role: Role;
  preferredLanguage: "ru" | "kz";
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000/api/v1" : "/api/v1");

export function getToken() {
  return localStorage.getItem("qazaqlearn.token");
}

export function setSession(session: Session) {
  localStorage.setItem("qazaqlearn.token", session.accessToken);
  localStorage.setItem("qazaqlearn.role", session.role);
  localStorage.setItem("qazaqlearn.language", session.preferredLanguage);
}

export function clearSession() {
  localStorage.removeItem("qazaqlearn.token");
  localStorage.removeItem("qazaqlearn.role");
}

export function getRole(): Role | null {
  return localStorage.getItem("qazaqlearn.role") as Role | null;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearSession();
    window.location.assign("/login");
  }
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error?.messageRu || "API error");
  }
  return payload.data as T;
}

export function roleDashboard(role: Role | null) {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  return "/student";
}
