import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import type { ReactNode } from 'react';

import { env } from '@/config/env';

/**
 * Wraps the app in the Aptos wallet adapter. AIP-62 standard wallets
 * (Petra, and others) are auto-detected — no per-wallet plugins required.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider autoConnect dappConfig={{ network: env.network }}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
