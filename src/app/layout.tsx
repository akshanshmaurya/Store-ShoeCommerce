import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";
import { WishlistProvider } from "@/features/wishlist/context/wishlist-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/features/cart/components/cart-drawer";

export const metadata: Metadata = {
  title: "VELOCE Footwear | Engineered Luxury & Performance",
  description: "Bespoke Italian leather sneakers and carbon-plated marathon footwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary selection:text-background">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <div className="flex-1 flex flex-col">{children}</div>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
