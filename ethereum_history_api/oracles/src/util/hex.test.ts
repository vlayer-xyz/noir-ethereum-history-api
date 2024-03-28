import { describe, expect, it } from 'vitest';
import { addHexPrefix, hasHexPrefix, padHexToEven, removeHexPrefix } from './hex.js';

describe('hex', () => {
  it('hasPrefix', () => {
    expect(hasHexPrefix('0x01')).toEqual(true);
    expect(hasHexPrefix('01')).toEqual(false);
  });

  it('removePrefix', () => {
    expect(removeHexPrefix('0x01')).toEqual('01');

    expect(() => removeHexPrefix('01')).toThrow('Attempting to remove 0x prefix from 01 which does not have it');
  });

  it('addPrefix', () => {
    expect(addHexPrefix('1')).toEqual('0x1');
    expect(addHexPrefix('01')).toEqual('0x01');

    expect(() => addHexPrefix('0x01')).toThrow('Attempting to add 0x prefix to 0x01 which already has it');
  });

  it('padHexToEven', () => {
    expect(padHexToEven('')).toEqual('');
    expect(padHexToEven('1')).toEqual('01');
    expect(padHexToEven('01')).toEqual('01');
    expect(padHexToEven('0x1')).toEqual('0x01');
    expect(padHexToEven('0x01')).toEqual('0x01');
    expect(padHexToEven('0x01234')).toEqual('0x001234');
  });
});
