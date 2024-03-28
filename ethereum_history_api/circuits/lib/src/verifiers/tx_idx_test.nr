use crate::verifiers::tx_idx::assert_tx_idx_equals;

#[test]
fn test_assert_tx_idx_equals_zero() {
    let tx_idx = 0x0;
    let key = [0x0, 0x0, 0x0, 0x0, 0x8, 0x0];
    assert_tx_idx_equals(key, tx_idx);
}

#[test]
fn test_assert_tx_idx_equals_odd() {
    let tx_idx = 0xf;
    let key = [0x0, 0x0, 0x0, 0x0, 0x0, 0xf];
    assert_tx_idx_equals(key, tx_idx);
}

#[test]
fn test_assert_tx_idx_equals() {
    let tx_idx = 0xabcd;
    let key = [0x8, 0x2, 0xa, 0xb, 0xc, 0xd];
    assert_tx_idx_equals(key, tx_idx);
}

#[test(should_fail_with="key is not an rlp-encoded string")]
fn test_assert_tx_idx_equals_fail_incorrect_rlp_encoding() {
    let tx_idx = 0x1;
    let key_encoded_incorrectly = [0x0, 0x1, 0xa, 0xb, 0xc, 0xe];
    assert_tx_idx_equals(key_encoded_incorrectly, tx_idx);
}

#[test(should_fail_with="key does not match rlp-encoded transaction index")]
fn test_assert_tx_idx_equals_fail_zero() {
    let wrong_tx_idx = 0x0 + 1;
    let key = [0x0, 0x0, 0x0, 0x0, 0x8, 0x0];
    assert_tx_idx_equals(key, wrong_tx_idx);
}

#[test(should_fail_with="key does not match rlp-encoded transaction index")]
fn test_assert_tx_idx_equals_fail() {
    let tx_idx = 0xabcd;
    let wrong_key = [0x8, 0x2, 0xa, 0xb, 0xc, 0xd + 1];
    assert_tx_idx_equals(wrong_key, tx_idx);
}
