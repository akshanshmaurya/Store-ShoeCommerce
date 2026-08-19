"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

interface OrderDetail {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: number;
  taxTotal: number;
  total: number;
  items: Array<{
    productName: string;
    sku: string;
    size: string;
    color: string;
    orderedQuantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl?: string | null;
  }>;
  shippingAddress: {
    recipientName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  placedAt: string;
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense
      fallback={
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-body-sm text-foreground-muted">Loading order confirmation...</p>
        </main>
      }
    >
      <OrderConfirmationContent />
    </React.Suspense>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = React.useState<OrderDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setOrder(json.data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-body-sm text-foreground-muted">Loading order confirmation...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <Package className="h-16 w-16 mx-auto text-foreground-subtle" />
        <h1 className="text-heading-2 font-bold text-foreground">Order Not Found</h1>
        <p className="text-body-sm text-foreground-muted">
          We could not locate this order. Please check your account order history.
        </p>
        <Link href="/account">
          <Button variant="primary" size="md">
            Go to Account
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* Success Hero */}
      <div className="p-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-surface flex flex-col sm:flex-row items-center gap-6">
        <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <Badge variant="primary" size="sm" className="bg-emerald-500 text-black mb-2">
            Order Created & Stock Reserved
          </Badge>
          <h1 className="text-heading-1 font-bold text-foreground">
            Thank You for Your Order
          </h1>
          <p className="text-body-sm text-foreground-muted">
            Order Reference: <span className="font-mono text-primary font-bold">{order.orderNumber}</span>
          </p>
        </div>
      </div>

      {/* Phase 11 Payment Notice */}
      <div className="p-6 rounded-xl border border-primary/30 bg-surface space-y-2">
        <div className="flex items-center gap-2 text-primary font-semibold text-body-sm">
          <Clock className="h-4 w-4" />
          <span>Next Step: Payment Settlement (Phase 11)</span>
        </div>
        <p className="text-caption text-foreground-muted leading-relaxed">
          Your inventory units are safely reserved. Live payment capture gateways (Razorpay/Stripe) will be integrated in Phase 11. Your order status is currently <span className="font-semibold text-foreground">Pending Payment</span>.
        </p>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered Items */}
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <h3 className="text-body font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Purchased Silhouettes
          </h3>
          <div className="divide-y divide-border/50">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-body-sm font-semibold text-foreground">
                    {item.productName}
                  </h4>
                  <p className="text-caption text-foreground-muted">
                    Size: {item.size} • {item.color} • Qty: {item.orderedQuantity}
                  </p>
                </div>
                <span className="text-body-sm font-semibold text-foreground font-mono">
                  {formatCurrency(item.lineTotal, order.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border flex justify-between font-bold text-foreground">
            <span>Total Authoritative Amount</span>
            <span className="font-mono text-primary">{formatCurrency(order.total, order.currency)}</span>
          </div>
        </div>

        {/* Shipping Address & Actions */}
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-body font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </h3>
            <p className="text-body-sm text-foreground-muted leading-relaxed">
              {order.shippingAddress.recipientName}<br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Link href="/account" className="w-full block">
              <Button variant="outline" size="md" className="w-full">
                View in Account Orders
              </Button>
            </Link>
            <Link href="/shop" className="w-full block">
              <Button variant="primary" size="md" className="w-full">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
