import { toHexString } from './blockHeader.js';
import { TransactionReceipt } from '../types.js';
import { Hash, Hex, Log, TransactionType, concatHex, toRlp, rpcTransactionType } from 'viem';
import { assert } from '../util/assert.js';
import { padHexToEven } from '../util/hex.js';

export type RecursiveArray<T> = T | RecursiveArray<T>[];
type ValueOf<T> = T[keyof T];
type TxTypeHex = ValueOf<typeof rpcTransactionType>;

export function logToRlpFields(log: Log): RecursiveArray<Hex> {
  return [log.address, log.topics, log.data];
}

export function txTypeToHex(type: TransactionType): TxTypeHex {
  assert(type in rpcTransactionType, `Unknown transaction type: ${type}`);
  return padHexToEven(rpcTransactionType[type as keyof typeof rpcTransactionType]) as TxTypeHex;
}

export function txTypeToField(type: TransactionType): number {
  const hexTxType = txTypeToHex(type);
  return parseInt(hexTxType, 16);
}

type PreByzantiumReceipt = TransactionReceipt & { root: Hash };

function isPreByzantium(receipt: TransactionReceipt): receipt is PreByzantiumReceipt {
  return receipt.root !== undefined;
}

export function statusToHex(status: 'success' | 'reverted'): Hex {
  return status === 'reverted' ? '0x' : '0x01';
}

export function statusToField(status: 'success' | 'reverted'): number {
  return status === 'reverted' ? 0 : 1;
}

export function receiptToRlpFields(receipt: TransactionReceipt): RecursiveArray<Hex> {
  const logs = receipt.logs.map(logToRlpFields);
  const fields: RecursiveArray<Hex> = [];
  if (isPreByzantium(receipt)) {
    fields.push(receipt.root);
  } else {
    assert(receipt.status !== null, 'Receipt status must be defined in post byzantium receipts');
    fields.push(statusToHex(receipt.status));
  }
  fields.push(toHexString(receipt.cumulativeGasUsed), receipt.logsBloom, logs);
  return fields;
}

export function encodeReceipt(receipt: TransactionReceipt): Hex {
  const receiptRlpFields = receiptToRlpFields(receipt);
  const receiptRlp = toRlp(receiptRlpFields);
  if (receipt.type === 'legacy') {
    return receiptRlp;
  }
  const encodedReceipt = concatHex([txTypeToHex(receipt.type), receiptRlp]);
  return encodedReceipt;
}
