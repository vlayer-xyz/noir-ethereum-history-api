import { describe, expect, it } from 'vitest';
import {
  decodeHexString,
  encodeHexString,
  encodeHexStringToArray,
  encodeOptional,
  joinArray,
  tabulateLine,
  tabulateStructField
} from './encode.js';

describe('encodeHexStringToArray', () => {
  it('throws on invalid input', () => {
    expect(() => encodeHexStringToArray('1234')).toThrow('Invalid hexstring: 1234');
  });
  it('encodes hex string to array', () => {
    expect(encodeHexStringToArray('0x1234')).toStrictEqual(new Uint8Array([0x12, 0x34]));
  });
});

describe('encodeHexString', () => {
  it('encodes hex string', () => {
    expect(encodeHexString('0x000123')).toStrictEqual(['0x00', '0x01', '0x23']);
  });
});

describe('encodeOptional', () => {
  it('encodes optional', () => {
    expect(encodeOptional('0x1234')).toBe('Option::some(0x1234)');
    expect(encodeOptional(null)).toBe('Option::none()');
  });
});

describe('joinArray', () => {
  it('joins array', () => {
    const expectedFormattedArray = `[
  0x12, 0x34
]`;
    expect(joinArray(['0x12', '0x34'])).toBe(expectedFormattedArray);
  });
});

describe('tabulateLine', () => {
  it('tabulates line', () => {
    expect(tabulateLine('line', 2)).toBe('    line');
  });
});

describe('tabulateStructField', () => {
  it('tabulates struct field', () => {
    const value = '[\n  1\n]';
    expect(tabulateStructField(value, 0)).toMatch(`[
  1
]`);
    expect(tabulateStructField(value, 1)).toMatch(`[
    1
  ]`);
  });
});

describe('decodeHexString', () => {
  it('decodes hex string', () => {
    expect(decodeHexString(new Uint8Array([0x12, 0x34]))).toStrictEqual('0x1234');
  });
});
