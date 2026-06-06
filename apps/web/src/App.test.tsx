import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from '@/App';

describe('App shell', () => {
  it('renders the DeVote brand in the navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/DeVote/i).length).toBeGreaterThan(0);
  });

  it('renders a placeholder for the create-ballot route', () => {
    render(
      <MemoryRouter initialEntries={['/ballot']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /create ballot/i })).toBeInTheDocument();
  });
});
