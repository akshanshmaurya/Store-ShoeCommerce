import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Footprints, ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-surface-muted border border-border flex items-center justify-center text-primary shadow-glow">
        <Footprints className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-overline uppercase tracking-widest text-primary font-mono font-bold">
          Error 404 • Silhouette Not Found
        </span>
        <h1 className="text-display-md font-bold text-foreground tracking-tight">
          Shoe Model Unavailable
        </h1>
        <p className="text-body-sm text-foreground-muted leading-relaxed">
          The requested footwear model or variant URL does not exist in our active atelier catalog, or has been archived.
        </p>
      </div>

      <div className="pt-4 flex gap-4">
        <Link href="/shop">
          <Button variant="primary" size="md">
            Browse Footwear Catalog
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="md">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </main>
  );
}
