import { useState } from "react";

export interface SendMoneyPanelProps {
  /** Current available balance in KES, owned by the parent. */
  balanceKes: number;
  /** Flat local-transfer fee in KES. */
  feeKes?: number;
  /** Invoked with the total debit (amount + fee) after validation. */
  onSend: (totalDebitKes: number) => void;
}

interface SendErrors {
  recipient?: string;
  mobile?: string;
  amount?: string;
}

const MIN_SEND_KES = 10;

/** Strip control characters; free-text is never rendered as HTML. */
function sanitizeText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f<>]/g, "").trimStart();
}

function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function SendMoneyPanel({ balanceKes, feeKes = 50, onSend }: SendMoneyPanelProps) {
  const [recipient, setRecipient] = useState("");
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<SendErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const value = Number.parseFloat(amount) || 0;
    const nextErrors: SendErrors = {};
    if (!/^[A-Za-z][A-Za-z .'-]{2,69}$/.test(recipient.trim())) {
      nextErrors.recipient = "Enter the recipient's full name.";
    }
    if (!/^(?:\+?254|0)7\d{8}$/.test(mobile.replace(/\s+/g, ""))) {
      nextErrors.mobile = "Enter a valid Kenyan mobile number (07XX XXX XXX).";
    }
    if (value < MIN_SEND_KES) {
      nextErrors.amount = `Enter an amount of at least KES ${MIN_SEND_KES}.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setFormError(null);
      return;
    }

    const totalDebit = value + feeKes;
    if (totalDebit > balanceKes) {
      setFormError(
        `Insufficient funds: total debit ${formatKes(totalDebit)} (incl. ${formatKes(feeKes)} fee) ` +
          `exceeds your available balance of ${formatKes(balanceKes)}.`,
      );
      return;
    }

    setFormError(null);
    onSend(totalDebit);
    const reference = `STB-SM-${Date.now().toString(36).toUpperCase()}`;
    setStatus(
      `${formatKes(value)} sent to ${recipient.trim()} (${mobile.trim()}) — reference ${reference}.`,
    );
    setRecipient("");
    setMobile("");
    setAmount("");
  };

  return (
    <section
      aria-labelledby="stb-sendmoney-heading"
      data-testid="stb-sendmoney-panel"
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h2
        id="stb-sendmoney-heading"
        className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500"
      >
        Send Money — Local
      </h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {formError !== null && (
          <p
            role="alert"
            data-testid="stb-sendmoney-error"
            className="rounded-lg border border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {formError}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-sendmoney-recipient" className="text-sm font-semibold text-stanbic-navy">
            Recipient Name
          </label>
          <input
            id="stb-sendmoney-recipient"
            data-testid="stb-sendmoney-recipient"
            type="text"
            maxLength={70}
            required
            value={recipient}
            aria-invalid={errors.recipient !== undefined}
            aria-describedby="stb-sendmoney-recipient-error"
            onChange={(e) => setRecipient(sanitizeText(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span
            id="stb-sendmoney-recipient-error"
            data-testid="stb-sendmoney-recipient-error"
            className="min-h-4 text-xs text-red-700"
          >
            {errors.recipient}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-sendmoney-mobile" className="text-sm font-semibold text-stanbic-navy">
            Mobile Number
          </label>
          <input
            id="stb-sendmoney-mobile"
            data-testid="stb-sendmoney-mobile"
            type="tel"
            maxLength={13}
            required
            placeholder="07XX XXX XXX"
            value={mobile}
            aria-invalid={errors.mobile !== undefined}
            aria-describedby="stb-sendmoney-mobile-error"
            onChange={(e) => setMobile(sanitizeText(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span
            id="stb-sendmoney-mobile-error"
            data-testid="stb-sendmoney-mobile-error"
            className="min-h-4 text-xs text-red-700"
          >
            {errors.mobile}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stb-sendmoney-amount" className="text-sm font-semibold text-stanbic-navy">
            Amount (KES) — flat fee {formatKes(feeKes)}
          </label>
          <input
            id="stb-sendmoney-amount"
            data-testid="stb-sendmoney-amount"
            type="number"
            inputMode="decimal"
            min={MIN_SEND_KES}
            step="0.01"
            required
            value={amount}
            aria-invalid={errors.amount !== undefined}
            aria-describedby="stb-sendmoney-amount-error"
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-visible:border-stanbic-royal focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          />
          <span
            id="stb-sendmoney-amount-error"
            data-testid="stb-sendmoney-amount-error"
            className="min-h-4 text-xs text-red-700"
          >
            {errors.amount}
          </span>
        </div>

        <button
          type="submit"
          data-testid="stb-sendmoney-submit"
          className="rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
        >
          Send Money
        </button>
        <p
          aria-live="polite"
          data-testid="stb-sendmoney-status"
          className="min-h-5 text-sm font-semibold text-green-700"
        >
          {status}
        </p>
      </form>
    </section>
  );
}
