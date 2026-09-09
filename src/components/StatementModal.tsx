import { useCallback, useEffect, useState } from "react";

export type StatementAccount =
  | "Current Account •••• 4521"
  | "Savings Account •••• 7810"
  | "USD Account •••• 2093";
export type StatementPeriod = "Last 30 days" | "Last 90 days" | "Year to date";
export type StatementFormat = "PDF" | "CSV";

export interface StatementModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "details" | "review" | "success";

const STEPS: readonly Step[] = ["details", "review", "success"];

export function StatementModal({ open, onClose }: StatementModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [account, setAccount] = useState<StatementAccount>("Current Account •••• 4521");
  const [period, setPeriod] = useState<StatementPeriod>("Last 30 days");
  const [format, setFormat] = useState<StatementFormat>("PDF");
  const [reference, setReference] = useState<string>("");

  const close = useCallback(() => {
    setStep("details");
    setAccount("Current Account •••• 4521");
    setPeriod("Last 30 days");
    setFormat("PDF");
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

  const confirm = () => {
    setReference(`STB-STM-${Date.now().toString(36).toUpperCase()}`);
    setStep("success");
  };

  const selectClass =
    "rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stanbic-navy/70 p-4"
      data-testid="stb-statement-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stb-statement-modal-heading"
        data-testid="stb-statement-modal"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="stb-statement-modal-heading"
            className="text-sm font-bold uppercase tracking-widest text-stanbic-royal"
          >
            Account Statement
          </h2>
          <button
            type="button"
            aria-label="Close statement dialog"
            data-testid="stb-statement-close"
            onClick={close}
            className="rounded p-1 text-xl leading-none text-slate-500 hover:text-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            ×
          </button>
        </div>

        <ol className="mb-5 flex gap-2 text-xs font-semibold" aria-label="Statement progress">
          {STEPS.map((s, i) => (
            <li
              key={s}
              data-testid={`stb-statement-step-${s}`}
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
              <label htmlFor="stb-statement-account" className="text-sm font-semibold text-stanbic-navy">
                Account
              </label>
              <select
                id="stb-statement-account"
                data-testid="stb-statement-account"
                autoFocus
                value={account}
                onChange={(e) => setAccount(e.target.value as StatementAccount)}
                className={selectClass}
              >
                <option value="Current Account •••• 4521">Current Account •••• 4521</option>
                <option value="Savings Account •••• 7810">Savings Account •••• 7810</option>
                <option value="USD Account •••• 2093">USD Account •••• 2093</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stb-statement-period" className="text-sm font-semibold text-stanbic-navy">
                Period
              </label>
              <select
                id="stb-statement-period"
                data-testid="stb-statement-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as StatementPeriod)}
                className={selectClass}
              >
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Year to date">Year to date</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stb-statement-format" className="text-sm font-semibold text-stanbic-navy">
                Format
              </label>
              <select
                id="stb-statement-format"
                data-testid="stb-statement-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as StatementFormat)}
                className={selectClass}
              >
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
            <button
              type="button"
              data-testid="stb-statement-next"
              onClick={() => setStep("review")}
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
                <dt>Account</dt>
                <dd data-testid="stb-statement-review-account" className="font-bold text-stanbic-navy">
                  {account}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Period</dt>
                <dd data-testid="stb-statement-review-period" className="font-bold text-stanbic-navy">
                  {period}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Format</dt>
                <dd data-testid="stb-statement-review-format" className="font-bold text-stanbic-navy">
                  {format}
                </dd>
              </div>
            </dl>
            <div className="flex gap-3">
              <button
                type="button"
                data-testid="stb-statement-back"
                onClick={() => setStep("details")}
                className="flex-1 rounded-lg border-2 border-stanbic-royal px-6 py-3 font-bold text-stanbic-royal transition hover:bg-stanbic-royal hover:text-white focus-visible:ring-2 focus-visible:ring-stanbic-accent"
              >
                Back
              </button>
              <button
                type="button"
                data-testid="stb-statement-confirm"
                onClick={confirm}
                className="flex-1 rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
              >
                Generate Statement
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div
            className="flex flex-col gap-4 text-center"
            aria-live="polite"
            data-testid="stb-statement-success"
          >
            <div
              aria-hidden="true"
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-700 text-2xl text-white"
            >
              ✓
            </div>
            <p className="font-bold text-green-700">Statement Ready</p>
            <p className="text-sm text-slate-600">
              {format} statement for {account} ({period}) is ready for download.
            </p>
            <p className="text-sm">
              Reference{" "}
              <span data-testid="stb-statement-reference" className="font-bold text-stanbic-navy">
                {reference}
              </span>
            </p>
            <button
              type="button"
              data-testid="stb-statement-done"
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
