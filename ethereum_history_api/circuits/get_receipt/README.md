# Noir get_receipt binary circuit

This is a binary Noir crate used to generate receipt proofs.

```rust
fn main(block_number: pub Field, tx_idx: pub Field) -> pub TxReceiptWithinBlock
```

Prover data is located in [`Prover.toml`](Prover.toml)
