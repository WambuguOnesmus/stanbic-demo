import { AccountsOverview, type AccountSummary } from "./components/AccountsOverview";
import { QuickActions } from "./components/QuickActions";
import { TransferWidget } from "./components/TransferWidget";
import { RecentTransactions, type Transaction } from "./components/RecentTransactions";

const LIVE_RATES = { USD: 0.00775, GBP: 0.00612, EUR: 0.00718 } as const;

const ACCOUNTS: readonly AccountSummary[] = [
  { id: "current", label: "Current Account", balance: "KES 1,250,000.00", maskedNumber: "•••• 4521" },
  { id: "savings", label: "Savings Account", balance: "KES 3,480,200.55", maskedNumber: "•••• 7810" },
  { id: "usd", label: "USD Account", balance: "USD 12,940.10", maskedNumber: "•••• 2093" },
];

const RECENT_TRANSACTIONS: readonly Transaction[] = [
  { date: "05 Sep 2026", description: "Salary — Acme Industries Ltd", reference: "SAL-082026", amountKes: 320_000 },
  { date: "03 Sep 2026", description: "KPLC Electricity", reference: "UTIL-99213", amountKes: -8_420 },
  { date: "01 Sep 2026", description: "Transfer to Savings ••7810", reference: "TRF-INT-5540", amountKes: -150_000 },
  { date: "29 Aug 2026", description: "Naivas Supermarket", reference: "POS-77120", amountKes: -12_845.5 },
];

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
          <span>Stanbic Bank — Banking Portal</span>
        </div>
        <span
          data-testid="stb-env-pill"
          className="rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs uppercase tracking-widest"
        >
          React App · Demo Environment
        </span>
      </header>

      <main className="flex flex-col gap-6">
        <AccountsOverview accounts={ACCOUNTS} />
        <QuickActions />
        <TransferWidget initialBalanceKes={1_250_000} rates={LIVE_RATES} />
        <RecentTransactions transactions={RECENT_TRANSACTIONS} />
      </main>

      <footer className="text-center text-xs text-white/60">
        Stanbic Bank Kenya — Banking Portal. Rates are indicative and for demonstration only.
      </footer>
    </div>
  );
}
