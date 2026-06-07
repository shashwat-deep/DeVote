# Contributing to DeVote

Thanks for your interest in contributing! This project is a pnpm monorepo.

## Getting started

```bash
corepack enable
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

## Development workflow

1. Branch off `main` (e.g. `feat/...`, `fix/...`, `docs/...`).
2. Make your change. Add or update tests.
3. Keep these green (Husky also enforces them on commit/push):
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm move:test   # if you touched the contract
   ```
4. Open a PR. CI and an automated AI review will run.

## Commit messages — Conventional Commits

Commit messages are linted (`commitlint`) and drive automated releases
(`semantic-release`). Use:

```
<type>(optional scope): <summary>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`,
`chore`. Breaking changes: add `!` (e.g. `feat!:`) or a `BREAKING CHANGE:`
footer. `feat` → minor, `fix` → patch, breaking → major.

## Scaffolding

Generate boilerplate that matches the architecture:

```bash
pnpm scaffold        # choose "component" or "page"
```

## Code style

- TypeScript strict; prefer the `contract.ts` adapter for any chain access.
- Formatting/linting is automatic via Prettier + ESLint (pre-commit).
- Externalize user-facing strings into `apps/web/src/i18n/locales`.

## Reporting security issues

Please follow [SECURITY.md](./SECURITY.md) — do not open public issues for
vulnerabilities.
