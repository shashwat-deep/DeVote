import { describe, expect, it } from 'vitest';

import { shortenAddress, toAddressString } from './address';

describe('address helpers', () => {
  it('returns string addresses unchanged', () => {
    expect(toAddressString('0xabc')).toBe('0xabc');
  });

  it('calls toString() on AccountAddress-like objects', () => {
    expect(toAddressString({ toString: () => '0xdef' })).toBe('0xdef');
  });

  it('shortens long addresses', () => {
    expect(shortenAddress('0x1234567890abcdef')).toBe('0x1234…cdef');
  });

  it('leaves short addresses intact', () => {
    expect(shortenAddress('0x123')).toBe('0x123');
  });
});
