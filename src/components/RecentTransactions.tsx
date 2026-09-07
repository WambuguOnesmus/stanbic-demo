export interface Transaction {
  date: string;
  description: string;
  reference: string;
  /** Signed amount in KES major units; negative = debit. */
  amountKes: number;
}

export interface RecentTransactionsProps {
  transactions: readonly Transaction[];
}

function formatSigned(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? "-" : "+"}${formatted}`;
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section
      aria-labelledby="fx-transactions-heading"
      data-testid="fx-transactions-panel"
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h2
        id="fx-transactions-heading"
        className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500"
      >
        Recent Transactions — Current Account
      </h2>
      <table className="w-full border-collapse text-sm" aria-label="Recent transactions">
        <thead>
          <tr className="border-b-2 border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
            <th scope="col" className="px-3 py-2">Date</th>
            <th scope="col" className="px-3 py-2">Description</th>
            <th scope="col" className="px-3 py-2">Reference</th>
            <th scope="col" className="px-3 py-2 text-right">Amount (KES)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.reference} data-testid="fx-transaction-row" className="even:bg-slate-50">
              <td className="px-3 py-2">{tx.date}</td>
              <td className="px-3 py-2">{tx.description}</td>
              <td className="px-3 py-2">{tx.reference}</td>
              <td
                className={`px-3 py-2 text-right font-bold tabular-nums ${
                  tx.amountKes < 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                {formatSigned(tx.amountKes)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
