import { padHex } from 'viem';
import { Proof } from '../../ethereum/proof.js';
import { encodeHexString, joinArray } from '../../noir/noir_js/encode.js';
import { ZERO_PAD_VALUE } from '../../noir/oracles/common/const.js';
import { encodeHex, encodeProof } from '../../noir/oracles/common/encode.js';
import { padArray } from '../../util/array.js';
import { BYTE_HEX_LEN } from '../../util/const.js';

export function createProofFixture(
  proof: Proof,
  maxTreeDepth: number,
  maxRlpLen: number,
  maxProofLen: number,
  crateImport: string,
  proofNoirType: string
): string {
  const paddedKey = padHex(proof.key, { size: maxTreeDepth / BYTE_HEX_LEN, dir: 'left' });
  const key = encodeHex(paddedKey);
  const value = padArray(encodeHexString(proof.value), maxRlpLen, ZERO_PAD_VALUE, 'left');
  const encodedProof = encodeProof(proof.proof, maxProofLen);
  const depth = proof.proof.length;
  return `use ${crateImport};

global proof = ${proofNoirType} {
  key: ${joinArray(key)},
  value: ${joinArray(value)},
  proof: ${joinArray(encodedProof)},
  depth: ${depth}
};
`;
}
