import { useState } from "react";

export type DepositSource = "Cash" | "Cheque" | "M-PESA";

export interface DepositPanelProps {
  /** Invoked with the deposited amount (KES) after validation. */
  onDeposit: (amountKes: number) => void;
}

const MIN_DEPOSIT_KES = 100;

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DepositPanel({ onDeposit }: DepositPanelProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<DepositSource>("Cash");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number.parseFloat(amount) || 0;
    if (value < MIN_DEPOSIT_KES) {
      setError(`Enter a deposit of at least KES ${MIN_DEPOSIT_KES}.`);
      setStatus(null);
      return;
    }
    setError(null);
    onDeposit(value);
    const reference = `STB-DEP-${Date.now().toString(36).toUpperCase()}`;
    setStatus(`${source} deposit of ${formatKes(value)} received — reference ${reference}.`);
    setAmount("");
  };

  return (
    <section
      aria-labelledby="stb-deposit-heading"
      data-testid="stb-deposit-panel"
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h2
        id="stb-deposit-heading"
        className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500"
      >
        Deposit — Current Account
      </h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="stb-deposit-amount" className="text-sm font-semibold text-stanbic-navy">
            Amount (KES)
          </label>
          <input
            id="stb-deposit-amount"
            data-testid="stb-deposit-amount"
            type="number"
            inputMode="decimal"
            min={MIN_DEPOSIT_KES}
            step="0.01"
            required
            value={amount}
            aria-invalid={error !== null}
            aria-describedby="stb-deposit-error"
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="stb-deposit-source" className="text-sm font-semibold text-stanbic-navy">
            Source
          </label>
          <select
            id="stb-deposit-source"
            data-testid="stb-deposit-source"
            value={source}
            onChange={(e) => setSource(e.target.value as DepositSource)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="M-PESA">M-PESA</option>
          </select>
        </div>
        <span id="stb-deposit-error" data-testid="stb-deposit-error" role="alert" className="min-h-4 text-xs text-red-700">
          {error}
        </span>
        <button
          type="submit"
          data-testid="stb-deposit-submit"
          className="rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
        >
          Deposit Funds
        </button>
        <p
          aria-live="polite"
          data-testid="stb-deposit-status"
          className="min-h-5 text-sm font-semibold text-green-700"
        >
          {status}
        </p>
      </form>
    </section>
  );
}
