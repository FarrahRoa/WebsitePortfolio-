import Link from "next/link";
import React from "react";

type ButtonProps = React.ComponentPropsWithoutRef<typeof Link> & {
  as?: "a" | "button";
  href?: string;
  external?: boolean; // render a plain <a> instead of next/link
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Button({ href, external, anchorProps, onClick, children, className = "", size = "md", variant = "dark", ...rest }: ButtonProps & { variant?: "dark" | "light" }) {
  const sizeClasses =
    size === "sm"
      ? "px-4 py-2 text-xs"
      : size === "lg"
      ? "px-8 py-4 text-base"
      : "px-6 py-3 text-sm";

  const darkBase = `rounded-full border border-white bg-transparent text-white font-semibold uppercase tracking-[0.12em] ${sizeClasses} transition-colors duration-300 hover:bg-white hover:text-black`;
  const lightBase = `rounded-full border border-black bg-white text-black font-semibold uppercase tracking-[0.12em] ${sizeClasses} transition-colors duration-300 hover:bg-black hover:text-white`;

  const base = variant === "light" ? lightBase : darkBase;
  const combined = `${base} ${className}`.trim();

  if (href) {
    if (external) {
      return (
        <a href={href} className={combined} {...anchorProps} {...(rest as any)}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={combined} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combined} {...(rest as any)}>
      {children}
    </button>
  );
}

export default Button;
