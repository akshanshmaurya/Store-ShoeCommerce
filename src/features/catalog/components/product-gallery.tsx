"use client";

import * as React from "react";
import Image from "next/image";
import { ProductMedia } from "../types";
import { Badge } from "@/components/ui/badge";

export interface ProductGalleryProps {
  media: ProductMedia[];
  productName: string;
}

export function ProductGallery({ media, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });

  const activeMedia = media[selectedIndex] || media[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (!media || media.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-surface-muted rounded-xl flex items-center justify-center text-foreground-subtle border border-border">
        No imagery available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnail Selector Column */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[640px] scrollbar-none py-1 md:py-0 md:w-24 shrink-0">
        {media.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[3/4] w-16 md:w-full rounded-lg overflow-hidden border transition-all duration-200 shrink-0 bg-surface ${
                isSelected
                  ? "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                  : "border-border hover:border-foreground-muted/60 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={item.url}
                alt={item.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover object-center"
              />
            </button>
          );
        })}
      </div>

      {/* Main Active Viewport */}
      <div className="relative flex-1 aspect-[3/4] rounded-xl overflow-hidden bg-surface border border-border">
        {activeMedia && (
          <div
            className="relative w-full h-full cursor-crosshair overflow-hidden"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={activeMedia.url}
              alt={activeMedia.altText || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover object-center transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Media Role Badge (e.g. DETAIL, SOLE, LIFESTYLE) */}
            {activeMedia.role && activeMedia.role !== "PRIMARY" && (
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <Badge variant="outline" size="sm" className="bg-background/80 backdrop-blur">
                  {activeMedia.role} VIEW
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
