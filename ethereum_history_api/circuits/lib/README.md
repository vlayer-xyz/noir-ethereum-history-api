# Noir Ethereum history api library

Noir library for proving and verifying historical data on the Ethereum blockchain and other EVMs.

**Disclaimer:** This page is supposed to give you an idea about the usage and structure of the library, but it's still a good idea to consult the code for exact definitions of functions & types.

## Usage

There are two main ways to use this library. **With Oracles** or **Without Oracles**.

### With oracles

#### Prerequisites

You will need to run an oracle server to use any of those functions. Consult [oracles docs](../../oracles/README.md#starting-oracle-server) for instructions.

If you decide to use our Oracles - you don't need to provide all the data by hand and you can use functions that operate on a **high level of abstraction**. Those functions will then **fetch** required data such as raw header or state proofs from oracles, **verify** that the data is correct and return you the values that you've asked for.

Here is a list of public functions that you should use it you decide to go the **oracles route**:

```rust
pub fn get_header(block_number: Field) -> BlockHeaderPartial;
```

```rust
pub fn get_account(block_no: Field, address: Address) -> AccountWithinBlock;
```

```rust
pub fn get_account_with_storage(block_number: Field, address: Address, storage_key: Bytes32) -> StorageWithinBlock<1>;
```

```rust
pub fn get_receipt(block_number: Field, tx_idx: Field) -> TxReceiptWithinBlock;
```

### Without oracles

If you decide to not use Oracles - you will need to provide all the data manually, but you can still use verifier functions to verify data & proofs.

Here is a list of public functions that you should use it you decide to go the **NO oracles route**:

```rust
pub fn verify_header(chain_id: Field, block_header_partial: BlockHeaderPartial, block_header_rlp: BlockHeaderRlp)
```

```rust
pub fn verify_account(address: Address, account: Account, state_proof: StateProof, state_root: [u8; KEY_LENGTH])
```

```rust
pub fn verify_storage_value(storage_root: Bytes32, proof: StorageProof)
```

```rust
pub fn verify_storage_values<N>(storage_root: Bytes32, proofs: [StorageProof; N])
```

```rust
pub fn verify_receipt(
    block_number: Field,
    tx_idx: Field,
    receipt: TxReceipt,
    receipt_proof: TxReceiptProof,
    receipt_root: [u8; KEY_LENGTH]
)
```

## Checking block hash

All the function in this library prove that the objects are contained within some block hash. We can't prove that this block hash is in fact a member of a canonical chain. This is user's responsibility. We provide Solidity [contract](../../contracts/src/EthereumHistoryVerifier.sol) that can prove block hash inclusion for the last 256 block on EVM and plan to maintain the Merkle Mountain Range on-chain in the future to allow for historical block hash inclusion proofs.

For now - just remember that it's your responsibility to prove block hash. Otherwise - an attacker can generate valid proofs for non-existent blocks.

## Package structure

```sh
└── src
    ├── header.nr
    ├── receipt.nr
    ├── account.nr
    ├── account_with_storage.nr
    └── verifiers
        ├── header.nr
        ├── receipt.nr
        ├── account.nr
        └── storage.nr
```

## Generic parameters

We use generics so that your circuits can be the exact size they need to be.

Let's say - you need to prove some storage values. We could give you a function that proves up to 5 storage values and you can call it with one real key and 4 fake keys that would be proven to be zero, but it would be wasteful.
Or we could give you a set of functions:
`get_account_with_storage1`, `get_account_with_storage2`, ...
That's also not a nice solution. Instead - we try to introduce generic parameters for sizes where we can and ask you to provide them before generating actual proof.

Unfortunately generics are limited:

- We can't do any [arithmetic](https://github.com/noir-lang/noir/issues/1837) on them. It's impossible to create `array: [u8; N * M]` where N and M are generic type parameters
- [Turbofish syntax](https://github.com/orgs/noir-lang/discussions/3413) is not supported. You can only specify generics that are used in input/output values. So if we need you to provide proof size - we need to resort to [phantom arguments](https://github.com/orgs/noir-lang/discussions/3413#discussioncomment-8774114)

## Types

This section describes the types that are used in function signatures above. Please consult the section above for generics motivation.

```rust
type Address = [u8; 20];
type Bytes32 = [u8; 32];
```

```rust
struct BlockHeaderPartial {
    number: Field,
    hash: Bytes32,
    state_root: Bytes32,
    transactions_root: Bytes32,
    receipts_root: Bytes32,
}
```

```rust
struct Account {
    nonce: Field,
    balance: Field,
    storage_root: Bytes32,
    code_hash: Bytes32,
}
```

```rust
struct AccountWithinBlock {
    account: Account,
    block_hash: Bytes32,
}
```

```rust
struct StorageWithinBlock<N> {
    block_hash: Bytes32,
    account: Account,
    values: [Bytes32; N],
}
```

```rust
struct TxReceiptWithinBlock {
    receipt: TxReceipt,
    block_hash: Bytes32
}
```
