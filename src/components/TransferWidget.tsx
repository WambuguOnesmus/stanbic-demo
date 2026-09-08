import { useCallback, useMemo, useState } from "react";

/** Supported cross-border destination currencies. */
export type Currency = "USD" | "GBP" | "EUR";

/** Mid-market rates quoted as KES -> destination currency. */
export interface RateTable {
  readonly USD: number;
  readonly GBP: number;
  readonly EUR: number;
}

export interface TransferWidgetProps {
  /** Current available balance in KES (major units), owned by the parent. */
  balanceKes: number;
  /** Live exchange rates, KES -> destination currency. */
  rates: RateTable;
  /** Ad valorem transfer fee, e.g. 0.0125 for 1.25%. */
  feePct?: number;
  /** Flat SWIFT / correspondent charge in KES. */
  swiftChargeKes?: number;
  /** Invoked with the total debit after a validated, successful submission. */
  onDebit?: (amountKes: number) => void;
  /** Invoked after a validated, successful submission. */
  onSubmitted?: (receipt: TransferReceipt) => void;
}

export interface TransferReceipt {
  reference: string;
  beneficiaryName: string;
  amountKes: number;
  received: number;
  currency: Currency;
  newBalanceKes: number;
}

interface FormFields {
  amount: string;
  currency: Currency;
  beneficiaryName: string;
  iban: string;
  reference: string;
}

interface FieldErrors {
  amount?: string;
  beneficiaryName?: string;
  iban?: string;
}

type WidgetState =
  | { status: "editing" }
  | { status: "success"; receipt: TransferReceipt };

const MIN_AMOUNT_KES = 100;

/** Strip control characters and trim; free-text is never rendered as HTML. */
function sanitizeText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f<>]/g, "").trimStart();
}

