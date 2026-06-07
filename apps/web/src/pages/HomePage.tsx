import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import '@/App.css';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <Box className="home" display="flex" width="100%" alignItems="center" justifyContent="center">
      <Box className="wrapper">
        <Box className="glow" data-text="Glow">
          {t('app.tagline')}
        </Box>
        <Box className="glow-shadow" aria-hidden="true">
          {t('app.name')}
        </Box>
      </Box>
    </Box>
  );
}
