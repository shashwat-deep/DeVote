/** Lifecycle state of a ballot, mirroring the on-chain `voting` module. */
export enum BallotState {
  Created = 0,
  Voting = 1,
  Ended = 2,
}

export interface BallotInfo {
  officialName: string;
  proposal: string;
  state: BallotState;
  totalVoter: number;
  totalVote: number;
}

export interface BallotResults {
  choices: string[];
  counts: number[];
}