function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCurrency(amount: number, currency: Currency): string {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function TransferWidget({
  balanceKes,
  rates,
  feePct = 0.0125,
  swiftChargeKes = 1500,
  onDebit,
  onSubmitted,
}: TransferWidgetProps) {
  const [fields, setFields] = useState<FormFields>({
    amount: "",
    currency: "USD",
    beneficiaryName: "",
    iban: "",
    reference: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [state, setState] = useState<WidgetState>({ status: "editing" });

  const quote = useMemo(() => {
    const amount = Number.parseFloat(fields.amount) || 0;
    const rate = rates[fields.currency];
    const fee = amount * feePct;
    const swift = amount > 0 ? swiftChargeKes : 0;
    return {
      amount,
      rate,
      fee,
      swift,
      totalDebit: amount + fee + swift,
      received: amount * rate,
    };
  }, [fields.amount, fields.currency, rates, feePct, swiftChargeKes]);

  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {};

    if (!quote.amount || quote.amount < MIN_AMOUNT_KES) {
      errors.amount = `Enter an amount of at least KES ${MIN_AMOUNT_KES}.`;
    }
    const name = fields.beneficiaryName.trim();
    if (!/^[A-Za-z][A-Za-z .'-]{2,69}$/.test(name)) {
      errors.beneficiaryName = "Enter the beneficiary's full legal name.";
    }
    if (!/^[A-Z0-9]{8,34}$/.test(normalizeIban(fields.iban))) {
      errors.iban = "Enter a valid IBAN or account number (8–34 characters).";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormError(null);
      return false;
    }
    if (quote.totalDebit > balanceKes) {
      setFormError(
        `Insufficient funds: total debit ${formatKes(quote.totalDebit)} exceeds ` +
          `your available balance of ${formatKes(balanceKes)}.`,
      );
      return false;
    }
    setFormError(null);
    return true;
  }, [quote, fields.beneficiaryName, fields.iban, balanceKes]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate()) return;

      const newBalance = balanceKes - quote.totalDebit;
      const receipt: TransferReceipt = {
        reference: `STB-TRF-${Date.now().toString(36).toUpperCase()}`,
        beneficiaryName: fields.beneficiaryName.trim(),
        amountKes: quote.amount,
        received: quote.received,
        currency: fields.currency,
        newBalanceKes: newBalance,
      };
      onDebit?.(quote.totalDebit);
      setState({ status: "success", receipt });
      onSubmitted?.(receipt);
    },
    [validate, balanceKes, quote, fields.beneficiaryName, fields.currency, onDebit, onSubmitted],
  );

  const resetForm = useCallback(() => {
    setFields({ amount: "", currency: "USD", beneficiaryName: "", iban: "", reference: "" });
    setFieldErrors({});
    setFormError(null);
    setState({ status: "editing" });
  }, []);

  if (state.status === "success") {
    const { receipt } = state;
    return (
      <section
        data-testid="stb-success-panel"
        aria-live="polite"
        className="rounded-xl bg-white p-10 text-center shadow-lg"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-5 grid h-18 w-18 place-items-center rounded-full bg-green-700 text-3xl text-white"
        >
          ✓
        </div>
        <h2 data-testid="stb-success-heading" className="mb-2 text-xl font-bold text-green-700">
          Transfer Submitted Successfully
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Your cross-border transfer has been queued for processing. A confirmation SMS has been sent.
        </p>
        <dl
          data-testid="stb-success-receipt"
          className="mx-auto mb-6 max-w-md space-y-2 rounded-xl bg-slate-50 p-6 text-left text-sm"
        >
          <div className="flex justify-between">
            <dt>Reference No.</dt>
            <dd data-testid="stb-receipt-ref" className="font-semibold text-stanbic-navy">
              {receipt.reference}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Beneficiary</dt>
            <dd className="font-semibold text-stanbic-navy">{receipt.beneficiaryName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Amount sent</dt>
            <dd className="font-semibold text-stanbic-navy">{formatKes(receipt.amountKes)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Beneficiary receives</dt>
            <dd data-testid="stb-receipt-received" className="font-semibold text-stanbic-navy">
              {formatCurrency(receipt.received, receipt.currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>New KES balance</dt>
            <dd data-testid="stb-receipt-balance" className="font-semibold text-stanbic-navy">
              {formatKes(receipt.newBalanceKes)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          data-testid="stb-new-transfer-button"
          onClick={resetForm}
          className="rounded-lg border-2 border-stanbic-royal px-6 py-3 font-bold text-stanbic-royal transition hover:bg-stanbic-royal hover:text-white focus-visible:ring-2 focus-visible:ring-stanbic-accent"
        >
          Make Another Transfer
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="stb-transfer-heading" className="rounded-xl bg-white p-7 shadow-lg">
      <header className="mb-6">
        <h1 id="stb-transfer-heading" className="text-2xl font-bold text-stanbic-navy">
          Cross-Border Transfer
        </h1>
        <p className="text-sm text-slate-600">
          Send money from your KES account to USD, GBP or EUR beneficiaries worldwide.
        </p>
        <p className="mt-3 text-lg font-extrabold text-stanbic-navy" data-testid="stb-account-balance">
          {formatKes(balanceKes)}
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {formError !== null && (
          <p
            role="alert"
            data-testid="stb-form-error"
            className="col-span-full rounded-lg border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-amount" className="text-sm font-semibold text-stanbic-navy">
            Amount (KES)
          </label>
          <input
            id="stb-amount"
            data-testid="stb-amount-input"
            type="number"
            inputMode="decimal"
            min={MIN_AMOUNT_KES}
            step="0.01"
            required
            value={fields.amount}
            aria-invalid={fieldErrors.amount !== undefined}
            aria-describedby="stb-amount-error"
            onChange={(e) => setFields((f) => ({ ...f, amount: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span id="stb-amount-error" data-testid="stb-amount-error" className="min-h-4 text-xs text-red-700">
            {fieldErrors.amount}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-currency" className="text-sm font-semibold text-stanbic-navy">
            Destination Currency
          </label>
          <select
            id="stb-currency"
            data-testid="stb-currency-select"
            value={fields.currency}
            onChange={(e) =>
              setFields((f) => ({ ...f, currency: e.target.value as Currency }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-beneficiary" className="text-sm font-semibold text-stanbic-navy">
            Beneficiary Name
          </label>
          <input
            id="stb-beneficiary"
            data-testid="stb-beneficiary-name"
            type="text"
            maxLength={70}
            required
            value={fields.beneficiaryName}
            aria-invalid={fieldErrors.beneficiaryName !== undefined}
            aria-describedby="stb-beneficiary-error"
            onChange={(e) =>
              setFields((f) => ({ ...f, beneficiaryName: sanitizeText(e.target.value) }))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span
            id="stb-beneficiary-error"
            data-testid="stb-beneficiary-error"
            className="min-h-4 text-xs text-red-700"
          >
            {fieldErrors.beneficiaryName}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-iban" className="text-sm font-semibold text-stanbic-navy">
            Beneficiary IBAN / Account No.
          </label>
          <input
            id="stb-iban"
            data-testid="stb-iban-input"
            type="text"
            maxLength={34}
            required
            value={fields.iban}
            aria-invalid={fieldErrors.iban !== undefined}
            aria-describedby="stb-iban-error"
            onChange={(e) => setFields((f) => ({ ...f, iban: sanitizeText(e.target.value) }))}
            className="rounded-lg border border-slate-300 px-3 py-2 uppercase focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span id="stb-iban-error" data-testid="stb-iban-error" className="min-h-4 text-xs text-red-700">
            {fieldErrors.iban}
          </span>
        </div>

        <div className="col-span-full flex flex-col gap-1">
          <label htmlFor="stb-reference" className="text-sm font-semibold text-stanbic-navy">
            Payment Reference (optional)
          </label>
          <input
            id="stb-reference"
            data-testid="stb-reference-input"
            type="text"
            maxLength={140}
            value={fields.reference}
            onChange={(e) => setFields((f) => ({ ...f, reference: sanitizeText(e.target.value) }))}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
        </div>

        <div
          data-testid="stb-quote-panel"
          aria-live="polite"
          className="col-span-full rounded-xl border border-stanbic-royal/20 bg-stanbic-royal/5 p-5"
        >
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-stanbic-royal">
            Live Quote &amp; Fee Breakdown
          </h3>
          <dl className="space-y-1 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt>Exchange rate applied</dt>
              <dd data-testid="stb-quote-rate" className="font-semibold">
                1 KES = {quote.rate} {fields.currency}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Transfer fee ({(feePct * 100).toFixed(2)}%)</dt>
              <dd data-testid="stb-quote-fee" className="font-semibold">
                {formatKes(quote.fee)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>SWIFT / correspondent charge</dt>
              <dd data-testid="stb-quote-swift" className="font-semibold">
                {formatKes(quote.swift)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Total debit from account</dt>
              <dd data-testid="stb-quote-debit" className="font-semibold">
                {formatKes(quote.totalDebit)}
              </dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-dashed border-stanbic-royal/30 pt-2 text-base font-extrabold text-stanbic-royal">
              <dt>Beneficiary receives</dt>
              <dd data-testid="stb-quote-receive">{formatCurrency(quote.received, fields.currency)}</dd>
            </div>
          </dl>
        </div>

        <button
          type="submit"
          data-testid="stb-submit-button"
          className="col-span-full rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
        >
          Review &amp; Send Transfer
        </button>
      </form>
    </section>
  );
}
