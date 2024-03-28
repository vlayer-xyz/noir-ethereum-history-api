use crate::misc::{types::{Bytes32, Address}, option::make_option};
use crate::header::get_header;
use crate::verifiers::receipt::verify_receipt;
use dep::std::unsafe::zeroed;
use dep::proof::{const::MAX_TRIE_NODE_LENGTH, receipt_proof::ReceiptProof};

global BLOOM_FILTER_LEN = 256;
global MAX_RECEIPT_KEY_LEN = 3;
global MAX_RECEIPT_TREE_DEPTH = 7;
global MAX_RECEIPT_ENCODED_LEN = 525;
global MAX_RECEIPT_PROOF_LEN = 3724; // = MAX_RECEIPT_TREE_DEPTH * MAX_TRIE_NODE_LENGTH

struct Log<MAX_LOG_DATA_LEN> {
    address: Address,
    topics: [Bytes32; 4],
    data: [u8; MAX_LOG_DATA_LEN]
}

type TxType = u8;

struct TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN> {
    status: Option<u1>,
    state_root: Option<Bytes32>,
    cumulative_gas_used: Field,
    logs_bloom: [u8; BLOOM_FILTER_LEN]
}

struct ForeignCallTxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN> {
    status: u1,
    status_is_some: bool,
    state_root: Bytes32,
    state_root_is_some: bool,
    cumulative_gas_used: Field,
    logs_bloom: [u8; BLOOM_FILTER_LEN]
}

struct TxReceiptWithinBlock<LOG_NUM, MAX_LOG_DATA_LEN> {
    receipt: TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>,
    block_hash: Bytes32
}

type TxReceiptProof = ReceiptProof<MAX_RECEIPT_PROOF_LEN, MAX_RECEIPT_ENCODED_LEN>;

pub fn get_receipt<LOG_NUM, MAX_LOG_DATA_LEN>(
    block_number: Field,
    tx_idx: Field
) -> TxReceiptWithinBlock<LOG_NUM, MAX_LOG_DATA_LEN> {
    let (tx_type, receipt, proof): (TxType, TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>, TxReceiptProof) = get_receipt_unconstrained(block_number, tx_idx);
    zeroed()
}

#[oracle(get_receipt)]
unconstrained fn get_receipt_oracle<LOG_NUM, MAX_LOG_DATA_LEN>(
    _block_number: Field,
    _tx_idx: Field
) -> (TxType, ForeignCallTxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>, ReceiptProof<MAX_RECEIPT_PROOF_LEN, MAX_RECEIPT_ENCODED_LEN>) {}

unconstrained fn get_receipt_unconstrained<LOG_NUM, MAX_LOG_DATA_LEN>(
    block_number: Field,
    tx_idx: Field
) -> (TxType, TxReceiptPartial<LOG_NUM, MAX_LOG_DATA_LEN>, ReceiptProof<MAX_RECEIPT_PROOF_LEN, MAX_RECEIPT_ENCODED_LEN>) {
    let (tx_type, receipt, proof) = get_receipt_oracle(block_number, tx_idx);

    let receipt = TxReceiptPartial {
        status: make_option(receipt.status, receipt.status_is_some),
        state_root: make_option(receipt.state_root, receipt.state_root_is_some),
        cumulative_gas_used: receipt.cumulative_gas_used,
        logs_bloom: receipt.logs_bloom
    };
    (tx_type, receipt, proof)
}
