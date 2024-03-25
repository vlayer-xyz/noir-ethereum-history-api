import { TransactionReceipt } from 'viem';
import { encodeHex } from '../../noir/oracles/common/encode.js';
import { encodeReceipt, statusToField } from '../../ethereum/receipt.js';
import { encodeOptional, joinArray, tabulateStructField } from '../../noir/noir_js/encode.js';

export function createReceiptFixture(receipt: TransactionReceipt): string {
  const rlpReceipt = joinArray(encodeHex(encodeReceipt(receipt)));

  const status = encodeOptional(statusToField(receipt.status).toString());
  const stateRoot = encodeOptional(receipt.root ? joinArray(encodeHex(receipt.root)) : receipt.root);
  const logsBloom = joinArray(encodeHex(receipt.logsBloom));

  return `use crate::receipt::TxReceipt;

global rlp_receipt = ${rlpReceipt};

global receipt = TxReceipt {
  status: ${status},
  state_root: ${tabulateStructField(stateRoot, 1)},
  cumulative_gas_used: ${receipt.cumulativeGasUsed},
  logs_bloom: ${tabulateStructField(logsBloom, 1)}
};
`;
}
