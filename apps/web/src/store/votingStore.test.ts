import { beforeEach, describe, expect, it } from 'vitest';

import { BallotState } from '@/features/voting/types';

import { useVotingStore } from './votingStore';

describe('votingStore', () => {
  beforeEach(() => {
    useVotingStore.getState().reset();
  });

  it('patches partial state', () => {
    useVotingStore.getState().patch({ official: '0xabc', loading: true });
    expect(useVotingStore.getState().official).toBe('0xabc');
    expect(useVotingStore.getState().loading).toBe(true);
  });

  it('resets to the empty snapshot', () => {
    useVotingStore.getState().patch({
      official: '0xabc',
      info: {
        officialName: 'Board',
        proposal: 'Q?',
        state: BallotState.Voting,
        totalVoter: 1,
        totalVote: 1,
      },
      choices: ['a'],
    });
    useVotingStore.getState().reset();
    const state = useVotingStore.getState();
    expect(state.official).toBeNull();
    expect(state.info).toBeNull();
    expect(state.choices).toEqual([]);
  });
});
