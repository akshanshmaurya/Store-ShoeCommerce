"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing password reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Password reset failed.");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-surface-muted border border-border text-primary mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-display-md font-bold uppercase tracking-tight text-foreground">
          Set New Password
        </h1>
        <p className="text-body-sm text-foreground-muted">
          Create a secure password for your VELOCE account.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg border border-error/40 bg-error/10 flex items-center gap-2.5 text-caption text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-6 text-center">
          <div className="p-4 rounded-xl border border-success/30 bg-success/10 text-success text-body-sm flex flex-col items-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="font-semibold text-foreground">Password Successfully Updated</p>
            <p className="text-caption text-foreground-muted">
              Your credentials have been securely updated. You can now sign in.
            </p>
          </div>

          <Link href="/login" className="block">
            <Button variant="primary" size="lg" className="w-full h-12 font-bold">
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Lock className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-foreground-subtle hover:text-foreground p-0.5"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Lock className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full h-12 text-body font-bold mt-2"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <React.Suspense fallback={<Skeleton className="w-full max-w-md h-[400px] rounded-2xl" />}>
        <ResetPasswordForm />
      </React.Suspense>
    </main>
  );
}
