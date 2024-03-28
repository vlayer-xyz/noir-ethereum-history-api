use dep::proof::{rlp::{decode1, RLP_List}, utils::byte_value};
use dep::std::hash::keccak256;
use dep::u2b::u64_to_u8;

use crate::header::{BlockHeaderPartial, BlockHeaderRlp, ETHEREUM_MAINNET_ID, ETHEREUM_SEPOLIA_ID};
use crate::misc::arrays::{sub_array_equals, sub_array_equals_up_to_length};

global MAX_HEADER_FIELDS_COUNT = 20;
global STATE_ROOT_INDEX = 3;
global TRANSACTIONS_ROOT_INDEX = 4;
global RECEIPTS_ROOT_INDEX = 5;
global BLOCK_NUM_INDEX = 8;

global LONDON_BLOCK_NUM: u64 = 12_965_000;
global PARIS_BLOCK_NUM: u64 = 15_537_394;
global CANCUN_BLOCK_NUM: u64 = 19_426_587;

pub(crate) fn get_header_fields_count(chain_id: Field, block_number: u64) -> u64 {
    let mut fields_count = 15;
    if chain_id == ETHEREUM_MAINNET_ID {
        if block_number >= LONDON_BLOCK_NUM {
            fields_count += 1;
        }
        if block_number >= PARIS_BLOCK_NUM {
            fields_count += 1;
        }
        if block_number >= CANCUN_BLOCK_NUM {
            fields_count += 3;
        }
    } else if chain_id == ETHEREUM_SEPOLIA_ID {
        fields_count = 20;
    }
    fields_count
}

pub fn verify_header(
    chain_id: Field,
    block_header_partial: BlockHeaderPartial,
    block_header_rlp: BlockHeaderRlp
) {
    let decoded_header: RLP_List<MAX_HEADER_FIELDS_COUNT> = decode1(block_header_rlp.data);
    let expected_header_fields_count = get_header_fields_count(chain_id, block_header_partial.number as u64);

    assert(
        expected_header_fields_count == decoded_header.num_fields, "number of header RLP fields does not match"
    );

    // We use u40 for block number because even if block time is 1s - it would take 34865 years to reach u40
    let block_number = u64_to_u8(block_header_partial.number as u64);
    let (block_number, block_number_length) = byte_value(block_number);

    assert(
        decoded_header.length[BLOCK_NUM_INDEX] == block_number_length, "block number length does not match"
    );
    assert(
        sub_array_equals_up_to_length(
            block_number,
            block_header_rlp.data,
            decoded_header.offset[BLOCK_NUM_INDEX],
            block_number_length as u64
        ), "block number does not match"
    );
    assert(
        sub_array_equals(
            keccak256(block_header_rlp.data, block_header_rlp.length as u32),
            block_header_partial.hash,
            0
        ), "block hash does not match"
    );
    assert(
        sub_array_equals(
            block_header_partial.state_root,
            block_header_rlp.data,
            decoded_header.offset[STATE_ROOT_INDEX]
        ), "state_root does not match"
    );
    assert(
        sub_array_equals(
            block_header_partial.transactions_root,
            block_header_rlp.data,
            decoded_header.offset[TRANSACTIONS_ROOT_INDEX]
        ), "transactions_root does not match"
    );
    assert(
        sub_array_equals(
            block_header_partial.receipts_root,
            block_header_rlp.data,
            decoded_header.offset[RECEIPTS_ROOT_INDEX]
        ), "receipts_root does not match"
    );
}
