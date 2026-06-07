import { Alert, Box, Container, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { BallotLoader } from '@/components/BallotLoader';
import { BallotSummary } from '@/components/BallotSummary';
import { BallotState } from '@/features/voting/types';
import { useVoting } from '@/features/voting/useVoting';
import { useVotingStore } from '@/store/votingStore';

export function ResultsPage() {
  const { t } = useTranslation();
  const { loadBallot } = useVoting();
  const official = useVotingStore((state) => state.official);
  const info = useVotingStore((state) => state.info);
  const results = useVotingStore((state) => state.results);

  const totalVotes = results ? results.counts.reduce((sum, count) => sum + count, 0) : 0;

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <BallotLoader onLoad={(value) => void loadBallot(value)} />

        {info && official && (
          <>
            <BallotSummary info={info} official={official} />

            {info.state !== BallotState.Ended ? (
              <Alert severity="warning">{t('results.notEnded')}</Alert>
            ) : (
              results && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {t('results.title')}
                  </Typography>
                  <Stack spacing={2} mt={2}>
                    {results.choices.map((choice, index) => {
                      const count = results.counts[index] ?? 0;
                      const pct = totalVotes ? (count / totalVotes) * 100 : 0;
                      return (
                        <Box key={choice}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography fontWeight="bold">{choice}</Typography>
                            <Typography>
                              {count} {t('results.votes')}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 10, borderRadius: 5 }}
                            aria-label={`${choice}: ${count} ${t('results.votes')}`}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
