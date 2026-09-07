export interface AccountSummary {
  /** Stable id used in the data-testid suffix, e.g. "current" -> stb-account-card-current. */
  id: string;
  label: string;
  /** Display-formatted balance, e.g. "KES 1,250,000.00". */
  balance: string;
  maskedNumber: string;
}

export interface AccountsOverviewProps {
  accounts: readonly AccountSummary[];
}

export function AccountsOverview({ accounts }: AccountsOverviewProps) {
  return (
    <section
      aria-label="Accounts overview"
      data-testid="stb-accounts-overview"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {accounts.map((account) => (
        <div
          key={account.id}
          data-testid={`stb-account-card-${account.id}`}
          className="rounded-xl bg-white p-5 shadow-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {account.label}
          </p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-stanbic-navy">
            {account.balance}
          </p>
          <p className="mt-1 text-xs text-slate-500">Acct {account.maskedNumber}</p>
        </div>
      ))}
    </section>
  );
}
