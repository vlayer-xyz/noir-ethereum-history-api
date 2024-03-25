import { Hex, isHex } from 'viem';
import { BYTE_HEX_LEN } from '../../util/const.js';
import { encodeByte } from '../oracles/common/encode.js';

const TAB_AS_TWO_SPACES = '  ';

// ENCODERS
export function encodeHexString(value: string): Hex[] {
  return Array.from(encodeHexStringToArray(value)).map((byte) => encodeByte(byte));
}

export function encodeHexStringToArray(value: string): Uint8Array {
  if (!isHex(value)) {
    throw new Error(`Invalid hexstring: ${value}`);
  }
  const arr = [];
  for (let i = 2; i < value.length; i += BYTE_HEX_LEN) {
    arr.push(parseInt(value.substr(i, BYTE_HEX_LEN), 16));
  }
  return new Uint8Array(arr);
}

export function encodeOptional(value: string | undefined | null): string {
  if (value !== undefined && value !== null) {
    return `Option::some(${value})`;
  } else {
    return 'Option::none()';
  }
}

export function joinArray(value: string[]): string {
  return `[
${TAB_AS_TWO_SPACES}${value.join(', ')}
]`;
}

export function tabulateLine(line: string, depth: number): string {
  return TAB_AS_TWO_SPACES.repeat(depth) + line;
}

export function tabulateStructField(value: string, depth: number): string {
  const lines = value.split('\n');
  return lines
    .map((line, idx) => {
      return idx === 0 ? line : tabulateLine(line, depth);
    })
    .join('\n');
}

// DECODERS
export function decodeHexString(proof: Uint8Array): string {
  return (
    '0x' +
    Array.from(proof)
      .map((byte) => byte.toString(16).padStart(BYTE_HEX_LEN, '0'))
      .join('')
  );
}
