import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from '@/App';
import { WalletProvider } from '@/providers/WalletProvider';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import '@/i18n';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Fatal: #root element not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <WalletProvider>
      <ThemeModeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </ThemeModeProvider>
    </WalletProvider>
  </StrictMode>,
);
