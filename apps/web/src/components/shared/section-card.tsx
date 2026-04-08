"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, children, className }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={[
        "relative overflow-hidden rounded-xl border border-line-steel/20 border-t-line-steel/40 bg-surface-1/30 p-5 backdrop-blur-xl shadow-[inset_0px_1px_rgba(255,255,255,0.05),_0px_8px_20px_rgba(0,0,0,0.3)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-cold-cyan/80 drop-shadow-[0_0_8px_rgba(92,205,229,0.3)]">
        [ {title} ]
      </h4>
      {children}
    </motion.section>
  );
}
