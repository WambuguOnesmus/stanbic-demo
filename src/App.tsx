import { FxTransferWidget } from "./components/FxTransferWidget";

const LIVE_RATES = { USD: 0.00775, GBP: 0.00612, EUR: 0.00718 } as const;

export function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3 text-xl font-bold tracking-wide">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-full bg-stanbic-accent font-extrabold text-stanbic-navy"
          >
            S
          </span>
          <span>Stanbic Bank — FX Portal</span>
        </div>
        <span
          data-testid="fx-env-pill"
          className="rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs uppercase tracking-widest"
        >
          React App · Demo Environment
        </span>
      </header>

      <main>
        <FxTransferWidget initialBalanceKes={1_250_000} rates={LIVE_RATES} />
      </main>

      <footer className="text-center text-xs text-white/60">
        Stanbic Bank Kenya — FX Modernization. Rates are indicative and for demonstration only.
      </footer>
    </div>
  );
}
