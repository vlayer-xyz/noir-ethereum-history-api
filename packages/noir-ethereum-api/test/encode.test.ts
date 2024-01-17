import { describe, expect, it } from 'vitest';
import { decodeField, decodeHexAddress, encodeAddress, encodeBytes32 } from '../src/noir/encode.js';

describe('encodeBytes32', () => {
  it('zero', () => {
    // prettier-ignore
    expect(encodeBytes32(0n)).toStrictEqual([
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0',
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0'
    ]);
  });

  it('one', () => {
    // prettier-ignore
    expect(encodeBytes32(1n)).toStrictEqual([
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0',
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x1'
    ]);
  });

  it('4 bytes number', () => {
    // prettier-ignore
    expect(encodeBytes32(3000000019n)).toStrictEqual([
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0',
      '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0x0', '0xb2', '0xd0', '0x5e', '0x13'
    ]);
  });

  it('MAX_INT_256', () => {
    // prettier-ignore
    expect(encodeBytes32(2n ** 256n - 1n)).toStrictEqual([
      '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff',
      '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff', '0xff',
      '0xff', '0xff', '0xff', '0xff'
    ]);
  });

  it('throws if negative value', () => {
    expect(() => encodeBytes32(-1n)).toThrow('Invalid Bytes32: Negative');
  });

  it('throws if overflows', () => {
    expect(() => encodeBytes32(2n ** 256n)).toThrow('Invalid Bytes32: Overflow');
  });
});

describe('encodeAddress', () => {
  it.skip('success', () => {
    // prettier-ignore
    expect(encodeAddress('0xb47e3cd837dDF8e4c57f05d70ab865de6e193bbb')).toStrictEqual([
      '0xb4', '0x7e', '0x3c', '0xd8', '0x37', '0xdd', '0xf8', '0xe4', '0xc5', '0x7f', '0x5', '0xd7', '0xa', '0xb8',
      '0x65', '0xde', '0x6e', '0x19', '0x3b', '0xbb'
    ]);
  });
});

describe('decodeHexAddress', () => {
  it('success', () => {
    const arg =[
      '0x00000000000000000000000000000000000000000000000000000000000000b4',
      '0x000000000000000000000000000000000000000000000000000000000000007e',
      '0x000000000000000000000000000000000000000000000000000000000000003c',
      '0x00000000000000000000000000000000000000000000000000000000000000d8',
      '0x0000000000000000000000000000000000000000000000000000000000000037',
      '0x00000000000000000000000000000000000000000000000000000000000000dd',
      '0x00000000000000000000000000000000000000000000000000000000000000f8',
      '0x00000000000000000000000000000000000000000000000000000000000000e4',
      '0x00000000000000000000000000000000000000000000000000000000000000c5',
      '0x000000000000000000000000000000000000000000000000000000000000007f',
      '0x0000000000000000000000000000000000000000000000000000000000000005',
      '0x00000000000000000000000000000000000000000000000000000000000000d7',
      '0x000000000000000000000000000000000000000000000000000000000000000a',
      '0x00000000000000000000000000000000000000000000000000000000000000b8',
      '0x0000000000000000000000000000000000000000000000000000000000000065',
      '0x00000000000000000000000000000000000000000000000000000000000000de',
      '0x000000000000000000000000000000000000000000000000000000000000006e',
      '0x0000000000000000000000000000000000000000000000000000000000000019',
      '0x000000000000000000000000000000000000000000000000000000000000003b',
      '0x00000000000000000000000000000000000000000000000000000000000000bb'
    ];
    expect(decodeHexAddress(arg)).toBe('0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb');
  });
});

describe('decodeField', () => {
  it('success', () => {
    expect(decodeField('0x0')).toEqual(0n);
    expect(decodeField('0x0000')).toEqual(0n);
    expect(decodeField('0x1')).toEqual(1n);
    expect(decodeField('0xff')).toEqual(255n);
    expect(decodeField('0x1fffffffffffff')).toEqual(9007199254740991n);
    expect(decodeField('0x0000000000000000000000000000000000000000000000000000000000000000')).toEqual(0n);
    expect(decodeField('0x0000000000000000000000000000000000000000000000000003f28cb71571c7')).toEqual(
      1111111111111111n
    );
    expect(decodeField('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')).toEqual(
      115792089237316195423570985008687907853269984665640564039457584007913129639935n
    );
  });
});
