use dep::proof::{MAX_ACCOUNT_STATE_LENGTH, KEY_LENGTH};

use crate::header::{get_header, BlockHeaderPartial};
use crate::misc::types::{Address, Bytes32};
use crate::verifiers::account::verify_account;
use crate::verifiers::storage::verify_storage_values;

global STATE_PROOF_LEN = 4788; // = 9 (MAX_STATE_PROOF_LEVELS) * 532 (MAX_TRIE_NODE_LENGTH)
global STORAGE_PROOF_LEN = 3724; // = 7 (MAX_STORAGE_PROOF_LEVELS) * 532 (MAX_TRIE_NODE_LENGTH)

struct Account {
    nonce: Field,
    balance: Field,
    storage_root: Bytes32,
    code_hash: Bytes32,
}

struct StateProof {
    key: Address,
    value: [u8; MAX_ACCOUNT_STATE_LENGTH],
    proof: [u8; STATE_PROOF_LEN],
    depth: Field,
}

struct StorageProof {
    key: Bytes32,
    value: Bytes32,
    proof: [u8; STORAGE_PROOF_LEN],
    depth: Field
}

// For now oracle does not support returning array of arrays so at the moment we support only one storage proof.
// When https://github.com/noir-lang/noir/issues/4498 is resolved we can change to `StateAndStorageProof<N>` and `storage_proof: [StorageProof; N]`.
struct StateAndStorageProof {
    account: Account,
    state_proof: StateProof,
    storage_proof: StorageProof
}

struct StorageWithinBlock<N> {
    block_hash: Bytes32,
    account: Account,
    values: [Bytes32; N],
}

pub fn get_account_with_storage(
    block_number: Field,
    address: Address,
    storage_key: Bytes32
) -> StorageWithinBlock<1> {
    let BlockHeaderPartial { number: _, hash, state_root, transactions_root: _, receipts_root: _ } = get_header(block_number);
    let StateAndStorageProof { account, state_proof, storage_proof } = get_proof_unconstrained(block_number, address, storage_key);

    verify_account(address, account, state_proof, state_root);
    verify_storage_values(account.storage_root, [storage_proof]);

    StorageWithinBlock { block_hash: hash, account, values: [storage_proof.value] }
}

#[oracle(get_proof)]
unconstrained fn get_proof_oracle(
    _block_no: Field,
    _address: Address,
    _storage_key: Bytes32
) -> StateAndStorageProof {}

unconstrained fn get_proof_unconstrained(
    block_no: Field,
    address: Address,
    storage_key: Bytes32
) -> StateAndStorageProof {
    get_proof_oracle(block_no, address, storage_key)
}