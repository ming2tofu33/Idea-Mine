"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-secondary/40" />
            )}
            {isLast || !item.href ? (
              <span
                className={
                  isLast
                    ? "font-medium text-text-primary"
                    : "text-text-secondary"
                }
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="cursor-pointer text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
