import { Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { stateLabelKey } from '@/features/voting/stateLabel';
import { BallotState, type BallotInfo } from '@/features/voting/types';

export function BallotSummary({ info, official }: { info: BallotInfo; official: string }) {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h5" fontWeight="bold">
          {info.officialName}
        </Typography>
        <Typography color="text.secondary">{info.proposal}</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label={t(stateLabelKey(info.state))}
            color={info.state === BallotState.Ended ? 'default' : 'primary'}
          />
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
            {official}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
