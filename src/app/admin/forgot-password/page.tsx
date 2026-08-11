"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Always show success-style confirmation (no enumeration).
    } finally {
      setSubmitted(true);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          Forgot password
        </h1>
        {submitted ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              If an account exists for that email, a reset link has been sent.
              Check your inbox and spam folder.
            </p>
            <Link
              href="/admin/login"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your admin email and we&apos;ll send a reset link if an
              account exists.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {isLoading ? "Sending…" : "Send reset link"}
              </button>
            </form>
            <p className="mt-4 text-sm text-muted-foreground">
              <Link
                href="/admin/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
