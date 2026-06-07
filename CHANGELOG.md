# Changelog

All notable changes to this project are documented here. This file is
maintained automatically by [semantic-release](https://semantic-release.gitbook.io/)
from Conventional Commit messages; the entry below summarizes the initial
modernization that predates the first automated release.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased] — Aptos modernization overhaul

### Added

- pnpm monorepo: `apps/web`, `packages/move-contract`, `services/face-recognition`.
- Modern frontend toolchain: Vite + TypeScript (strict), ESLint flat config,
  Prettier, Vitest, Husky, commitlint, semantic-release.
- Real Aptos integration with `@aptos-labs/ts-sdk` and the wallet adapter
  (Petra), a ports-and-adapters chain client, a Zustand store, dark mode, and
  i18n.
- Complete `devote::voting` Move contract: voter registry, state machine,
  single-vote enforcement, tallying, `#[view]` functions, events, and unit tests.
- Runtime env validation (zod), lazy Sentry telemetry, CSP/security headers,
  a plop scaffolder, multi-stage Docker + nginx, and CI/CD workflows.
- Documentation: README (with architecture diagram), ARCHITECTURE, SECURITY,
  CONTRIBUTING, CODE_OF_CONDUCT, disaster-recovery, and audit reports.

### Changed

- Frontend migrated off the deprecated Create React App toolchain.
- Architecture moved from prop-drilling to a store + ports/adapters design.

### Removed

- The entire legacy Ethereum / Truffle / Solidity / web3 implementation,
  including the generated `Data.js` bytecode artifact.

### Fixed

- Broken Aptos SDK import that prevented the app from building.
- `cast_vote` reading the ballot from the wrong account (every vote aborted).
- Uncallable contract functions (`public fun` → `public entry`).
- Hardcoded Windows path in the Python face-recognition CLI.
- Moderate transitive `uuid` advisory (via pnpm override).
