import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { App } from '@/App';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';

/** Render the full app at a given route with the theme provider in place. */
export function renderApp(route = '/') {
  return render(
    <ThemeModeProvider>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    </ThemeModeProvider>,
  );
}
