use dep::ethereum_history_api::{account_with_storage::{get_account_with_storage, StorageWithinBlock}, misc::types::{Address, Bytes32}};

fn main(
    block_number: pub Field,
    address: pub Address,
    storage_key: pub Bytes32
) -> pub StorageWithinBlock<1> {
    get_account_with_storage(block_number, address, [storage_key])
}
