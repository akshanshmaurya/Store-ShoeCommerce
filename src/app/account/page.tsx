"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  Package,
} from "lucide-react";

type AccountTab = "overview" | "profile" | "orders" | "addresses" | "wishlist" | "settings";

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountDashboard />
    </AuthGuard>
  );
}

function AccountDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<AccountTab>("overview");
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  if (!user) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
      {/* Header Banner */}
      <div className="p-8 rounded-2xl border border-border bg-gradient-to-r from-surface to-background flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-primary text-background font-bold text-2xl flex items-center justify-center shadow-glow">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-heading-1 font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h1>
              <Badge variant="primary" size="sm">
                Active Client
              </Badge>
            </div>
            <p className="text-body-sm text-foreground-muted font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="border-border hover:border-error/50 hover:text-error"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>

      {/* Account Grid Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 rounded-xl border border-border bg-surface p-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <UserIcon className="h-4 w-4" />
              Account Overview
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              Personal Profile
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="h-4 w-4" />
              Order History
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] uppercase">
              Phase 5
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "addresses"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <MapPin className="h-4 w-4" />
              Saved Addresses
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] uppercase">
              Phase 5
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "wishlist"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className="h-4 w-4" />
              Saved Wishlist
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] uppercase">
              Phase 5
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-body-sm font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-primary text-background shadow-glow"
                : "text-foreground-muted hover:text-foreground hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              Security & Settings
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
        </aside>

        {/* Content Area (9 cols) */}
        <div className="lg:col-span-9 rounded-2xl border border-border bg-surface p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-heading-2 font-bold text-foreground">
                  Welcome Back, {user.firstName}
                </h2>
                <p className="text-body-sm text-foreground-muted">
                  Client ID: <span className="font-mono text-foreground">{user.id}</span>
                </p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-border bg-background-subtle space-y-1">
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle">
                    Total Orders
                  </span>
                  <div className="text-heading-2 font-bold text-foreground font-mono">0</div>
                  <span className="text-[11px] text-foreground-muted">No historical purchases</span>
                </div>

                <div className="p-5 rounded-xl border border-border bg-background-subtle space-y-1">
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle">
                    Bespoke Size Profile
                  </span>
                  <div className="text-heading-2 font-bold text-primary font-mono">
                    {user.profile.preferredSizeValue
                      ? `${user.profile.preferredSizeSystem || "US"} ${user.profile.preferredSizeValue}`
                      : "US 10.5"}
                  </div>
                  <span className="text-[11px] text-foreground-muted">Tailored recommendations</span>
                </div>

                <div className="p-5 rounded-xl border border-border bg-background-subtle space-y-1">
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle">
                    Atelier Membership
                  </span>
                  <div className="text-heading-2 font-bold text-foreground">Founder Tier</div>
                  <span className="text-[11px] text-emerald-400">● Priority Allocations</span>
                </div>
              </div>

              {/* Quick Info Box */}
              <div className="p-6 rounded-xl border border-border bg-surface-muted/50 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-body-sm uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Phase 3 Authentication Active
                </div>
                <p className="text-caption text-foreground-muted leading-relaxed">
                  Your customer session is authenticated with cryptographically signed HttpOnly credentials. In upcoming phases, your cart, saved wishlist, and checkout orders will automatically synchronize with this account.
                </p>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-heading-2 font-bold text-foreground">Personal Profile</h2>
                <p className="text-body-sm text-foreground-muted">
                  Manage your personal details and footwear sizing preferences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    First Name
                  </span>
                  <span className="text-body font-semibold text-foreground">{user.firstName}</span>
                </div>
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    Last Name
                  </span>
                  <span className="text-body font-semibold text-foreground">{user.lastName}</span>
                </div>
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    Email Address
                  </span>
                  <span className="text-body font-mono text-foreground">{user.email}</span>
                </div>
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    Phone Number
                  </span>
                  <span className="text-body text-foreground">
                    {user.profile.phone || "+1 (555) 019-2834"}
                  </span>
                </div>
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    Preferred Sizing
                  </span>
                  <span className="text-body text-primary font-semibold">
                    {user.profile.preferredSizeSystem || "US"} {user.profile.preferredSizeValue || "10.5"}
                  </span>
                </div>
                <div>
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle block mb-1">
                    Account Created
                  </span>
                  <span className="text-body text-foreground font-mono text-caption">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted">
                <Package className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-heading-3 font-semibold text-foreground">
                  Order History & Fulfillment Tracking
                </h3>
                <p className="text-body-sm text-foreground-muted leading-relaxed">
                  Transactional orders, live courier tracking, and return requests will activate in Phase 5.
                </p>
              </div>
              <Badge variant="outline" size="sm">
                Roadmap: Phase 5 Commerce Workflow
              </Badge>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted">
                <MapPin className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-heading-3 font-semibold text-foreground">
                  Saved Delivery Addresses
                </h3>
                <p className="text-body-sm text-foreground-muted leading-relaxed">
                  Address book management and default dispatch locations will be enabled during the checkout phase.
                </p>
              </div>
              <Badge variant="outline" size="sm">
                Roadmap: Phase 5 Checkout & Addresses
              </Badge>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted">
                <Heart className="h-8 w-8" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-heading-3 font-semibold text-foreground">
                  Curated Wishlist
                </h3>
                <p className="text-body-sm text-foreground-muted leading-relaxed">
                  Persistent wishlist synchronization across devices will be integrated in Phase 5.
                </p>
              </div>
              <Badge variant="outline" size="sm">
                Roadmap: Phase 5 Wishlist Persistence
              </Badge>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-heading-2 font-bold text-foreground">Security Settings</h2>
                <p className="text-body-sm text-foreground-muted">
                  Update credentials and active session preferences.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-border max-w-md">
                <div className="p-4 rounded-xl border border-border bg-background-subtle flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-body-sm font-semibold text-foreground">Password</span>
                    <span className="text-caption text-foreground-subtle block">Last updated recently</span>
                  </div>
                  <Link href="/forgot-password">
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </Link>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-error border-error/30 hover:bg-error/10 hover:border-error"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loggingOut ? "Signing Out..." : "Sign Out of All Devices"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
