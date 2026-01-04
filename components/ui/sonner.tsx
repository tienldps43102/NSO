import React from "react";
import {
  CircleCheckIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  InfoIcon,
  Loader2Icon,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:rounded-lg group-[.toaster]:shadow-card group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:hover:bg-primary/90 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground group-[.toast]:hover:bg-secondary/80 group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:transition-colors",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border group-[.toast]:border-border group-[.toast]:text-foreground group-[.toast]:hover:bg-accent",
          success: "group-[.toast]:text-primary",
          error: "group-[.toast]:text-destructive",
          warning: "group-[.toast]:text-amber-500",
          info: "group-[.toast]:text-blue-500",
        },
      }}
      {...props}
    />
  );
};
