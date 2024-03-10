import { Block } from '@ethereumjs/block';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { Trie } from '@ethereumjs/trie';
import { encode } from 'rlp';
import { bytesToHex } from '@ethereumjs/util';

import { createDefaultClient } from '../ethereum/client.js';
import { blockToJsonRpcBlock } from '../ethereum/block.js';

export async function misc(): Promise<void> {
  const client = createDefaultClient();
  const blockNumber = 1000000n;
  const rpcBlock = await client.getBlock({ blockNumber, includeTransactions: true });
  console.log(rpcBlock);
  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Chainstart });
  const block = Block.fromRPC(blockToJsonRpcBlock(rpcBlock), [], { common });
  console.log(await block.validateData());

  const trie = new Trie();
  for (const [i, tx] of block.transactions.entries()) {
    const key = encode(i);
    console.log(i, key);
    await trie.put(key, tx.serialize());
  }
  console.log(bytesToHex(trie.root()));
  console.log((await trie.createProof(encode(0))).map(bytesToHex));
}

await misc();
