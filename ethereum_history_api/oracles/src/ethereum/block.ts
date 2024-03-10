import { GetTransactionReturnType, type GetBlockReturnType } from 'viem';
import { JsonRpcBlock } from '@ethereumjs/block';
import { toHexString } from './blockHeader.js';
import { JsonRpcTx } from '@ethereumjs/tx';

type TransactionType = 'legacy' | 'eip2930' | 'eip1559' | 'eip4844';

export function txTypeToJsonRpcTxType(txType: TransactionType): string {
  switch (txType) {
    case 'legacy':
      return '0x00';
    case 'eip2930':
      return '0x01';
    case 'eip1559':
      return '0x02';
    case 'eip4844':
      return '0x03';
  }
}

export function txToJsonRpcTx(tx: GetTransactionReturnType): JsonRpcTx {
  const jsonRpcTx: JsonRpcTx = {
    hash: tx.hash,
    nonce: toHexString(tx.nonce),
    blockHash: tx.blockHash,
    blockNumber: toHexString(tx.blockNumber),
    transactionIndex: toHexString(tx.transactionIndex),
    from: tx.from,
    to: tx.to,
    value: toHexString(tx.value),
    gasPrice: toHexString(tx.gasPrice ?? 0n),
    gas: toHexString(tx.gas),
    input: tx.input,
    v: toHexString(tx.v),
    r: tx.r,
    s: tx.s,
    type: txTypeToJsonRpcTxType(tx.type),
    accessList: tx.accessList,
    chainId: toHexString(tx.chainId ?? 1)
  };
  return jsonRpcTx;
}

export function blockToJsonRpcBlock(block: GetBlockReturnType<undefined, true>): JsonRpcBlock {
  const jsonRpcBlock: JsonRpcBlock = {
    number: toHexString(block.number),
    hash: block.hash,
    parentHash: block.parentHash,
    mixHash: block.mixHash,
    nonce: block.nonce,
    sha3Uncles: block.sha3Uncles,
    logsBloom: block.logsBloom,
    transactionsRoot: block.transactionsRoot,
    stateRoot: block.stateRoot,
    receiptsRoot: block.receiptsRoot,
    miner: block.miner,
    difficulty: toHexString(block.difficulty),
    totalDifficulty: toHexString(block.totalDifficulty ?? 0),
    extraData: block.extraData,
    size: toHexString(block.size),
    gasLimit: toHexString(block.gasLimit),
    gasUsed: toHexString(block.gasUsed),
    timestamp: toHexString(block.timestamp),
    transactions: block.transactions.map(txToJsonRpcTx),
    uncles: block.uncles,
    baseFeePerGas: block.baseFeePerGas !== null ? toHexString(block.baseFeePerGas) : undefined,
    withdrawals: block.withdrawals,
    withdrawalsRoot: block.withdrawalsRoot ?? undefined,
    blobGasUsed: block.blobGasUsed !== undefined ? toHexString(block.blobGasUsed) : undefined,
    excessBlobGas: block.excessBlobGas !== undefined ? toHexString(block.excessBlobGas) : undefined,
    parentBeaconBlockRoot: undefined, // If EIP-4788 is enabled for this block, returns parent beacon block root
    executionWitness: undefined // If Verkle is enabled for this block
  };
  return jsonRpcBlock;
}
