import React from "react";
export const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'destructive' }>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const v = { default: "bg-primary text-primary-foreground", secondary: "bg-secondary text-secondary-foreground", destructive: "bg-destructive text-destructive-foreground" };
    return <span ref={ref} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${v[variant]} ${className}`} {...props} />;
  });
Badge.displayName = "Badge";
