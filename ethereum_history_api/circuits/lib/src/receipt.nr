use crate::misc::types::{Bytes32, Address};
use crate::header::get_header;
use crate::verifiers::receipt::verify_receipt;
use dep::std::unsafe::zeroed;
use dep::proof::const::MAX_TRIE_NODE_LENGTH;

global BLOOM_FILTER_LEN = 256;
global MAX_RECEIPT_KEY_LEN = 4;
global MAX_RECEIPT_TREE_DEPTH = 7;
global MAX_RECEIPT_PROOF_LEN = 3724; // = MAX_RECEIPT_TREE_DEPTH * MAX_TRIE_NODE_LENGTH

struct TxReceipt {
    status: Option<u1>,
    state_root: Option<Bytes32>,
    cumulative_gas_used: Field,
    logs_bloom: [u8; BLOOM_FILTER_LEN]
}

struct TxReceiptProof {
    key: [u8; MAX_RECEIPT_KEY_LEN],
    value: [u8; MAX_TRIE_NODE_LENGTH],
    proof: [u8; MAX_RECEIPT_PROOF_LEN],
    depth: u64
}

struct TxReceiptWithinBlock {
    receipt: TxReceipt,
    block_hash: Bytes32
}

pub fn get_receipt(block_number: Field, tx_idx: Field) -> TxReceiptWithinBlock {
    let (receipt, proof): (TxReceipt, TxReceiptProof) = get_receipt_unconstrained(block_number, tx_idx);
    zeroed()
}

#[oracle(get_receipt)]
unconstrained fn get_receipt_oracle(_block_number: Field, _tx_idx: Field) -> (TxReceipt, TxReceiptProof) {}

unconstrained fn get_receipt_unconstrained(
    block_number: Field,
    tx_idx: Field
) -> (TxReceipt, TxReceiptProof) {
    get_receipt_oracle(block_number, tx_idx)
}
