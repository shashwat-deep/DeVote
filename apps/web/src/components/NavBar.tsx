import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { ThemeToggle } from './ThemeToggle';
import { WalletConnectButton } from './WalletConnectButton';

export function NavBar() {
  const { t } = useTranslation();

  const links = [
    { label: t('nav.create'), to: '/ballot' },
    { label: t('nav.vote'), to: '/voting' },
    { label: t('nav.results'), to: '/result' },
  ];

  return (
    <AppBar position="static" component="nav" aria-label="Primary">
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={NavLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}
        >
          {t('app.name')}
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, ml: 2 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              color="inherit"
              sx={{ '&.active': { textDecoration: 'underline' } }}
            >
              {link.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center">
          <ThemeToggle />
          <WalletConnectButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
