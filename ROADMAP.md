# Roadmap / Next Steps

Prioritized follow-ups after the modernization overhaul.

## Near term

- **Route-level code-splitting** of the Aptos SDK (lazy-load Create/Vote/Results)
  to shrink the initial payload below the current `vendor-aptos` chunk.
- **End-to-end tests** against a local Aptos node (e.g. Playwright + a mocked or
  local wallet) to cover the full sign→submit→tally flow that unit tests can't.
- **Lighthouse CI** job once a public preview URL exists, to track real Core
  Web Vitals over time.
- **Publish + wire** the contract: document a one-command deploy and surface the
  resulting `VITE_MODULE_ADDRESS` in a `.env`.

## Medium term

- **Dependency majors:** React 18 → 19 and MUI 5 → 7 (run codemods, retest),
  then bump `@aptos-labs/ts-sdk` to v7 once the wallet adapter supports it.
- **Internationalization:** add real locales beyond English (the i18n plumbing
  is already in place).
- **On-chain privacy:** hash or move voter PII off-chain instead of storing
  names in plaintext.
- **Results history:** read events via the Aptos indexer for time-series / audit
  views.

## Longer term

- **Professional Move audit** + an explicit module upgrade/freeze policy before
  any binding use.
- **Optional BFF:** only if server-side concerns (caching, rate limiting,
  analytics, notifications) emerge — currently intentionally omitted.
- **Identity integration:** connect the face-recognition service to the
  registration flow behind explicit consent and privacy controls.
