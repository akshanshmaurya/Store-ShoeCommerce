"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const { register, isAuthenticated } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [marketingOptIn, setMarketingOptIn] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your entries.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters in length.");
      return;
    }

    setLoading(true);

    const res = await register({
      firstName,
      lastName,
      email,
      password,
      marketingOptIn,
    });

    setLoading(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-lg space-y-8 p-8 rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-background font-bold text-xl mb-2 shadow-glow">
          V
        </div>
        <h1 className="text-display-md font-bold uppercase tracking-tight text-foreground">
          Create Client Account
        </h1>
        <p className="text-body-sm text-foreground-muted">
          Join the VELOCE Atelier for exclusive private allocations and bespoke sizing.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg border border-error/40 bg-error/10 flex items-center gap-2.5 text-caption text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                required
                placeholder="Alexander"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <UserIcon className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              placeholder="Veloce"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

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
              autoComplete="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Mail className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Lock className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-foreground-subtle hover:text-foreground p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <Lock className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer text-caption text-foreground-muted">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span>
              Receive priority private release notifications and biomechanical telemetry insights.
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full h-12 text-body font-bold mt-2 shadow-glow"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center text-body-sm text-foreground-muted pt-2 border-t border-border/50">
        Already registered?{" "}
        <Link
          href={`/login${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="text-primary font-semibold hover:underline"
        >
          Sign In Here →
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <React.Suspense fallback={<Skeleton className="w-full max-w-lg h-[540px] rounded-2xl" />}>
        <RegisterForm />
      </React.Suspense>
    </main>
  );
}
