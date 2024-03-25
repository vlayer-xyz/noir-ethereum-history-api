import { Hash, Hex, Log, TransactionReceipt, TransactionType, concatHex, toRlp } from 'viem';
import { toHexString } from './blockHeader.js';

export type RecursiveArray<T> = T | RecursiveArray<T>[];

export function logToRlpFields(log: Log): RecursiveArray<Hex> {
  return [log.address, log.topics, log.data];
}

export function txTypeToHex(type: TransactionType): Hex {
  switch (type) {
    case 'legacy':
      return '0x00';
    case 'eip2930':
      return '0x01';
    case 'eip1559':
      return '0x02';
    case 'eip4844':
      return '0x03';
    default:
      throw new Error(`Unknown transaction type: ${type}`);
  }
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
