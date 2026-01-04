"use client";
import { useState } from "react";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CategoryChips() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card text-foreground/70 border border-border hover:border-primary/30 hover:text-primary",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
