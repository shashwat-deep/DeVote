# Architecture

This document describes the design of DeVote after the modernization overhaul.
It favors a small set of well-applied patterns over framework ceremony.

## Overview

DeVote is a **polyglot monorepo** (pnpm workspaces) with three independent
deployables:

| Package                     | Tech                       | Responsibility                    |
| --------------------------- | -------------------------- | --------------------------------- |
| `apps/web`                  | React 18, Vite, TypeScript | The dApp UI and chain integration |
| `packages/move-contract`    | Aptos Move                 | The on-chain source of truth      |
| `services/face-recognition` | Python                     | Offline voter identity assurance  |

There is intentionally **no backend server or database**: the Move contract is
the system of record, and the frontend talks to the chain directly. This keeps
the trust model simple (no off-chain authority over ballots).

## Frontend — Ports & Adapters (Hexagonal)

The UI never touches the blockchain SDK directly. Dependencies point inward:

```
Pages (React)  ──►  useVoting (application/orchestration)
                         │
            ┌────────────┴────────────┐
            ▼                          ▼
   votingStore (state)        contract.ts (port → adapter)
                                       │
                                       ▼
                          @aptos-labs/ts-sdk + wallet (infrastructure)
```

- **Port / adapter** — `features/voting/contract.ts` is the single boundary to
  the chain. It exposes pure entry-payload **builders** (`tx.createBallot`, …)
  and **view** callers (`getInfo`, `getResults`, …) typed in domain terms
  (`BallotInfo`, `BallotState`). Swapping SDKs or networks touches only this
  file and `lib/aptos.ts`. Because the builders are pure, they are unit-tested
  without any network.
- **Application layer** — `features/voting/useVoting.ts` orchestrates the
  write flow: build payload → wallet `signAndSubmitTransaction` → await on-chain
  confirmation → refresh views → user feedback. UI components stay declarative.
- **State** — `store/votingStore.ts` (Zustand) is a single, unidirectional
  source of UI truth, replacing the original deep prop-drilling (the legacy
  `App.js` threaded ~25 props through every page).
- **Feature-based structure** — code is grouped by capability (`features/voting`,
  `features/wallet`) rather than by technical type, so a feature is easy to
  reason about and remove.
- **Cross-cutting concerns** are isolated as providers: `WalletProvider`,
  `ThemeModeProvider` (persisted light/dark), and i18n (`react-i18next`).
  Configuration is centralized and **validated at runtime** with zod
  (`config/env.ts`), failing fast on misconfiguration.

## Smart contract — resource-oriented design

`devote::voting` stores a `Ballot` **resource under the official's account**.
This is idiomatic Move and gives natural access control: only the official's
`signer` can mutate their ballot, so no role registry is needed.

- **State machine**: `Created → Voting → Ended`, with every transition guarded.
- **Integrity**: a voter registry (`SimpleMap<address, Voter>`) enforces
  eligibility and single-vote; a per-choice `SimpleMap<String, u64>` tally is
  updated atomically with each vote.
- **Read model**: eight `#[view]` functions expose state to the UI so it never
  scans raw transactions. Every state change emits a module `#[event]`.
- **Errors**: namespaced codes via `std::error` categories, asserted in tests.

This mirrors a CQRS-ish split: entry functions = commands, `#[view]` =
queries, events = the change log.

## Data & control flow (cast a vote)

1. Voter loads a ballot by the official's address → `contract` view calls
   populate the store.
2. Voter clicks a choice → `useVoting.castVote` builds the payload and asks the
   wallet to sign.
3. The signed transaction hits `devote::voting::cast_vote`, which validates
   state, registration, and prior-vote, then updates the tally and emits
   `VoteCast`.
4. The hook awaits confirmation and refreshes the store; the UI re-renders.

## Build & quality architecture

- **Vite** for fast dev/build; vendor code-splitting (`vendor-aptos`,
  `vendor-mui`, `vendor-react`) for cacheable chunks.
- **Strict TypeScript** shared via `tsconfig.base.json`.
- **Quality gates**: ESLint (flat) + Prettier + Vitest, enforced by Husky
  (pre-commit: lint-staged; commit-msg: commitlint; pre-push: typecheck+test).
- **Releases**: Conventional Commits → semantic-release → CHANGELOG + tags.
- **CI**: parallel web and Move jobs; an AI review workflow on PRs.

## Key trade-offs

- **Aptos only.** The legacy Ethereum/Truffle implementation was removed rather
  than maintained in parallel.
- **No backend.** Items that assume one (DB, cache, GraphQL/BFF, server rate
  limiting) are deliberately out of scope; the chain is the backend.
- **React 18 / MUI 5 retained.** Major upgrades (React 19, MUI 7) are deferred
  to avoid destabilizing the build mid-overhaul (see the roadmap).
- **ts-sdk pinned to v5** to satisfy the wallet adapter's peer requirement.
