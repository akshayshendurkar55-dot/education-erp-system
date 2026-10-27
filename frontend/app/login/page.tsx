"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, hasValidSession, setToken, setUser, type AuthUser } from "../../lib/api";
import { AlertCircleIcon, CheckIcon, ShieldCheckIcon } from "../components/Icons";

interface LoginResponse {
  token?: string;
  user?: AuthUser;
  message?: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only redirect to dashboard if there is a complete, valid authenticated session
    if (hasValidSession()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const { ok, data, message } = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (ok && data?.token && data?.user) {
        setToken(data.token);
        setUser(data.user);
        router.push("/dashboard");
      } else {
        setError(message || data?.message || "Invalid Username or Password.");
      }
    } catch {
      setError("Server connection failure. Please ensure the backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px",
      }}
    >
      <div
        className="erp-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px 32px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              backgroundColor: "#1e3a8a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              margin: "0 auto 14px auto",
              boxShadow: "0 4px 6px -1px rgba(30, 58, 138, 0.3)",
            }}
          >
            🎓
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f172a",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Education ERP Portal
          </h1>
          <p style={{ color: "#64748b", margin: "6px 0 0 0", fontSize: "14px" }}>
            College Administration & Management System
          </p>
        </div>

        {/* Security Notice */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            color: "#1d4ed8",
            fontWeight: 500,
          }}
        >
          <ShieldCheckIcon size={16} />
          <span>Secure Administrative Access Only</span>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "12px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <AlertCircleIcon size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "18px" }}>
            <label
              htmlFor="login-username"
              className="erp-label erp-label-required"
            >
              Username / Administrator ID
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="erp-input"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label
                htmlFor="login-password"
                className="erp-label erp-label-required"
              >
                Account Password
              </label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="erp-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="erp-btn erp-btn-primary"
            style={{
              width: "100%",
              padding: "11px",
              fontSize: "15px",
            }}
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <CheckIcon size={16} />
                <span>Sign In to Administration Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Institutional System Notice */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "18px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
            Authorized administrative access only. Please contact the campus IT Department for credentials.
          </span>
        </div>
      </div>

      {/* Footer System Disclaimer */}
      <footer style={{ marginTop: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
        Education ERP • College Management Information System • Version 2.0
      </footer>
    </div>
  );
}