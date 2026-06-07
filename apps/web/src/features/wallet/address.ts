/** Normalize a wallet/account address (AccountAddress | string) to a 0x string. */
export function toAddressString(address: string | { toString(): string }): string {
  return typeof address === 'string' ? address : address.toString();
}

/** Shorten an address for display, e.g. 0x1234…abcd. */
export function shortenAddress(address: string, lead = 6, tail = 4): string {
  if (address.length <= lead + tail) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}
