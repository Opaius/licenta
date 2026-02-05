import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  showPassword,
  ...props
}: React.ComponentProps<"input"> & { showPassword?: boolean }) {
  const [isVisible, setIsVisible] = React.useState(false);

  // Standard input classes
  const baseClasses = cn(
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    className,
  );

  if (showPassword) {
    return (
      <div className="relative w-full">
        <input
          type={isVisible ? "text" : "password"}
          data-slot="input"
          className={cn(baseClasses, "pr-9")} // Add padding-right so text doesn't hide behind icon
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className="text-muted-foreground/80 hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 outline-none transition-colors"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }

  return (
    <input type={type} data-slot="input" className={baseClasses} {...props} />
  );
}

export { Input };
