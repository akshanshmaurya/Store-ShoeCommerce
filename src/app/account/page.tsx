"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  CheckCircle,
} from "lucide-react";

type AccountTab = "overview" | "profile" | "orders" | "addresses" | "wishlist" | "settings";

interface AddressItem {
  id: string;
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: string;
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountDashboard />
    </AuthGuard>
  );
}

function AccountDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState<AccountTab>("overview");
  const [loggingOut, setLoggingOut] = React.useState(false);

  // Address state
  const [addresses, setAddresses] = React.useState<AddressItem[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const [showAddressForm, setShowAddressForm] = React.useState(false);
  const [savingAddress, setSavingAddress] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState({
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  // Profile update state
  const [profileForm, setProfileForm] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    preferredSizeSystem: "US" as "US" | "UK" | "EU",
    preferredSizeValue: "10",
  });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [profileSuccess, setProfileSuccess] = React.useState(false);

  // Orders state
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.profile?.phone || "",
        preferredSizeSystem: user.profile?.preferredSizeSystem || "US",
        preferredSizeValue: user.profile?.preferredSizeValue || "10",
      });
    }
  }, [user]);

  // Fetch addresses & orders when tab opens
  React.useEffect(() => {
    if (activeTab === "addresses") {
      fetchAddresses();
    } else if (activeTab === "orders" || activeTab === "overview") {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch {
      // Graceful error
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    try {
      const res = await fetch(`/api/orders/${orderNumber}/cancel`, { method: "POST" });
      if (res.ok) {
        await fetchOrders();
      }
    } catch {
      // Error
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/account/addresses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAddresses(json.data);
      }
    } catch {
      // Graceful error
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddressForm(false);
        setAddressForm({
          recipientName: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: false,
        });
        await fetchAddresses();
      }
    } catch {
      // Error
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      // Error
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}/default`, { method: "POST" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      // Error
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const json = await res.json();
      if (json.success) {
        setProfileSuccess(true);
        if (refreshUser) await refreshUser();
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      // Error
    } finally {
      setSavingProfile(false);
    }
  };

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
            <Badge variant="primary" size="sm" className="text-[10px]">
              {addresses.length}
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
              Phase 9
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
                  <div className="text-heading-2 font-bold text-foreground font-mono">{orders.length}</div>
                  <span className="text-[11px] text-foreground-muted">
                    {orders.length === 0 ? "No historical purchases" : `${orders.length} orders recorded`}
                  </span>
                </div>

                <div className="p-5 rounded-xl border border-border bg-background-subtle space-y-1">
                  <span className="text-overline uppercase tracking-wider text-foreground-subtle">
                    Bespoke Size Profile
                  </span>
                  <div className="text-heading-2 font-bold text-primary font-mono">
                    {user.profile?.preferredSizeValue
                      ? `${user.profile?.preferredSizeSystem || "US"} ${user.profile?.preferredSizeValue}`
                      : "US 10"}
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

              <div className="p-6 rounded-xl border border-border bg-surface-muted/50 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold text-body-sm uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Phase 8 Authentication Active
                </div>
                <p className="text-caption text-foreground-muted leading-relaxed">
                  Your customer session is authenticated with cryptographically signed HttpOnly credentials. Your profile and saved addresses are synchronized directly with the database.
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

              {profileSuccess && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-body-sm font-medium">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  Your profile changes have been saved successfully.
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      First Name
                    </label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      Last Name
                    </label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      Email Address (Permanent)
                    </label>
                    <Input value={user.email} disabled className="opacity-60 cursor-not-allowed font-mono" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      Phone Number
                    </label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      Preferred Sizing System
                    </label>
                    <select
                      value={profileForm.preferredSizeSystem}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferredSizeSystem: e.target.value as "US" | "UK" | "EU",
                        })
                      }
                      className="w-full h-11 px-4 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="US">US Sizing</option>
                      <option value="UK">UK Sizing</option>
                      <option value="EU">EU Sizing</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-caption font-semibold uppercase tracking-wider text-foreground-muted block">
                      Preferred Size Value
                    </label>
                    <Input
                      value={profileForm.preferredSizeValue}
                      onChange={(e) => setProfileForm({ ...profileForm, preferredSizeValue: e.target.value })}
                      placeholder="e.g. 10.5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="primary" size="md" type="submit" disabled={savingProfile}>
                    {savingProfile ? "Saving Profile..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-heading-2 font-bold text-foreground">Saved Delivery Addresses</h2>
                  <p className="text-body-sm text-foreground-muted">
                    Manage dispatch locations for express checkout.
                  </p>
                </div>
                {!showAddressForm && (
                  <Button variant="primary" size="sm" onClick={() => setShowAddressForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleCreateAddress} className="p-6 rounded-xl border border-border bg-surface-muted/50 space-y-4">
                  <h3 className="text-body font-bold text-foreground">New Delivery Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Recipient Full Name"
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Contact Phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                    <Input
                      placeholder="Street Address Line 1"
                      value={addressForm.line1}
                      onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                      required
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="Apartment, Suite, Unit (Optional)"
                      value={addressForm.line2}
                      onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                      className="md:col-span-2"
                    />
                    <Input
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="State / Province"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Postal Code"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      required
                    />
                    <Input
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="isDefault" className="text-body-sm text-foreground">
                      Set as default delivery destination
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => setShowAddressForm(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit" disabled={savingAddress}>
                      {savingAddress ? "Saving..." : "Save Address"}
                    </Button>
                  </div>
                </form>
              ) : null}

              {loadingAddresses ? (
                <div className="py-12 text-center text-foreground-muted text-body-sm">
                  Loading addresses...
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 border border-dashed border-border rounded-xl">
                  <MapPin className="h-8 w-8 text-foreground-subtle" />
                  <p className="text-body-sm text-foreground-muted">No delivery addresses saved yet.</p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 rounded-xl border border-border bg-background-subtle relative space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{addr.recipientName}</span>
                        {addr.isDefault && (
                          <Badge variant="primary" size="sm">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-body-sm text-foreground-muted leading-relaxed">
                        {addr.line1} {addr.line2 && `, ${addr.line2}`}<br />
                        {addr.city}, {addr.state} {addr.postalCode}<br />
                        {addr.country}
                        {addr.phone && <><br /><span className="font-mono text-caption text-foreground-subtle">{addr.phone}</span></>}
                      </p>
                      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-caption font-semibold text-primary hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-caption font-semibold text-error hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-heading-2 font-bold text-foreground">Order History</h2>
                <p className="text-body-sm text-foreground-muted">
                  View and manage your footwear reservations and orders.
                </p>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center text-foreground-muted text-body-sm">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4 border border-dashed border-border rounded-xl">
                  <Package className="h-8 w-8 text-foreground-subtle" />
                  <p className="text-body-sm text-foreground-muted">No historical purchases yet.</p>
                  <Link href="/shop">
                    <Button variant="primary" size="sm">
                      Explore Catalog
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord: any) => (
                    <div key={ord.id} className="p-6 rounded-xl border border-border bg-background-subtle space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                        <div>
                          <span className="font-mono font-bold text-body-sm text-foreground block">
                            {ord.orderNumber}
                          </span>
                          <span className="text-caption text-foreground-muted">
                            Placed on {new Date(ord.placedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={ord.status === "cancelled" ? "outline" : "primary"}
                            size="sm"
                            className={ord.status === "cancelled" ? "text-error border-error/30" : ""}
                          >
                            {ord.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {ord.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {ord.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-body-sm">
                            <span className="text-foreground">
                              {item.productName} ({item.size} • {item.color}) x{item.orderedQuantity}
                            </span>
                            <span className="font-mono font-semibold text-foreground">
                              ${(item.lineTotal / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Total: <span className="font-mono text-primary">${(ord.total / 100).toFixed(2)}</span>
                        </span>
                        {ord.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(ord.orderNumber)}
                            className="text-error border-error/30 hover:bg-error/10 hover:border-error text-caption h-8"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  View your saved footwear pieces in the dedicated Wishlist page.
                </p>
              </div>
              <Link href="/wishlist">
                <Button variant="primary" size="sm">
                  Go to Wishlist
                </Button>
              </Link>
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
                    <span className="text-caption text-foreground-subtle block">Protected with scrypt encryption</span>
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
