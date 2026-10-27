/**
 * Centralized API Client & Authentication Helpers for Education ERP
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AUTH_CHANGE_EVENT = "education-erp-auth-change";

export function dispatchAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function isTokenValid(token: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return false;
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return false;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload || typeof payload !== "object") {
      return false;
    }

    if (typeof payload.exp === "number") {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (nowSeconds >= payload.exp) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      if (token && typeof token === "string" && token !== "undefined" && token !== "null" && token.trim() !== "") {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.error("Failed to store token in localStorage:", err);
    }
    dispatchAuthChange();
  }
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export interface Student {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  course: string;
}

export interface Teacher {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  subject: string;
}

export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  duration: string;
  fees: number;
}

export interface Exam {
  id: number;
  exam_name: string;
  course_name: string;
  exam_date: string;
  total_marks: number;
}

export interface FeeRecord {
  id: number;
  student_name: string;
  roll_no: string;
  course_name: string;
  total_fees: number | string;
  paid_amount: number | string;
  remaining_amount: number | string;
  payment_date: string;
  payment_mode: string;
  status: string;
}

export interface DashboardStats {
  students: number;
  teachers: number;
  courses: number;
  exams: number;
  fees: number;
  pendingFees: number;
}

export function isUserValid(user: unknown): user is AuthUser {
  if (!user || typeof user !== "object") return false;
  const u = user as Partial<AuthUser>;
  return Boolean(
    typeof u.username === "string" &&
    u.username.trim() !== "" &&
    u.username !== "undefined" &&
    u.username !== "null"
  );
}

let cachedUserRaw: string | null = null;
let cachedUserObj: AuthUser | null = null;

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null" || raw.trim() === "") {
      cachedUserRaw = null;
      cachedUserObj = null;
      return null;
    }
    if (raw !== cachedUserRaw) {
      cachedUserRaw = raw;
      const parsed = JSON.parse(raw);
      if (isUserValid(parsed)) {
        cachedUserObj = parsed;
      } else {
        cachedUserObj = null;
      }
    }
  } catch {
    cachedUserRaw = null;
    cachedUserObj = null;
  }
  return cachedUserObj;
}

export function setUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    try {
      if (isUserValid(user)) {
        const raw = JSON.stringify(user);
        localStorage.setItem("user", raw);
        cachedUserRaw = raw;
        cachedUserObj = user;
      } else {
        localStorage.removeItem("user");
        cachedUserRaw = null;
        cachedUserObj = null;
      }
    } catch (err) {
      console.error("Failed to store user in localStorage:", err);
    }
    dispatchAuthChange();
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      cachedUserRaw = null;
      cachedUserObj = null;
    } catch (err) {
      console.error("Failed to clear auth from localStorage:", err);
    }
    dispatchAuthChange();
  }
}

export function hasValidSession(): boolean {
  if (typeof window === "undefined") return false;
  const token = getToken();
  const user = getUser();
  const isValid = Boolean(token && user && user.username);

  // If storage is in an inconsistent partial state (e.g. token exists without user, or user exists without token), clean it up
  if (!isValid) {
    try {
      const rawToken = localStorage.getItem("token");
      const rawUser = localStorage.getItem("user");
      if (rawToken || rawUser) {
        removeToken();
      }
    } catch {
      // Ignore localStorage access errors
    }
  }

  return isValid;
}

export function logout(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

interface ApiFetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export interface ApiResponseData {
  message?: string;
  [key: string]: unknown;
}

export async function apiFetch<T = ApiResponseData>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<{ ok: boolean; status: number; data: T; message?: string }> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  // Add JSON Content-Type if body is stringified and not FormData
  if (rest.body && typeof rest.body === "string" && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Attach JWT Bearer Token
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });

    let data: unknown = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    // Handle 401 Unauthorized globally
    if (response.status === 401 && requiresAuth) {
      console.warn("Session expired or unauthorized request. Redirecting to login.");
      removeToken();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    const typedData = data as Record<string, unknown> | null;
    const message = typeof typedData?.message === "string" ? typedData.message : undefined;

    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      message,
    };
  } catch (error: unknown) {
    console.error(`API request error on ${url}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Network error. Please verify the backend is running.";
    return {
      ok: false,
      status: 0,
      data: null as unknown as T,
      message: errorMessage,
    };
  }
}
