# 1.0.0 (2026-06-07)


* refactor!: establish pnpm monorepo and purge legacy Ethereum stack ([c9be7dd](https://github.com/shashwat-deep/DeVote/commit/c9be7ddb08532c977cc954428e9e97c470bbfbc8))


### Bug Fixes

* **ci:** scope root test script to the web app ([404b394](https://github.com/shashwat-deep/DeVote/commit/404b39435983bfa472c2fd96dece42cc3595b7f6))


### Features

* **contract:** rewrite Aptos Move voting module with full lifecycle ([5485ec6](https://github.com/shashwat-deep/DeVote/commit/5485ec66a0f54d64e4dd47af428e9b6b17d62f5f))
* **quality:** env validation, telemetry, security hardening, scaffolder ([57e07ad](https://github.com/shashwat-deep/DeVote/commit/57e07ad3db7858bb9566b8f5e5b4bc669dfa3e93))
* **web:** real Aptos/Petra integration with ports-and-adapters architecture ([8e82e70](https://github.com/shashwat-deep/DeVote/commit/8e82e70916c5b9b44aed66bbf30b9dd12dbbeb06))


### BREAKING CHANGES

* project layout moved to a monorepo; the Ethereum/web3
contract implementation and its build pipeline are removed entirely.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>

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
