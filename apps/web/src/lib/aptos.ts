import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import { env } from '@/config/env';

/**
 * Shared, read-only Aptos client used for `view` calls and transaction
 * confirmation. Write transactions are signed via the connected wallet.
 */
export const aptos = new Aptos(
  new AptosConfig({
    network: env.network,
    ...(env.fullnodeUrl ? { fullnode: env.fullnodeUrl } : {}),
    ...(env.indexerUrl ? { indexer: env.indexerUrl } : {}),
  }),
);
