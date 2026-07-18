import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  className?: string;
  children: ReactNode;
}

/**
 * Consistent section wrapper: vertical rhythm + scroll-margin so anchor
 * navigation lands below the fixed navbar.
 */
export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-20 sm:py-28", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
