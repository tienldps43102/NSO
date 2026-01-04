"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function ProductGallery({ images, title, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = images.slice(0, 4);
  const remainingCount = images.length - 4;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Main Image */}
      <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-muted group">
        <img
          src={images[activeIndex]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
      </div>

      {/* Thumbnail List */}
      <div className="flex gap-3">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200",
              activeIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50",
            )}
          >
            <img
              src={image}
              alt={`${title} - Ảnh ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}

        {/* Additional Images Placeholder */}
        {remainingCount > 0 && (
          <button className="w-20 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors">
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">+{remainingCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
