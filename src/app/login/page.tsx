"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
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
    setLoading(true);

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || "Authentication failed. Please check your credentials.");
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@veloce.com");
    setPassword("VelocePass123!");
    setError(null);
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-background font-bold text-xl mb-2 shadow-glow">
          V
        </div>
        <h1 className="text-display-md font-bold uppercase tracking-tight text-foreground">
          Customer Sign In
        </h1>
        <p className="text-body-sm text-foreground-muted">
          Access your bespoke footwear orders and preferences.
        </p>
      </div>

      {/* Demo Account Callout */}
      <div className="p-3 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-between text-caption text-primary">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Try demo client account: <strong>demo@veloce.com</strong></span>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="text-[11px] underline uppercase tracking-wider font-bold hover:text-primary-hover shrink-0 ml-2"
        >
          Auto-fill
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg border border-error/40 bg-error/10 flex items-center gap-2.5 text-caption text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
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
              autoComplete="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-background text-foreground text-body-sm placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <Mail className="h-4 w-4 text-foreground-subtle absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-body-sm font-semibold uppercase tracking-wider text-foreground block"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-caption text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full h-12 text-body font-bold mt-2"
        >
          {loading ? "Authenticating..." : "Sign In to Account"}
        </Button>
      </form>

      {/* Footer Link */}
      <div className="text-center text-body-sm text-foreground-muted pt-2 border-t border-border/50">
        New to VELOCE?{" "}
        <Link
          href={`/register${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="text-primary font-semibold hover:underline"
        >
          Create an Account →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <React.Suspense fallback={<Skeleton className="w-full max-w-md h-[460px] rounded-2xl" />}>
        <LoginForm />
      </React.Suspense>
    </main>
  );
}
