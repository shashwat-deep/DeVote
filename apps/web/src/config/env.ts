import { Network } from '@aptos-labs/ts-sdk';

const NETWORKS: Record<string, Network> = {
  testnet: Network.TESTNET,
  devnet: Network.DEVNET,
  mainnet: Network.MAINNET,
  local: Network.LOCAL,
};

function resolveNetwork(raw: string | undefined): Network {
  return NETWORKS[(raw ?? 'testnet').toLowerCase()] ?? Network.TESTNET;
}

/**
 * Typed, centralized access to build-time configuration.
 * Runtime schema validation (zod) is layered on in milestone M5.
 */
export const env = {
  network: resolveNetwork(import.meta.env.VITE_APTOS_NETWORK),
  moduleAddress: import.meta.env.VITE_MODULE_ADDRESS ?? '',
  fullnodeUrl: import.meta.env.VITE_APTOS_FULLNODE_URL || undefined,
  indexerUrl: import.meta.env.VITE_APTOS_INDEXER_URL || undefined,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || undefined,
} as const;

export function assertModuleAddress(): string {
  if (!env.moduleAddress) {
    throw new Error(
      'VITE_MODULE_ADDRESS is not configured. Publish the Move contract and set it in your .env.',
    );
  }
  return env.moduleAddress;
}
