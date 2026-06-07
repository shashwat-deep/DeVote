import { Box, Button, Paper, Stack, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

export function BallotLoader({ onLoad }: { onLoad: (official: string) => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onLoad(trimmed);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={submit}>
        <Stack direction="row" spacing={2}>
          <TextField
            label={t('common.ballotAddress')}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={!value.trim()}>
            {t('common.load')}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
