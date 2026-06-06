import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Create Ballot', to: '/ballot' },
  { label: 'Vote', to: '/voting' },
  { label: 'Results', to: '/result' },
] as const;

export function NavBar() {
  return (
    <AppBar position="static" component="nav" aria-label="Primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={NavLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1, fontWeight: 700 }}
        >
          DeVote
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {NAV_LINKS.map((link) => (
            <Button key={link.to} component={NavLink} to={link.to} color="inherit">
              {link.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
