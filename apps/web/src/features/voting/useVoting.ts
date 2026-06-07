import { useCallback } from 'react';
import { useWallet, type InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-toastify';

import { toAddressString } from '@/features/wallet/address';
import { aptos } from '@/lib/aptos';
import { useVotingStore } from '@/store/votingStore';

import * as contract from './contract';

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unexpected error';
}

/**
 * High-level voting operations bound to the connected wallet.
 *
 * Reads flow through the Aptos `view` API into the shared store; writes are
 * signed by the wallet, confirmed on-chain, then trigger a store refresh.
 */
export function useVoting() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const address = account ? toAddressString(account.address) : null;

  const refresh = useCallback(
    async (official: string): Promise<boolean> => {
      const { patch } = useVotingStore.getState();
      patch({ loading: true });
      try {
        if (!(await contract.ballotExists(official))) {
          patch({
            loading: false,
            official: null,
            info: null,
            choices: [],
            results: null,
            isRegistered: false,
            hasVoted: false,
          });
          return false;
        }
        const [info, choices, results] = await Promise.all([
          contract.getInfo(official),
          contract.getChoices(official),
          contract.getResults(official),
        ]);
        let isRegistered = false;
        let hasVoted = false;
        if (address) {
          [isRegistered, hasVoted] = await Promise.all([
            contract.isRegistered(official, address),
            contract.hasVoted(official, address),
          ]);
        }
        patch({ official, info, choices, results, isRegistered, hasVoted, loading: false });
        return true;
      } catch (error) {
        patch({ loading: false });
        toast.error(errorMessage(error));
        return false;
      }
    },
    [address],
  );

  const send = useCallback(
    async (
      payload: InputTransactionData,
      successMessage: string,
      refreshFor?: string,
    ): Promise<boolean> => {
      if (!connected) {
        toast.error('Connect your wallet first.');
        return false;
      }
      const { patch } = useVotingStore.getState();
      patch({ loading: true });
      try {
        const result = await signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ transactionHash: result.hash });
        toast.success(successMessage);
        if (refreshFor) {
          await refresh(refreshFor);
        } else {
          patch({ loading: false });
        }
        return true;
      } catch (error) {
        patch({ loading: false });
        toast.error(errorMessage(error));
        return false;
      }
    },
    [connected, signAndSubmitTransaction, refresh],
  );

  const createBallot = useCallback(
    (name: string, proposal: string) =>
      send(contract.tx.createBallot(name, proposal), 'Ballot created.', address ?? undefined),
    [send, address],
  );
  const addChoice = useCallback(
    (choice: string) => send(contract.tx.addChoice(choice), 'Choice added.', address ?? undefined),
    [send, address],
  );
  const addVoter = useCallback(
    (voter: string, name: string) =>
      send(contract.tx.addVoter(voter, name), 'Voter registered.', address ?? undefined),
    [send, address],
  );
  const startVoting = useCallback(
    () => send(contract.tx.startVoting(), 'Voting started.', address ?? undefined),
    [send, address],
  );
  const endVoting = useCallback(
    () => send(contract.tx.endVoting(), 'Voting ended.', address ?? undefined),
    [send, address],
  );
  const castVote = useCallback(
    (official: string, choice: string) =>
      send(contract.tx.castVote(official, choice), 'Vote cast.', official),
    [send],
  );

  return {
    address,
    connected,
    loadBallot: refresh,
    refresh,
    createBallot,
    addChoice,
    addVoter,
    startVoting,
    endVoting,
    castVote,
  };
}
