use dep::proof::{
    const::{HASH_LENGTH, MAX_RECEIPT_RLP_LENGTH as MAX_ENCODED_RECEIPT_LENGTH}, trie_proof::TrieProof,
    rlp::{RLP_List, decode1, decode0, STRING, LIST}, utils::{byte_value, memcpy}
};
use crate::receipt::{TxReceiptProof, TxReceiptPartial, MAX_RECEIPT_TREE_DEPTH, TxType, BLOOM_FILTER_LEN};

global RECEIPT_FIELDS_COUNT = 4;

global BYZANTIUM_BLOCK_NUM: u64 = 4_370_000;
global MAX_RECEIPT_RLP_LENGTH: u64 = MAX_ENCODED_RECEIPT_LENGTH - 1;

pub(crate) fn is_pre_byzantium(block_number: u64) -> bool {
    block_number < BYZANTIUM_BLOCK_NUM
}

pub(crate) fn split_receipt_into_tx_type_and_receipt_rlp(
    tx_type: TxType,
    encoded_receipt: [u8; MAX_ENCODED_RECEIPT_LENGTH]
) -> (u8, [u8; MAX_RECEIPT_RLP_LENGTH]) {
    if (tx_type == 0) {
        assert(
            encoded_receipt[MAX_ENCODED_RECEIPT_LENGTH - 1] == 0, "RLP receipt exceeds MAX_RECEIPT_RLP_LENGTH"
        );
        let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
        memcpy(&mut receipt_rlp, encoded_receipt, 0);
        (tx_type, receipt_rlp)
    } else {
        let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
        memcpy(&mut receipt_rlp, encoded_receipt, 1);
        (encoded_receipt[0], receipt_rlp)
    }
}

pub(crate) fn assert_receipt_rlp_equals<LOG_NUM, MAX_LOG_DATA_LEN>(
    block_number: u64,
    receipt_rlp: [u8; MAX_RECEIPT_RLP_LENGTH],
    receipt: TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>
) {
    let decoded_receipt: RLP_List<RECEIPT_FIELDS_COUNT> = decode1(receipt_rlp);
    assert(decoded_receipt.num_fields == RECEIPT_FIELDS_COUNT, "Invalid number of fields in receipt RLP");

    if (is_pre_byzantium(block_number)) {
        // State root
    } else {
        // Status
    }
    // Gas used
    // Logs bloom
    assert(false, "Not implemented");
}

pub(crate) fn assert_receipt_equals<LOG_NUM, MAX_LOG_DATA_LEN>(
    block_number: u64,
    tx_type: TxType,
    encoded_receipt: [u8; MAX_ENCODED_RECEIPT_LENGTH],
    receipt: TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>
) {
    let (actual_tx_type, receipt_rlp) = split_receipt_into_tx_type_and_receipt_rlp(tx_type, encoded_receipt);

    assert(actual_tx_type == tx_type, "Invalid tx type");
    assert_receipt_rlp_equals(block_number, receipt_rlp, receipt);
}

fn assert_receipt_proof<MAX_RECEIPT_PROOF_LEN, MAX_RECEIPT_RLP_LEN>(proof: TxReceiptProof, root: [u8; HASH_LENGTH]) {
    assert(false, "Not implemented");
}

pub fn verify_receipt<LOG_NUM, MAX_LOG_DATA_LEN, MAX_RECEIPT_PROOF_LEN, MAX_RECEIPT_RLP_LEN>(
    block_number: Field,
    tx_idx: Field,
    receipt: TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>,
    receipt_proof: TxReceiptProof,
    receipt_root: [u8; HASH_LENGTH]
) {
    assert(false, "Not implemented");
}

