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

      <main className="grid flex-1 place-items-center">
        <section
          data-testid="stb-coming-soon"
          className="max-w-lg rounded-xl bg-white p-12 text-center shadow-lg"
        >
          <span aria-hidden="true" className="mb-4 block text-5xl">
            🏗️
          </span>
          <h1 className="mb-3 text-2xl font-extrabold text-stanbic-navy">
            Banking Portal Coming Soon
          </h1>
          <p className="mb-6 text-sm text-slate-600">
            The portal is being built feature by feature from the approved prototype. Track
            progress on the project board — each feature ships from its own issue.
          </p>
          <a
            href="/prototype/index.html"
            data-testid="stb-prototype-link"
            className="inline-block rounded-lg bg-stanbic-royal px-6 py-3 font-bold text-white transition hover:bg-stanbic-navy focus-visible:ring-2 focus-visible:ring-stanbic-accent"
          >
            View the Approved Prototype
          </a>
        </section>
      </main>

      <footer className="text-center text-xs text-white/60">
        Stanbic Bank Kenya — Banking Portal. Rates are indicative and for demonstration only.
      </footer>
    </div>
  );
}
