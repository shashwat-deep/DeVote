# Security Policy

## Reporting a Vulnerability

Please report security issues privately via GitHub Security Advisories
("Report a vulnerability") rather than opening a public issue. We aim to
acknowledge reports within 72 hours.

## Supported Versions

The latest release on `main` is supported. Older tags are not patched.

## Dependency & License Audit

Run as part of CI and reproducible locally:

```bash
pnpm audit --prod          # vulnerability scan
pnpm licenses list --prod  # license inventory
```

Status at last audit:

- **Vulnerabilities:** none. A moderate advisory in a transitive `uuid`
  (`<11.1.1`, pulled in deep under `@aptos-labs/wallet-adapter-react`) is
  remediated via a pnpm `overrides` entry forcing `uuid >= 11.1.1`.
- **Licenses:** all production dependencies are permissive (MIT / ISC /
  Apache-2.0 / BSD). No GPL/AGPL/LGPL/MPL copyleft dependencies were found.

## OWASP Top 10 (2021) — dApp Assessment

This is a static SPA plus an on-chain Move contract; there is no first-party
backend, database, or session layer, which removes whole categories of risk.

| #   | Category                       | Status & mitigation                                                                                                                                 |
| --- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | Broken Access Control          | On-chain: ballot mutations require the official's `signer`; `cast_vote` enforces voter registration + single vote. No server roles to misconfigure. |
| A02 | Cryptographic Failures         | No secrets in the client. Transactions are signed by the user's wallet; the app never handles private keys. HSTS + HTTPS enforced via headers.      |
| A03 | Injection                      | No SQL/templating backend. React escapes output by default; no `dangerouslySetInnerHTML`. Move has no string-eval surface.                          |
| A04 | Insecure Design                | State machine + eligibility/double-vote checks enforced **on-chain** (source of truth), not just in the UI.                                         |
| A05 | Security Misconfiguration      | CSP + security headers shipped (`public/_headers`, mirrored in nginx). `.env.example` documents config; runtime env is zod-validated.               |
| A06 | Vulnerable Components          | `pnpm audit` in CI; Dependabot/renovate-friendly ranges; override applied (see above).                                                              |
| A07 | Identification & Auth Failures | Authentication is delegated to the Aptos wallet (Petra, AIP-62). Optional face-recognition step for off-chain identity assurance.                   |
| A08 | Software & Data Integrity      | Lockfile committed; pnpm build-script allowlist; signed, conventional commits; semantic-release provenance.                                         |
| A09 | Logging & Monitoring           | Optional Sentry telemetry (lazy-loaded, DSN-gated). On-chain events emitted for every state change.                                                 |
| A10 | SSRF                           | Not applicable — no server-side request layer. Client `connect-src` is CSP-restricted to Aptos endpoints.                                           |

## Smart Contract Notes

- Each ballot resource lives under its official's account; voters reference it
  by address. Voter eligibility and single-vote are enforced in `cast_vote`.
- Covered by Move unit tests including abort-path assertions
  (`pnpm move:test`).
- Not yet independently audited — **do not use for binding elections without a
  professional Move audit and an upgrade/freeze policy.**

## Known Limitations

- Voter PII (names) is stored on-chain in plaintext; consider hashing or
  off-chain storage for production.
- The face-recognition service stores biometric data locally; handle per
  applicable privacy law.
