import { Box, Container, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <Container>
      <Box my={4}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{children}</Typography>
        </Paper>
      </Box>
    </Container>
  );
}
