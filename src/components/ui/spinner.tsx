import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      aria-label="Loading"
    />
  );
}

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export function LoadingSpinner({ text = "Loading...", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 py-8", className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
