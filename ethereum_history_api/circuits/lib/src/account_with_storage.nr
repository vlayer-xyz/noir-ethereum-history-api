use dep::proof::{MAX_ACCOUNT_STATE_LENGTH, KEY_LENGTH};

use crate::header::{get_header, BlockHeaderPartial};
use crate::misc::types::{Address, Bytes32};
use crate::verifiers::account::verify_account;
use crate::verifiers::storage::verify_storage_values;

global STATE_PROOF_LENGTH = 5852; // = 11 (MAX_STATE_PROOF_LEVELS) * 532 (MAX_TRIE_NODE_LENGTH)
global STORAGE_PROOF_LENGTH = 3724; // = 7 (MAX_STORAGE_PROOF_LEVELS) * 532 (MAX_TRIE_NODE_LENGTH)

struct Account {
    nonce: Field,
    balance: Field,
    storage_root: Bytes32,
    code_hash: Bytes32,
}

struct StateProof {
    key: Address,
    value: [u8; MAX_ACCOUNT_STATE_LENGTH],
    proof: [u8; STATE_PROOF_LENGTH],
    depth: u64,
}

struct StorageProof {
    key: Bytes32,
    value: Bytes32,
    proof: [u8; STORAGE_PROOF_LENGTH],
    depth: u64
}

struct StateAndStorageProof<STORAGE_LENGTH> {
    account: Account,
    state_proof: StateProof,
    storage_proof: [StorageProof; STORAGE_LENGTH],
}

struct StorageWithinBlock<STORAGE_LENGTH> {
    block_hash: Bytes32,
    account: Account,
    values: [Bytes32; STORAGE_LENGTH],
}

fn get_storage_keys<STORAGE_LENGTH>(storage_proof: [StorageProof; STORAGE_LENGTH]) -> [Bytes32; STORAGE_LENGTH] {
    let mut keys: [Bytes32; STORAGE_LENGTH] = [[0; 32]; STORAGE_LENGTH];
    for i in 0..STORAGE_LENGTH {
        keys[i] = storage_proof[i].key;
    }
    keys
}

fn get_storage_values<STORAGE_LENGTH>(storage_proof: [StorageProof; STORAGE_LENGTH]) -> [Bytes32; STORAGE_LENGTH] {
    let mut values: [Bytes32; STORAGE_LENGTH] = [[0; 32]; STORAGE_LENGTH];
    for i in 0..STORAGE_LENGTH {
        values[i] = storage_proof[i].value;
    }
    values
}

pub fn get_account_with_storage<STORAGE_LENGTH>(
    block_number: Field,
    address: Address,
    storage_keys: [Bytes32; STORAGE_LENGTH]
) -> StorageWithinBlock<STORAGE_LENGTH> {
    let BlockHeaderPartial { number: _, hash, state_root, transactions_root: _, receipts_root: _ } = get_header(block_number);
    let StateAndStorageProof { account, state_proof, storage_proof } = get_proof_unconstrained(block_number, address, storage_keys);

    verify_account(address, account, state_proof, state_root);
    verify_storage_values(account.storage_root, storage_proof);

    StorageWithinBlock { block_hash: hash, account, values: get_storage_values(storage_proof) }
}

#[oracle(get_proof)]
unconstrained fn get_proof_oracle<STORAGE_LENGTH>(
    _block_no: Field,
    _address: Address,
    _storage_keys: [Bytes32; STORAGE_LENGTH]
) -> StateAndStorageProof<STORAGE_LENGTH> {}

unconstrained fn get_proof_unconstrained<STORAGE_LENGTH>(block_no: Field, address: Address, storage_keys: [Bytes32; STORAGE_LENGTH]) -> StateAndStorageProof<STORAGE_LENGTH> {
    get_proof_oracle(block_no, address, storage_keys)
}
