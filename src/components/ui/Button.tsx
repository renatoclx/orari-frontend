type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-background",
  ghost: "text-muted hover:bg-background hover:text-foreground",
  danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
};

type ButtonSize = "md" | "lg";

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  // Formulários em destaque (ex.: login), onde legibilidade pesa mais.
  lg: "h-14 px-6 text-base",
};

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "secondary",
  size = "md",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-medium disabled:pointer-events-none disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
