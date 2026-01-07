"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductDetail {
  label: string;
  value: string;
}

interface ProductDetailsProps {
  description: string;
}

export function ProductDetails({ description }: ProductDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="space-y-6">
      {/* Description */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Mô tả sản phẩm</h3>
        <div className="relative">
          <div
            className={cn(
              "prose prose-sm max-w-none text-muted-foreground transition-all duration-300",
              !isExpanded && "max-h-32 overflow-hidden",
            )}
          >
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>

          {/* Gradient overlay when collapsed */}
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background to-transparent" />
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary/80 gap-1 -mt-2"
        >
          {isExpanded ? (
            <>
              Thu gọn <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Xem thêm <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Details Table */}
    </section>
  );
}
