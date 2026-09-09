import { useCallback, useEffect, useState } from "react";
import type { Transaction } from "./RecentTransactions";

export type DepositSource = "Cash" | "Cheque" | "M-PESA";

export interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  /** Called once on Confirm Deposit with the credit to record against the account. */
  onDeposit: (transaction: Transaction) => void;
}

type Step = "details" | "review" | "success";

const STEPS: readonly Step[] = ["details", "review", "success"];
const MIN_DEPOSIT_KES = 100;

/** Parse the raw amount field into a finite KES value; NaN-safe. */
function parseAmountKes(raw: string): number {
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Round a KES amount to cents for display and ledger recording. */
function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DepositModal({ open, onClose, onDeposit }: DepositModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [amountRaw, setAmountRaw] = useState<string>("");
  const [source, setSource] = useState<DepositSource>("Cash");
  const [error, setError] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  const close = useCallback(() => {
    setStep("details");
    setAmountRaw("");
    setSource("Cash");
    setError("");
    setReference("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  const parsedAmount = parseAmountKes(amountRaw);
  const amountKes = roundToCents(parsedAmount);

  const next = () => {
    // Validate the unrounded input so e.g. 99.999 cannot round up past the minimum.
    if (parsedAmount < MIN_DEPOSIT_KES) {
      setError("Enter a deposit of at least KES 100.");
      return;
    }
    setError("");
    setStep("review");
  };

  const confirm = () => {
    const ref = `STB-DEP-${Date.now().toString(36).toUpperCase()}`;
    onDeposit({
      date: todayLabel(),
      description: `${source} Deposit`,
      reference: ref,
      amountKes,
    });
    setReference(ref);
    setStep("success");
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stanbic-navy/70 p-4"
      data-testid="stb-deposit-backdrop"
    >
      <div
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
          {STEPS.map((s, i) => (
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
                type="number"
                id="stb-deposit-amount"
                data-testid="stb-deposit-amount"
                autoFocus
                min={MIN_DEPOSIT_KES}
                step="0.01"
                inputMode="decimal"
                placeholder="e.g. 50,000"
                required
                value={amountRaw}
                aria-invalid={error !== ""}
                onChange={(e) => setAmountRaw(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
              />
              {error !== "" && (
                <span
                  role="alert"
                  data-testid="stb-deposit-error"
                  className="text-sm font-semibold text-red-700"
                >
                  {error}
                </span>
              )}
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
            <button
              type="button"
              data-testid="stb-deposit-next"
              onClick={next}
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
                  {formatKes(amountKes)}
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
          <div
            className="flex flex-col gap-4 text-center"
            aria-live="polite"
            data-testid="stb-deposit-success"
          >
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-700 text-2xl text-white"
            >
              ✓
            </div>
            <p className="font-bold text-green-700">Deposit Recorded</p>
            <p className="text-sm text-slate-600">
              {source} deposit of {formatKes(amountKes)} has been credited.
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
