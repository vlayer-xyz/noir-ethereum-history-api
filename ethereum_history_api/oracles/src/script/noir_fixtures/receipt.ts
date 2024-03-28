import { encodeHex } from '../../noir/oracles/common/encode.js';
import { encodeReceipt, receiptToRlpFields, statusToField, txTypeToField } from '../../ethereum/receipt.js';
import { encodeOptional, indentBlock, joinArray } from '../../noir/noir_js/encode.js';
import { padArray } from '../../util/array.js';
import { ZERO_PAD_VALUE } from '../../noir/oracles/common/const.js';
import { MAX_RECEIPT_ENCODED_LEN, MAX_RECEIPT_RLP_LEN } from '../../noir/oracles/receiptOracle/encode.js';
import { TransactionReceipt } from '../../types.js';
import { toRlp } from 'viem';

export function createReceiptFixture(receipt: TransactionReceipt): string {
  const receipt_rlp = joinArray(
    padArray(encodeHex(toRlp(receiptToRlpFields(receipt))), MAX_RECEIPT_RLP_LEN, ZERO_PAD_VALUE)
  );
  const encodedReceipt = joinArray(
    padArray(encodeHex(encodeReceipt(receipt)), MAX_RECEIPT_ENCODED_LEN, ZERO_PAD_VALUE)
  );

  const status = encodeOptional(receipt.status === null ? null : statusToField(receipt.status).toString());
  const stateRoot = encodeOptional(receipt.root ? joinArray(encodeHex(receipt.root)) : receipt.root);
  const logsBloom = joinArray(encodeHex(receipt.logsBloom));

  return `use crate::receipt::TxReceiptPartial;

global tx_type = ${txTypeToField(receipt.type)};
global receipt_rlp = ${receipt_rlp};
global encoded_receipt = ${encodedReceipt};

global receipt = TxReceiptPartial {
  status: ${status},
  state_root: ${indentBlock(stateRoot, 1)},
  cumulative_gas_used: ${receipt.cumulativeGasUsed},
  logs_bloom: ${indentBlock(logsBloom, 1)}
};
`;
}
