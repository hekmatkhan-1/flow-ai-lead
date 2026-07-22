import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type BadgeVariant =
  | "default"
  | "hot"
  | "warm"
  | "cold"
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "closed";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  hot: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  warm: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  cold: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400",
  contacted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400",
  qualified:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400",
  converted:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Map a numeric lead score to a badge variant */
export function scoreToBadgeVariant(score: number): BadgeVariant {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "cold";
}

/** Map a numeric lead score to a human-readable label */
export function scoreLabel(score: number): string {
  if (score >= 80) return "Hot";
  if (score >= 50) return "Warm";
  return "Cold";
}

/** Map lead status to badge variant */
export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "new":
      return "new";
    case "contacted":
      return "contacted";
    case "qualified":
      return "qualified";
    case "converted":
      return "converted";
    case "closed":
      return "closed";
    default:
      return "default";
  }
}
