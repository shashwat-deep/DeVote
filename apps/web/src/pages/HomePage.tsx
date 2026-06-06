import { Box } from '@mui/material';

import '@/App.css';

export function HomePage() {
  return (
    <Box className="home" display="flex" width="100%" alignItems="center" justifyContent="center">
      <Box className="wrapper">
        <Box className="glow" data-text="Glow">
          Decentralized Voting on Aptos
        </Box>
        <Box className="glow-shadow" aria-hidden="true">
          DeVote
        </Box>
      </Box>
    </Box>
  );
}
