import { useCallback, useEffect, useRef, useState } from "react";

export type DepositSource = "Cash" | "Cheque" | "M-PESA";

export interface DepositResult {
  amountKes: number;
  source: DepositSource;
  reference: string;
}

export interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  /** Invoked once on confirmation; parent credits the balance and records the transaction. */
  onComplete: (result: DepositResult) => void;
}

type Step = "details" | "review" | "success";

const MIN_DEPOSIT_KES = 100;

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DepositModal({ open, onClose, onComplete }: DepositModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<DepositSource>("Cash");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setStep("details");
    setAmount("");
    setSource("Cash");
    setError(null);
    setReference("");
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  const parsedAmount = Number.parseFloat(amount) || 0;

  const goToReview = () => {
    if (parsedAmount < MIN_DEPOSIT_KES) {
      setError(`Enter a deposit of at least KES ${MIN_DEPOSIT_KES}.`);
      return;
    }
    setError(null);
    setStep("review");
  };

  const confirm = () => {
    const ref = `STB-DEP-${Date.now().toString(36).toUpperCase()}`;
    setReference(ref);
    onComplete({ amountKes: parsedAmount, source, reference: ref });
    setStep("success");
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stanbic-navy/70 p-4"
      data-testid="stb-deposit-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="stb-deposit-modal-heading"
        data-testid="stb-deposit-modal"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="stb-deposit-modal-heading"
            className="text-sm font-bold uppercase tracking-widest text-stanbic-royal"
          >
            Deposit — Current Account
          </h2>
          <button
            type="button"
            aria-label="Close deposit dialog"
            data-testid="stb-deposit-close"
            onClick={close}
            className="rounded p-1 text-xl leading-none text-slate-500 hover:text-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            ×
          </button>
        </div>

        <ol className="mb-5 flex gap-2 text-xs font-semibold" aria-label="Deposit progress">
          {(["details", "review", "success"] as const).map((s, i) => (
            <li
              key={s}
              data-testid={`stb-deposit-step-${s}`}
              aria-current={step === s ? "step" : undefined}
              className={`flex-1 rounded-full px-3 py-1 text-center capitalize ${
                step === s ? "bg-stanbic-royal text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        {step === "details" && (
          <div className="flex flex-col gap-3">
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
                autoFocus
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
            <span
              id="stb-deposit-error"
              data-testid="stb-deposit-error"
              role="alert"
              className="min-h-4 text-xs text-red-700"
            >
              {error}
            </span>
            <button
              type="button"
              data-testid="stb-deposit-next"
              onClick={goToReview}
              className="rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
            >
              Continue to Review
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col gap-4">
            <dl className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <dt>Amount</dt>
                <dd data-testid="stb-deposit-review-amount" className="font-bold text-stanbic-navy">
                  {formatKes(parsedAmount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Source</dt>
                <dd data-testid="stb-deposit-review-source" className="font-bold text-stanbic-navy">
                  {source}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Credited to</dt>
                <dd className="font-bold text-stanbic-navy">Current Account •••• 4521</dd>
              </div>
            </dl>
            <div className="flex gap-3">
              <button
                type="button"
                data-testid="stb-deposit-back"
                onClick={() => setStep("details")}
                className="flex-1 rounded-lg border-2 border-stanbic-royal px-6 py-3 font-bold text-stanbic-royal transition hover:bg-stanbic-royal hover:text-white focus-visible:ring-2 focus-visible:ring-stanbic-accent"
              >
                Back
              </button>
              <button
                type="button"
                data-testid="stb-deposit-confirm"
                onClick={confirm}
                className="flex-1 rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col gap-4 text-center" aria-live="polite" data-testid="stb-deposit-success">
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-700 text-2xl text-white"
            >
              ✓
            </div>
            <p className="font-bold text-green-700">Deposit Recorded</p>
            <p className="text-sm text-slate-600">
              {source} deposit of {formatKes(parsedAmount)} has been credited.
            </p>
            <p className="text-sm">
              Reference{" "}
              <span data-testid="stb-deposit-reference" className="font-bold text-stanbic-navy">
                {reference}
              </span>
            </p>
            <button
              type="button"
              data-testid="stb-deposit-done"
              onClick={close}
              className="rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
