# Skill: Stanbic React Component Scaffolding

Use this skill whenever creating or refactoring React components for the
Stanbic Banking Portal (`src/components/**`).

## Component Contract

Every component must follow this exact structure:

1. **Explicit TypeScript interface** for props, exported alongside the component:

   ```tsx
   export interface RatePanelProps {
     /** ISO 4217 code of the destination currency. */
     currency: "USD" | "GBP" | "EUR";
     /** Mid-market rate quoted as KES -> currency. */
     rate: number;
     onRefresh?: () => void;
   }
   ```

2. **Function component, named export**, no default exports, no `React.FC`:

   ```tsx
   export function RatePanel({ currency, rate, onRefresh }: RatePanelProps) { … }
   ```

3. **Kebab-case `data-testid` on every interactive or assertable element**, always
   prefixed `stb-`:

   - Inputs: `data-testid="stb-amount-input"`, `data-testid="stb-currency-select"`
   - Buttons: `data-testid="stb-submit-button"`
   - Dynamic output: `data-testid="stb-quote-receive"`, `data-testid="stb-form-error"`
   - Containers used in assertions: `data-testid="stb-quote-panel"`

4. **Accessibility is mandatory**:
   - `<label htmlFor>` for every input; never placeholder-only labelling.
   - `aria-live="polite"` on regions that update from rate/quote recalculation.
   - `role="alert"` + `aria-invalid` for validation errors.
   - Keyboard operability and visible focus rings (`focus-visible:ring-*` tokens).

5. **Tailwind tokens only** — Stanbic palette classes (`bg-stanbic-navy`,
   `text-stanbic-royal`, `bg-stanbic-accent`) and standard spacing/typography
   scale. No arbitrary values, no inline styles, no CSS files.

6. **State modelling** — use discriminated unions for view state:

   ```tsx
   type TransferState =
     | { status: "editing" }
     | { status: "submitting" }
     | { status: "success"; reference: string }
     | { status: "error"; message: string };
   ```

7. **Input hygiene** — parse and clamp numeric input with a pure helper; strip
   control characters from free-text fields; never pass raw input to
   `dangerouslySetInnerHTML` (its use is banned).

## Deliverables Checklist

When scaffolding a component, always produce:

- [ ] `src/components/<Name>.tsx` with exported props interface
- [ ] Kebab-case `stb-*` test ids on all interactive elements
- [ ] A Page Object update or new POM class in `e2e/pages/`
- [ ] A Playwright spec skeleton in `e2e/` covering the acceptance criteria
- [ ] A Conventional Commit suggestion: `feat(portal): #<id> <description>`
