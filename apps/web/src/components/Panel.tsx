import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={clsx("rounded-md border border-white/10 bg-panel/78 p-4 shadow-2xl backdrop-blur", className)}>
      {children}
    </section>
  );
}
