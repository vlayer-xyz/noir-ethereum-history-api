import { assert } from './assert.js';
import { BYTE_HEX_LEN } from './const.js';

const PREFIX = '0x';

export function hasHexPrefix(hex: string): boolean {
  return hex.startsWith(PREFIX);
}

export function removeHexPrefix(hex: string): string {
  assert(hasHexPrefix(hex), `Attempting to remove 0x prefix from ${hex} which does not have it`);
  return hex.slice(PREFIX.length);
}

export function addHexPrefix(hex: string): string {
  assert(!hasHexPrefix(hex), `Attempting to add 0x prefix to ${hex} which already has it`);
  return `${PREFIX}${hex}`;
}

function padUnPrefixedToEven(hex: string): string {
  return hex.length % BYTE_HEX_LEN == 0 ? hex : `0${hex}`;
}

export function padHexToEven(hex: string): string {
  if (hasHexPrefix(hex)) {
    return addHexPrefix(padUnPrefixedToEven(removeHexPrefix(hex)));
  } else {
    return padUnPrefixedToEven(hex);
  }
}
