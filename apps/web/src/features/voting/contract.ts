import type { InputTransactionData } from '@aptos-labs/wallet-adapter-react';

import { assertModuleAddress } from '@/config/env';
import { aptos } from '@/lib/aptos';

import type { BallotInfo, BallotResults, BallotState } from './types';

const MODULE = 'voting';

type MoveFnId = `${string}::${string}::${string}`;

function fn(name: string): MoveFnId {
  return `${assertModuleAddress()}::${MODULE}::${name}`;
}

// ─────────────────── Entry-function payload builders ───────────────────
// Pure functions (no I/O) — trivially unit-testable. Pass the result to the
// wallet's `signAndSubmitTransaction`.
export const tx = {
  createBallot: (officialName: string, proposal: string): InputTransactionData => ({
    data: { function: fn('create_ballot'), functionArguments: [officialName, proposal] },
  }),
  addChoice: (choice: string): InputTransactionData => ({
    data: { function: fn('add_choice'), functionArguments: [choice] },
  }),
  addVoter: (voter: string, voterName: string): InputTransactionData => ({
    data: { function: fn('add_voter'), functionArguments: [voter, voterName] },
  }),
  startVoting: (): InputTransactionData => ({
    data: { function: fn('start_voting'), functionArguments: [] },
  }),
  castVote: (official: string, choice: string): InputTransactionData => ({
    data: { function: fn('cast_vote'), functionArguments: [official, choice] },
  }),
  endVoting: (): InputTransactionData => ({
    data: { function: fn('end_voting'), functionArguments: [] },
  }),
} as const;

// ───────────────────────────── View calls ─────────────────────────────
export async function ballotExists(official: string): Promise<boolean> {
  const [exists] = await aptos.view<[boolean]>({
    payload: { function: fn('ballot_exists'), functionArguments: [official] },
  });
  return exists;
}

export async function getInfo(official: string): Promise<BallotInfo> {
  const [officialName, proposal, state, totalVoter, totalVote] = await aptos.view<
    [string, string, number, string, string]
  >({ payload: { function: fn('get_info'), functionArguments: [official] } });
  return {
    officialName,
    proposal,
    state: state as BallotState,
    totalVoter: Number(totalVoter),
    totalVote: Number(totalVote),
  };
}

export async function getChoices(official: string): Promise<string[]> {
  const [choices] = await aptos.view<[string[]]>({
    payload: { function: fn('get_choices'), functionArguments: [official] },
  });
  return choices;
}

export async function getResults(official: string): Promise<BallotResults> {
  const [choices, counts] = await aptos.view<[string[], string[]]>({
    payload: { function: fn('get_results'), functionArguments: [official] },
  });
  return { choices, counts: counts.map(Number) };
}

export async function isRegistered(official: string, voter: string): Promise<boolean> {
  const [registered] = await aptos.view<[boolean]>({
    payload: { function: fn('is_registered'), functionArguments: [official, voter] },
  });
  return registered;
}

export async function hasVoted(official: string, voter: string): Promise<boolean> {
  const [voted] = await aptos.view<[boolean]>({
    payload: { function: fn('has_voted'), functionArguments: [official, voter] },
  });
  return voted;
}
