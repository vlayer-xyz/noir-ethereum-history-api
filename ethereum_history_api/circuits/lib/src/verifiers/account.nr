use dep::proof::{
    rlp::{RLP_List, decode1_small_lis}, const::{MAX_ACCOUNT_STATE_LENGTH, HASH_LENGTH},
    trie_proof::TrieProof, utils::byte_value
};
use dep::u2b::u64_to_u8;

use crate::account::{Account, StateProof};
use crate::misc::{arrays::{sub_array_equals_up_to_length, array_equals}, types::{Address, Bytes32}};

use crate::HASH_LEN;

global ACCOUNT_FIELDS_COUNT = 4;
global NONCE_INDEX  = 0;
global BALANCE_INDEX = 1;
global STORAGE_ROOT_INDEX = 2;
global CODE_HASH_INDEX = 3;

pub(crate) fn assert_account_equals(account_rlp_left_padded: [u8; MAX_ACCOUNT_STATE_LENGTH], account: Account) {
    let account_rlp_right_padded = byte_value(account_rlp_left_padded).0;
    let decoded_account: RLP_List<ACCOUNT_FIELDS_COUNT> = decode1_small_lis(account_rlp_right_padded);
    assert(decoded_account.num_fields == ACCOUNT_FIELDS_COUNT, "Invalid number of fields in account RLP");

    let nonce = u64_to_u8(account.nonce as u64);
    let (nonce, nonce_length) = byte_value(nonce);
    let balance = U128::from_integer(account.balance).to_be_bytes();
    let (balance, balance_length) = byte_value(balance);

    assert(decoded_account.length[NONCE_INDEX] == nonce_length, "Nonce length mismatch");
    assert(
        sub_array_equals_up_to_length(
            nonce,
            account_rlp_right_padded,
            decoded_account.offset[NONCE_INDEX],
            nonce_length as u64
        ), "Nonce mismatch"
    );

    assert(decoded_account.length[BALANCE_INDEX] == balance_length, "Balance length mismatch");
    assert(
        sub_array_equals_up_to_length(
            balance,
            account_rlp_right_padded,
            decoded_account.offset[BALANCE_INDEX],
            balance_length as u64
        ), "Balance mismatch"
    );

    assert(decoded_account.length[STORAGE_ROOT_INDEX] == HASH_LEN, "Storage root length mismatch");
    assert(
        sub_array_equals_up_to_length(
            account.storage_root,
            account_rlp_right_padded,
            decoded_account.offset[STORAGE_ROOT_INDEX],
            HASH_LEN as u64
        ), "Storage root mismatch"
    );

    assert(decoded_account.length[CODE_HASH_INDEX] == HASH_LEN, "Code hash length mismatch");
    assert(
        sub_array_equals_up_to_length(
            account.code_hash,
            account_rlp_right_padded,
            decoded_account.offset[CODE_HASH_INDEX],
            HASH_LEN as u64
        ), "Code hash mismatch"
    );
}

fn assert_address_equals(address1: Address, address2: Address) {
    assert(array_equals(address1, address2), "Address mismatch");
}

fn assert_account_proof(account_state_proof: StateProof, state_root: [u8; HASH_LENGTH]) {
    let trie_proof = TrieProof {
        key: account_state_proof.key,
        proof: account_state_proof.proof,
        depth: account_state_proof.depth,
        value: account_state_proof.value
    };
    assert(trie_proof.verify_state_root(state_root), "TrieProof: Invalid state root");
}

pub fn verify_account(address: Address, account: Account, state_proof: StateProof, state_root: [u8; HASH_LENGTH]) {
    assert_address_equals(state_proof.key, address);
    assert_account_equals(state_proof.value, account);
    assert_account_proof(state_proof, state_root);
}
