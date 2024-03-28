use dep::u2b::u64_to_u8;
use dep::proof::{rlp::decode0, utils::memcpy};
use crate::misc::{arrays::sub_array_equals_up_to_length, bytes::{nibbles_to_bytes, left_to_right_padding, right_pad}};

global KEY_NIBBLE_LEN = 6;
global MAX_TX_IDX_BYTES_LEN = 2;

pub fn assert_tx_idx_equals(key_as_rlp: [u8; KEY_NIBBLE_LEN], tx_idx: Field) {
    let (key_right_padded, shifted_by) = left_to_right_padding(key_as_rlp);
    let key_bytes: [u8; KEY_NIBBLE_LEN / 2] = nibbles_to_bytes(key_right_padded);
    let (rlp_offset, rlp_len) = decode0(key_bytes);
    assert(shifted_by + 2 * (rlp_len + rlp_offset) == KEY_NIBBLE_LEN, "key is not an rlp-encoded string");

    if (rlp_len == 0) {
        assert(tx_idx == 0, "key does not match rlp-encoded transaction index");
    } else {
        let mut tx_idx_bytes = [0; MAX_TX_IDX_BYTES_LEN];
        let (tx_idx_right_padded, _) = right_pad(u64_to_u8(tx_idx as u64));
        memcpy(&mut tx_idx_bytes, tx_idx_right_padded, 0);

        assert(
            sub_array_equals_up_to_length(tx_idx_bytes, key_bytes, rlp_offset, rlp_len), "key does not match rlp-encoded transaction index"
        );
    }
}
