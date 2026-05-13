import React from "react";
export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive' | 'secondary'; size?: 'sm' | 'lg' | 'icon' }>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const variants = { default: "bg-black text-white hover:bg-black/90", outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground", destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90", secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80" };
    const sizes = { sm: "h-9 rounded-md px-3", default: "h-10 px-4 py-2", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };
    return <button ref={ref} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
  });
Button.displayName = "Button";
