"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewToken, setPreviewToken] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        if (data.previewToken) {
          setPreviewToken(data.previewToken);
        }
      } else {
        setError(data.error || "Recovery request failed.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-surface-muted border border-border text-primary mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-display-md font-bold uppercase tracking-tight text-foreground">
            Password Recovery
          </h1>
          <p className="text-body-sm text-foreground-muted">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg border border-error/40 bg-error/10 flex items-center gap-2.5 text-caption text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-success/30 bg-success/10 text-success text-body-sm flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Reset Link Dispatched</p>
                <p className="text-caption opacity-90">
                  If an account is associated with <strong>{email}</strong>, you will receive instructions shortly.
                </p>
              </div>
            </div>

            {/* Development Environment Reset Link Shortcut */}
            {previewToken && (
              <div className="p-3.5 rounded-lg border border-primary/40 bg-primary/10 text-caption text-primary space-y-2">
                <p className="font-bold uppercase tracking-wider text-[11px]">
                  ⚡ Development Environment Preview Link:
                </p>
                <Link
                  href={`/reset-password?token=${previewToken}`}
                  className="block p-2 rounded bg-background text-foreground hover:text-primary font-mono text-[11px] break-all border border-border"
                >
                  /reset-password?token={previewToken}
                </Link>
              </div>
            )}

            <Link href="/login" className="block">
              <Button variant="outline" size="md" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <Mail className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full h-12 text-body font-bold"
            >
              {loading ? "Dispatching..." : "Send Reset Instructions"}
            </Button>

            <Link href="/login" className="block">
              <Button variant="ghost" size="sm" className="w-full text-caption">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Sign In
              </Button>
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
