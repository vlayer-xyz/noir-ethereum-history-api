import { Proof } from '../../ethereum/proof.js';
import {
  MAX_RECEIPT_KEY_NIBBLE_LEN,
  MAX_RECEIPT_PROOF_LEN,
  MAX_RECEIPT_RLP_LEN
} from '../../noir/oracles/receiptOracle/encode.js';
import { createProofFixture } from './proof.js';

export function createReceiptProofFixture(proof: Proof): string {
  return createProofFixture(
    proof,
    MAX_RECEIPT_KEY_NIBBLE_LEN,
    MAX_RECEIPT_RLP_LEN,
    MAX_RECEIPT_PROOF_LEN,
    'dep::proof::trie_proof::TrieProof',
    'TrieProof'
  );
}
