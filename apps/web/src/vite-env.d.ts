/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APTOS_NETWORK?: string;
  readonly VITE_MODULE_ADDRESS?: string;
  readonly VITE_APTOS_FULLNODE_URL?: string;
  readonly VITE_APTOS_INDEXER_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
