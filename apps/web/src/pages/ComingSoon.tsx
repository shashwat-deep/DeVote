import { Box, Container, Paper, Typography } from '@mui/material';

interface ComingSoonProps {
  title: string;
}

/**
 * Temporary placeholder for the feature pages (Create / Vote / Results).
 * Replaced with the real Aptos-wired implementations in milestone M4.
 */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <Container>
      <Box my={4}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary">
            This feature is being wired to the Aptos voting contract.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
