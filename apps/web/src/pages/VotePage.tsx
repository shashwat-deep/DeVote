import { Alert, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BallotLoader } from '@/components/BallotLoader';
import { BallotSummary } from '@/components/BallotSummary';
import { BallotState } from '@/features/voting/types';
import { useVoting } from '@/features/voting/useVoting';
import { useVotingStore } from '@/store/votingStore';

export function VotePage() {
  const { t } = useTranslation();
  const { loadBallot, castVote, connected } = useVoting();
  const official = useVotingStore((state) => state.official);
  const info = useVotingStore((state) => state.info);
  const choices = useVotingStore((state) => state.choices);
  const isRegistered = useVotingStore((state) => state.isRegistered);
  const hasVoted = useVotingStore((state) => state.hasVoted);

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <BallotLoader onLoad={(value) => void loadBallot(value)} />

        {info && official && (
          <>
            <BallotSummary info={info} official={official} />

            {info.state === BallotState.Created && (
              <Alert severity="warning">{t('vote.notStarted')}</Alert>
            )}
            {info.state === BallotState.Ended && <Alert severity="info">{t('vote.ended')}</Alert>}

            {info.state === BallotState.Voting && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('vote.title')}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {!connected ? (
                  <Alert severity="info">{t('common.connectFirst')}</Alert>
                ) : !isRegistered ? (
                  <Alert severity="error">{t('vote.notRegistered')}</Alert>
                ) : hasVoted ? (
                  <Alert severity="success">{t('vote.alreadyVoted')}</Alert>
                ) : (
                  <>
                    <Typography gutterBottom>{t('vote.pick')}</Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }} useFlexGap>
                      {choices.map((choice) => (
                        <Button
                          key={choice}
                          variant="outlined"
                          onClick={() => void castVote(official, choice)}
                        >
                          {choice}
                        </Button>
                      ))}
                    </Stack>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                <Alert severity="success">
                  {t('vote.progress', { voted: info.totalVote, total: info.totalVoter })}
                </Alert>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
