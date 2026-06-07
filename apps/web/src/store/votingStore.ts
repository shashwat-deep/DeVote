import { create } from 'zustand';

import type { BallotInfo, BallotResults } from '@/features/voting/types';

export interface VotingState {
  /** Address of the ballot official currently being viewed. */
  official: string | null;
  info: BallotInfo | null;
  choices: string[];
  results: BallotResults | null;
  isRegistered: boolean;
  hasVoted: boolean;
  loading: boolean;
  patch: (partial: Partial<VotingSnapshot>) => void;
  reset: () => void;
}

type VotingSnapshot = Omit<VotingState, 'patch' | 'reset'>;

const EMPTY: VotingSnapshot = {
  official: null,
  info: null,
  choices: [],
  results: null,
  isRegistered: false,
  hasVoted: false,
  loading: false,
};

export const useVotingStore = create<VotingState>((set) => ({
  ...EMPTY,
  patch: (partial) => set(partial),
  reset: () => set({ ...EMPTY }),
}));
