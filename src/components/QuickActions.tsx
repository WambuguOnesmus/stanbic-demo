import { useState } from "react";

export interface QuickAction {
  /** Stable id used in the data-testid suffix, e.g. "pay-bills" -> stb-action-pay-bills. */
  id: string;
  label: string;
  icon: string;
}

export interface QuickActionsProps {
  actions?: readonly QuickAction[];
}

const DEFAULT_ACTIONS: readonly QuickAction[] = [
  { id: "pay-bills", label: "Pay Bills", icon: "🧾" },
  { id: "buy-airtime", label: "Buy Airtime", icon: "📱" },
  { id: "download-statement", label: "Statement", icon: "📄" },
  { id: "deposit", label: "Deposit", icon: "🏦" },
];

export function QuickActions({ actions = DEFAULT_ACTIONS }: QuickActionsProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="stb-quick-actions-heading"
      data-testid="stb-quick-actions"
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h2
        id="stb-quick-actions-heading"
        className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500"
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            data-testid={`stb-action-${action.id}`}
            onClick={() => setStatusMessage(`${action.label} request queued — you will receive an SMS confirmation.`)}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-stanbic-royal/15 bg-stanbic-royal/5 px-4 py-4 text-sm font-bold text-stanbic-royal transition hover:border-stanbic-royal hover:bg-stanbic-royal hover:text-white focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            <span aria-hidden="true" className="text-2xl">
              {action.icon}
            </span>
            {action.label}
          </button>
        ))}
      </div>
      <p
        aria-live="polite"
        data-testid="stb-action-status"
        className="mt-3 min-h-5 text-sm font-semibold text-green-700"
      >
        {statusMessage}
      </p>
    </section>
  );
}
