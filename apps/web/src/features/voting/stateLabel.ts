import { BallotState } from './types';

/** Maps a ballot state to its i18n translation key. */
export function stateLabelKey(state: BallotState): string {
  switch (state) {
    case BallotState.Created:
      return 'state.created';
    case BallotState.Voting:
      return 'state.voting';
    case BallotState.Ended:
      return 'state.ended';
    default:
      return 'state.created';
  }
}
