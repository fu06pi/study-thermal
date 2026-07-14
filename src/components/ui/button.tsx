import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white shadow-lg shadow-accent/20 hover:brightness-110",
  secondary: "border border-white/10 bg-white/[0.07] text-ink hover:bg-white/[0.11]",
  ghost: "text-muted hover:bg-white/[0.07] hover:text-ink",
};

export function Button({ className = "", variant = "secondary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
