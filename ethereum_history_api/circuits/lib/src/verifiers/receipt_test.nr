use dep::proof::utils::memcpy;
use crate::fixtures::mainnet::{
    cancun::small_block::{receipt::{encoded_receipt, receipt, tx_type}, header::number as block_number},
    homestead::fork::{
    receipt::{
    receipt_rlp as pre_byzantium_receipt_rlp, receipt as pre_byzantium_receipt,
    encoded_receipt as pre_byzantium_encoded_receipt, tx_type as legacy_tx_type
},
    header::number as pre_byzantium_block_number
}
};
use crate::misc::arrays::{alter_array, sub_array_equals_up_to_length};
use crate::verifiers::receipt::{
    BYZANTIUM_BLOCK_NUM, assert_receipt_equals, split_receipt_into_tx_type_and_receipt_rlp,
    assert_receipt_rlp_equal, MAX_RECEIPT_RLP_LENGTH, MAX_ENCODED_RECEIPT_LENGTH
};

#[test]
fn test_split_receipt_into_tx_type_and_receipt_rlp() {
    let (tx_type, receipt_rlp) = split_receipt_into_tx_type_and_receipt_rlp(tx_type, encoded_receipt);
    assert(tx_type == encoded_receipt[0], "Incorrect tx type returned");
    assert(receipt_rlp.len() == encoded_receipt.len() - 1, "Incorrect receipt RLP length returned");
    assert(receipt_rlp[0] == encoded_receipt[1], "Incorrect receipt RLP returned");
}

#[test]
fn test_split_receipt_into_tx_type_and_receipt_rlp_legacy_tx() {
    let (tx_type, receipt_rlp) = split_receipt_into_tx_type_and_receipt_rlp(legacy_tx_type, pre_byzantium_encoded_receipt);
    assert(tx_type == legacy_tx_type, "Incorrect tx type returned");
    assert(receipt_rlp.len() == encoded_receipt.len() - 1, "Incorrect receipt RLP length returned");
    assert(receipt_rlp[0] == pre_byzantium_encoded_receipt[0], "Incorrect receipt RLP returned");
}

#[test(should_fail_with="Not 0x00 at the end of legacy receipt RLP")]
fn test_split_receipt_into_tx_type_and_receipt_rlp_wrong_legacy_rlp() {
    let mut wrong_legacy_rlp = [0; MAX_ENCODED_RECEIPT_LENGTH];
    memcpy(&mut wrong_legacy_rlp, pre_byzantium_encoded_receipt, 0);

    let not_zero_byte = 0x01;
    wrong_legacy_rlp[MAX_ENCODED_RECEIPT_LENGTH - 1] = not_zero_byte;

    let(tx_type, receipt_rlp) = split_receipt_into_tx_type_and_receipt_rlp(legacy_tx_type, wrong_legacy_rlp);
}

#[test(should_fail_with="Invalid tx type")]
fn test_assert_receipt_equals_wrong_tx_type() {
    let wrong_tx_type = tx_type + 1;
    assert_receipt_equals(block_number, wrong_tx_type, encoded_receipt, receipt);
}

global RLP_SINGLE_ELEMENT_LIST_HEADER = 0xc1;

// TODO: Add correct assertion message when noir-trie-proofs is updated
#[test(should_fail)]
fn test_assert_receipt_rlp_equal_invalid_rlp_type() {
    let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
    let rlp_empty_string = [0x80]; // ""
    write_subarray(&mut receipt_rlp, rlp_empty_string);
    assert_receipt_rlp_equal(block_number, receipt_rlp, receipt);
}

#[test(should_fail_with="Invalid number of fields in receipt RLP")]
fn test_assert_receipt_rlp_equal_invalid_rlp_field_count() {
    let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
    let rlp_list_with_one_element = [0xc1, 0x80]; // [""]
    write_subarray(&mut receipt_rlp, rlp_list_with_one_element);
    assert_receipt_rlp_equal(block_number, receipt_rlp, receipt);
}

fn write_subarray<N, M>(dest: &mut [u8; N], src: [u8; M]) {
    for i in 0..M {
        (*dest)[i] = src[i];
    }
}

#[test(should_fail_with="Invalid state root type")]
fn test_assert_receipt_rlp_equal_state_root_invalid_data_type() {
    let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
    let rlp_state_root_is_list = [0xc4, 0xc0, 0xc0, 0xc0, 0xc0]; // [[], [], [], []]
    write_subarray(&mut receipt_rlp, rlp_state_root_is_list);

    assert_receipt_rlp_equal(pre_byzantium_block_number, receipt_rlp, pre_byzantium_receipt);
}

#[test(should_fail_with="Invalid state root length")]
fn test_assert_receipt_rlp_equal_state_root_invalid_length() {
    let mut receipt_rlp = [0; MAX_RECEIPT_RLP_LENGTH];
    let rlp_state_root_is_too_short = [0xc4, 0x80, 0xc0, 0xc0, 0xc0]; // ["0x", [], [], []]
    write_subarray(&mut receipt_rlp, rlp_state_root_is_too_short);

    assert_receipt_rlp_equal(pre_byzantium_block_number, receipt_rlp, pre_byzantium_receipt);
}

#[test(should_fail_with="State root mismatch")]
fn test_assert_receipt_rlp_equal_state_root_invalid_value() {
    let mut pre_byzantium_receipt_with_altered_state_root = pre_byzantium_receipt;
    pre_byzantium_receipt_with_altered_state_root.state_root =pre_byzantium_receipt_with_altered_state_root.state_root.map(alter_array);
    assert_receipt_rlp_equal(
        pre_byzantium_block_number,
        pre_byzantium_receipt_rlp,
        pre_byzantium_receipt_with_altered_state_root
    );
}
