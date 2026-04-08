import Link from "next/link";
import { signalButtonClassName } from "@/components/shared/signal-button-styles";

export function FinalCta({ hasUser }: { hasUser: boolean }) {
  const primaryHref = hasUser ? "/mine" : "/auth/sign-in";

  return (
    <section
      id="final-cta"
      aria-label="Final call to action"
      className="relative z-10 readable-container py-4 pb-10 md:py-5 md:pb-14"
    >
      <div className="observatory-panel observatory-frame relative overflow-hidden rounded-[28px] border border-signal-pink/25 p-6 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,59,147,0.22),transparent_36%),radial-gradient(circle_at_82%_82%,rgba(92,205,229,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-signal-pink/60 to-transparent" />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-center">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-signal-pink/80">
              Ready to enter
            </p>
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Start with one signal. Carry it through the whole system.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Move from Mine to Vault to Lab without losing context, momentum, or
              the original thread.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Link
              href={primaryHref}
              className={signalButtonClassName({
                variant: "primary",
                className:
                  "border-signal-pink/65 bg-[rgba(255,59,147,0.14)] px-6 py-3 text-sm shadow-[0_0_24px_rgba(255,59,147,0.16)]",
              })}
            >
              {hasUser ? "Enter The Mine" : "Start Exploring"}
            </Link>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary/70">
              Explore the flow from signal to direction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
