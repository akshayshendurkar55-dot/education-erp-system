"use client";

import { useSyncExternalStore } from "react";
import { getUser, AuthUser, AUTH_CHANGE_EVENT } from "./api";

function subscribeAuth(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    // Re-synchronize snapshot when auth-related keys change or storage is cleared
    if (!event.key || event.key === "user" || event.key === "token") {
      callback();
    }
  };

  const handleAuthChange = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  };
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

export function useCurrentUser(): AuthUser | null {
  return useSyncExternalStore(
    subscribeAuth,
    getUser,
    getServerSnapshot
  );
}
