import { padHex } from 'viem';
import { Proof } from '../../ethereum/proof.js';
import { encodeHexString } from '../../noir/noir_js/encode.js';
import { ZERO_PAD_VALUE } from '../../noir/oracles/common/const.js';
import { encodeHex, encodeProof } from '../../noir/oracles/common/encode.js';
import { padArray } from '../../util/array.js';
import { BYTE_HEX_LEN } from '../../util/const.js';

export function createProofFixture(
  proof: Proof,
  maxTreeDepth: number,
  maxRlpLen: number,
  maxProfLen: number,
  crateImport: string,
  proofNoirType: string
): string {
  const paddedKey = padHex(proof.key, { size: maxTreeDepth / BYTE_HEX_LEN, dir: 'left' });
  const key = encodeHex(paddedKey);
  const value = padArray(encodeHexString(proof.value), maxRlpLen, ZERO_PAD_VALUE);
  const encodedProof = encodeProof(proof.proof, maxProfLen);
  const depth = proof.proof.length;
  return `use ${crateImport};

global proof = ${proofNoirType} {
  key: [
    ${key.join(',')}
  ],
  value: [
    ${value.join(',')}
  ],
  proof: [
    ${encodedProof.join(',')}
  ],
  depth: ${depth}
};
`;
}
