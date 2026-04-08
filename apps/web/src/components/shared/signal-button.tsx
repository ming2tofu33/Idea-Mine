"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  type SignalButtonVariant,
  signalButtonClassName,
} from "@/components/shared/signal-button-styles";

export type SignalButtonProps = {
  children: ReactNode;
  variant?: SignalButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function SignalButton({
  children,
  variant = "default",
  className = "",
  type = "button",
  ...props
}: SignalButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={signalButtonClassName({ variant, className })}
    >
      {children}
    </button>
  );
}
