use dep::ethereum_history_api::receipt::{get_receipt, TxReceiptWithinBlock};

fn main(block_number: pub Field, tx_idx: pub Field) -> pub TxReceiptWithinBlock {
    get_receipt(block_number, tx_idx)
}
