import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { CenteredMessage } from '@/components/CenteredMessage';
import { BallotState } from '@/features/voting/types';
import { useVoting } from '@/features/voting/useVoting';
import { useVotingStore } from '@/store/votingStore';

export function CreateBallotPage() {
  const { t } = useTranslation();
  const { address, connected, createBallot, addChoice, addVoter, startVoting, loadBallot } =
    useVoting();
  const official = useVotingStore((state) => state.official);
  const info = useVotingStore((state) => state.info);
  const choices = useVotingStore((state) => state.choices);

  const [ballot, setBallot] = useState({ name: '', proposal: '' });
  const [choice, setChoice] = useState('');
  const [voter, setVoter] = useState({ address: '', name: '' });

  useEffect(() => {
    if (connected && address) void loadBallot(address);
  }, [connected, address, loadBallot]);

  if (!connected) {
    return <CenteredMessage>{t('common.connectFirst')}</CenteredMessage>;
  }

  const hasBallot = Boolean(info) && official === address;
  const isCreated = hasBallot && info?.state === BallotState.Created;

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (await createBallot(ballot.name, ballot.proposal)) setBallot({ name: '', proposal: '' });
  };
  const onAddChoice = async (event: FormEvent) => {
    event.preventDefault();
    if (await addChoice(choice)) setChoice('');
  };
  const onAddVoter = async (event: FormEvent) => {
    event.preventDefault();
    if (await addVoter(voter.address, voter.name)) setVoter({ address: '', name: '' });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            {t('create.title')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {hasBallot ? (
            <Alert severity="info">{t('create.alreadyCreated')}</Alert>
          ) : (
            <Box component="form" onSubmit={onCreate}>
              <Stack spacing={2}>
                <TextField
                  label={t('create.name')}
                  value={ballot.name}
                  onChange={(e) => setBallot({ ...ballot, name: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label={t('create.proposalLabel')}
                  value={ballot.proposal}
                  onChange={(e) => setBallot({ ...ballot, proposal: e.target.value })}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!ballot.name || !ballot.proposal}
                >
                  {t('create.submit')}
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>

        {isCreated && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('create.choicesTitle')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box component="form" onSubmit={onAddChoice}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label={t('create.choiceLabel')}
                  value={choice}
                  onChange={(e) => setChoice(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={!choice}>
                  {t('create.addChoice')}
                </Button>
              </Stack>
            </Box>
            {choices.length > 0 && (
              <Stack spacing={1} mt={2}>
                {choices.map((value) => (
                  <Paper key={value} variant="outlined" sx={{ px: 2, py: 1 }}>
                    <Typography>{value}</Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        )}

        {isCreated && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('create.votersTitle')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Alert severity={info && info.totalVoter > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {info && info.totalVoter > 0
                ? t('create.registered', { count: info.totalVoter })
                : t('create.noVoters')}
            </Alert>
            <Box component="form" onSubmit={onAddVoter}>
              <Stack spacing={2}>
                <TextField
                  label={t('create.voterAddress')}
                  value={voter.address}
                  onChange={(e) => setVoter({ ...voter, address: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label={t('create.voterName')}
                  value={voter.name}
                  onChange={(e) => setVoter({ ...voter, name: e.target.value })}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={!voter.address || !voter.name}>
                  {t('create.addVoter')}
                </Button>
              </Stack>
            </Box>
          </Paper>
        )}

        {isCreated && (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => void startVoting()}
            disabled={choices.length === 0 || !info || info.totalVoter === 0}
          >
            {t('create.start')}
          </Button>
        )}

        {hasBallot && info && info.state !== BallotState.Created && (
          <Alert severity="success">
            {t(info.state === BallotState.Voting ? 'state.voting' : 'state.ended')}
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
