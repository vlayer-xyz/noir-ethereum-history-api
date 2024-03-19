import { Block } from '@ethereumjs/block';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Trie } from '@ethereumjs/trie';
import { encode } from 'rlp';
import { bytesToHex } from '@ethereumjs/util';

import { createDefaultClient } from '../ethereum/client.js';
import { blockToJsonRpcBlock } from '../ethereum/block.js';

export async function misc(): Promise<void> {
  const client = createDefaultClient();
  const blockNumber = 19_432_673n;
  const rpcBlock = await client.getBlock({ blockNumber, includeTransactions: true });
  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Cancun });
  const block = Block.fromRPC(blockToJsonRpcBlock(rpcBlock), [], { common });
  console.log(await block.validateData());
  console.log(bytesToHex(block.header.transactionsTrie));

  const trie = new Trie();
  for (const [i, tx] of block.transactions.entries()) {
    const key = encode(i);
    console.log(i, key, bytesToHex(tx.serialize()));

    await trie.put(key, tx.serialize());
  }
  console.log(bytesToHex(trie.root()));
  console.log((await trie.createProof(encode(0))).map(bytesToHex));
}

await misc();
