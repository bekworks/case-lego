import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex h-9 items-center justify-center gap-2 rounded px-4 text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary:
    "border border-line bg-surface text-text hover:bg-primary-soft hover:border-primary",
  danger: "bg-danger text-on-primary hover:bg-[#b00000]",
  ghost: "text-primary hover:bg-primary-soft",
};

export const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) => {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};
