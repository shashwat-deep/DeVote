import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the wallet adapter so components that call useWallet render without a provider.
vi.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => ({
    account: null,
    connected: false,
    wallets: [],
    connect: vi.fn(),
    disconnect: vi.fn(),
    signAndSubmitTransaction: vi.fn(),
  }),
  AptosWalletAdapterProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { renderApp } from '@/test/renderApp';
import '@/i18n';

describe('App', () => {
  it('renders the DeVote brand in the navigation', () => {
    renderApp('/');
    expect(screen.getAllByText('DeVote').length).toBeGreaterThan(0);
  });

  it('prompts to connect a wallet on the create page when disconnected', () => {
    renderApp('/ballot');
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
  });

  it('shows the ballot-address loader on the vote page', () => {
    renderApp('/voting');
    expect(screen.getByLabelText(/ballot address/i)).toBeInTheDocument();
  });
});
