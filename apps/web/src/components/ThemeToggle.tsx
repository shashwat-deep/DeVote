import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useThemeMode } from '@/theme/themeMode';

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const { t } = useTranslation();
  const label = mode === 'dark' ? t('theme.toLight') : t('theme.toDark');

  return (
    <Tooltip title={label}>
      <IconButton color="inherit" onClick={toggle} aria-label={label}>
        {mode === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
}
