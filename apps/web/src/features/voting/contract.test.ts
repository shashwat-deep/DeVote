import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('voting contract payload builders', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_MODULE_ADDRESS', '0x123');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('builds a create_ballot entry payload', async () => {
    const { tx } = await import('@/features/voting/contract');
    expect(tx.createBallot('Board', 'Question?').data).toEqual({
      function: '0x123::voting::create_ballot',
      functionArguments: ['Board', 'Question?'],
    });
  });

  it('builds a cast_vote entry payload with the official address and choice', async () => {
    const { tx } = await import('@/features/voting/contract');
    const { data } = tx.castVote('0xabc', 'Cat');
    if (!('function' in data)) throw new Error('expected an entry-function payload');
    expect(data.function).toBe('0x123::voting::cast_vote');
    expect(data.functionArguments).toEqual(['0xabc', 'Cat']);
  });

  it('throws a helpful error when the module address is not configured', async () => {
    vi.stubEnv('VITE_MODULE_ADDRESS', '');
    const { tx } = await import('@/features/voting/contract');
    expect(() => tx.startVoting()).toThrow(/VITE_MODULE_ADDRESS/);
  });
});
