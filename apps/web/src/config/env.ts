import { Network } from '@aptos-labs/ts-sdk';
import { z } from 'zod';

const NETWORKS = {
  testnet: Network.TESTNET,
  devnet: Network.DEVNET,
  mainnet: Network.MAINNET,
  local: Network.LOCAL,
} as const;

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

const schema = z.object({
  VITE_APTOS_NETWORK: z.enum(['testnet', 'devnet', 'mainnet', 'local']).default('testnet'),
  VITE_MODULE_ADDRESS: z
    .string()
    .regex(/^0x[0-9a-fA-F]{1,64}$/, 'must be a 0x-prefixed hex address')
    .or(z.literal(''))
    .default(''),
  VITE_APTOS_FULLNODE_URL: optionalString,
  VITE_APTOS_INDEXER_URL: optionalString,
  VITE_SENTRY_DSN: optionalString,
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const data = parsed.data;

/** Validated, typed, centralized runtime configuration. */
export const env = {
  network: NETWORKS[data.VITE_APTOS_NETWORK],
  moduleAddress: data.VITE_MODULE_ADDRESS,
  fullnodeUrl: data.VITE_APTOS_FULLNODE_URL,
  indexerUrl: data.VITE_APTOS_INDEXER_URL,
  sentryDsn: data.VITE_SENTRY_DSN,
} as const;

export function assertModuleAddress(): string {
  if (!env.moduleAddress) {
    throw new Error(
      'VITE_MODULE_ADDRESS is not configured. Publish the Move contract and set it in your .env.',
    );
  }
  return env.moduleAddress;
}
