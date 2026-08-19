"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { useCart } from "@/features/cart/context/cart-context";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldCheck,
  MapPin,
  Truck,
  CreditCard,
  ArrowRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";

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
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutFlow />
    </AuthGuard>
  );
}

function CheckoutFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotalMinor, refreshCart } = useCart();

  const [addresses, setAddresses] = React.useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = React.useState(true);
  const [showAddressForm, setShowAddressForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [newAddress, setNewAddress] = React.useState({
    recipientName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  // Fetch addresses on mount
  React.useEffect(() => {
    fetch("/api/account/addresses")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAddresses(json.data);
          const defaultAddr = json.data.find((a: AddressItem) => a.isDefault) || json.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else {
            setShowAddressForm(true);
          }
        }
      })
      .finally(() => setLoadingAddresses(false));
  }, []);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAddresses((prev) => [...prev, json.data]);
        setSelectedAddressId(json.data.id);
        setShowAddressForm(false);
      }
    } catch {
      setErrorMsg("Failed to save new address.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMsg("Please select or add a delivery address.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const idempotencyKey = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
          idempotencyKey,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to place order.");
      }

      await refreshCart();
      router.push(`/checkout/confirmation?orderNumber=${json.data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while creating your order.");
      setSubmitting(false);
    }
  };

  const taxMinor = Math.round(subtotalMinor * 0.08);
  const totalMinor = subtotalMinor + taxMinor;

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <Package className="h-16 w-16 mx-auto text-foreground-subtle" />
        <h1 className="text-heading-2 font-bold text-foreground">Your Shopping Bag is Empty</h1>
        <p className="text-body-sm text-foreground-muted max-w-md mx-auto">
          Please select footwear silhouettes from our catalog before proceeding to express checkout.
        </p>
        <Link href="/shop">
          <Button variant="primary" size="md">
            Explore Collection
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-heading-1 font-bold text-foreground">Express Checkout</h1>
        <p className="text-body-sm text-foreground-muted">
          Authenticated customer order creation with immediate inventory reservation.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl border border-error/30 bg-error/10 text-error flex items-center gap-3 text-body-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Address Selection & Shipping (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Delivery Destination */}
          <section className="p-6 rounded-2xl border border-border bg-surface space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary text-background font-bold text-caption flex items-center justify-center">
                  1
                </div>
                <h2 className="text-heading-3 font-semibold text-foreground">
                  Delivery Destination
                </h2>
              </div>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="text-caption font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Address
                </button>
              )}
            </div>

            {loadingAddresses ? (
              <p className="text-body-sm text-foreground-muted">Loading addresses...</p>
            ) : showAddressForm ? (
              <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
                <h3 className="text-caption font-bold uppercase tracking-wider text-foreground-muted">
                  New Delivery Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Recipient Full Name"
                    value={newAddress.recipientName}
                    onChange={(e: any) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e: any) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Street Address Line 1"
                    value={newAddress.line1}
                    onChange={(e: any) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    placeholder="Apartment, Suite (Optional)"
                    value={newAddress.line2}
                    onChange={(e: any) => setNewAddress({ ...newAddress, line2: e.target.value })}
                    className="md:col-span-2"
                  />
                  <Input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e: any) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="State / Province"
                    value={newAddress.state}
                    onChange={(e: any) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e: any) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e: any) => setNewAddress({ ...newAddress, country: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowAddressForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Address
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-background-subtle hover:border-foreground-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-body-sm text-foreground">
                        {addr.recipientName}
                      </span>
                      {selectedAddressId === addr.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-caption text-foreground-muted leading-relaxed">
                      {addr.line1} {addr.line2 && `, ${addr.line2}`}<br />
                      {addr.city}, {addr.state} {addr.postalCode}<br />
                      {addr.country}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: Shipping Tier */}
          <section className="p-6 rounded-2xl border border-border bg-surface space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary text-background font-bold text-caption flex items-center justify-center">
                2
              </div>
              <h2 className="text-heading-3 font-semibold text-foreground">Fulfillment Tier</h2>
            </div>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <span className="text-body-sm font-semibold text-foreground block">
                    Complimentary White-Glove Courier
                  </span>
                  <span className="text-caption text-foreground-muted">
                    Estimated 2-4 business days dispatch
                  </span>
                </div>
              </div>
              <Badge variant="primary" size="sm">
                FREE
              </Badge>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Placement (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 sticky top-24">
            <h2 className="text-heading-3 font-semibold text-foreground">Order Summary</h2>

            {/* Line items preview */}
            <div className="divide-y divide-border/50 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.primaryImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-body-sm font-semibold text-foreground truncate">
                      {item.productName}
                    </h4>
                    <p className="text-caption text-foreground-muted">
                      {item.selectedSize.label || item.selectedSize.value} • {item.selectedColor.name} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-body-sm font-semibold text-foreground font-mono shrink-0">
                    {formatCurrency(item.unitPriceMinor * item.quantity, item.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-body-sm text-foreground-muted">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">{formatCurrency(subtotalMinor)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-foreground-muted">
                <span>Courier Dispatch</span>
                <span className="text-emerald-400 font-medium">Complimentary</span>
              </div>
              <div className="flex justify-between text-body-sm text-foreground-muted">
                <span>Estimated Tax (8%)</span>
                <span className="font-mono text-foreground">{formatCurrency(taxMinor)}</span>
              </div>
              <div className="flex justify-between text-heading-3 font-bold text-foreground pt-3 border-t border-border">
                <span>Total</span>
                <span className="font-mono text-primary">{formatCurrency(totalMinor)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddressId}
              className="w-full shadow-glow"
            >
              {submitting ? "Reserving Stock & Placing Order..." : "Confirm & Place Order"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-caption text-foreground-subtle">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Real-time stock reservation active</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
