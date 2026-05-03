import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "bg-white text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
