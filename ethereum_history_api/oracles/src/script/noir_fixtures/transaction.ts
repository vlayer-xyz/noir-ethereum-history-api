import { GetTransactionReturnType, Hex, toRlp } from 'viem';
import { encodeOptional, joinArray, indentBlock } from '../../noir/noir_js/encode.js';
import { encodeAddress, encodeField, encodeHex } from '../../noir/oracles/common/encode.js';
import { BYTE_HEX_LEN } from '../../util/const.js';
import { removeHexPrefix } from '../../util/hex.js';
import { txTypeToField } from '../../ethereum/receipt.js';
import { padArray } from '../../util/array.js';
import { TxRlpEncoder, encodeTx } from '../../ethereum/transaction.js';
import { MAX_TX_RLP_LEN, MAX_TX_ENCODED_LEN } from '../../noir/oracles/transactionOracle/encode.js';
import { ZERO_PAD_VALUE } from '../../noir/oracles/common/const.js';

function createPaddedValueFixture(value: Hex[], length: number): string {
  return `PaddedValue {
  value: ${indentBlock(joinArray(value), 1)},
  length: ${length}
}`;
}

export function createTransactionFixture(tx: GetTransactionReturnType): string {
  const rlpFields = TxRlpEncoder.txToFields(tx);
  const txRlp = joinArray(padArray(encodeHex(toRlp(rlpFields)), MAX_TX_RLP_LEN, ZERO_PAD_VALUE));
  const encodedTx = joinArray(padArray(encodeHex(encodeTx(tx)), MAX_TX_ENCODED_LEN, ZERO_PAD_VALUE));

  const txIdx = encodeField(tx.transactionIndex);
  const to = encodeOptional(tx.to ? joinArray(encodeAddress(tx.to)) : undefined);
  const data = encodeHex(tx.input);
  const dataLen = removeHexPrefix(tx.input).length / BYTE_HEX_LEN;
  const v = tx.v;
  const r = encodeHex(tx.r);
  const s = encodeHex(tx.s);

  return `use crate::transaction::TxPartial;
use crate::misc::types::PaddedValue;

global tx_idx = ${txIdx};

global tx_type = ${txTypeToField(tx.type)};
global tx_rlp = ${txRlp};
global encoded_tx = ${encodedTx};

global transaction = TxPartial {
  nonce: ${tx.nonce},
  gas_limit: ${tx.gas},
  to: ${indentBlock(to, 1)},
  value: U128::from_integer(${tx.value}),
  data: ${indentBlock(createPaddedValueFixture(data, dataLen), 1)},
  v: ${v},
  r: ${indentBlock(joinArray(r), 1)},
  s: ${indentBlock(joinArray(s), 1)}
};
`;
}
