import { type ForeignCallOutput } from '@noir-lang/noir_js';
import { type BlockHeader, blockToHeader } from '../../ethereum/blockHeader.js';
import { assert } from '../../util/assert.js';
import { encodeBlockHeader } from './headerOracle/encode.js';
import { decodeField } from './common/decode.js';
import { NoirArguments } from './oracles.js';
import { type Block } from '../../ethereum/blockHeader.js';
import { AlchemyClient } from '../../ethereum/client.js';

const GET_HEADER_ARGS_COUNT = 1;

export async function getHeaderOracle(client: AlchemyClient, args: NoirArguments): Promise<ForeignCallOutput[]> {
  const blockNumber: bigint = decodeGetHeaderArguments(args);
  const blockHeader = await getBlockHeader(client, blockNumber);
  return encodeBlockHeader(blockHeader);
}

export function decodeGetHeaderArguments(args: NoirArguments): bigint {
  assert(args.length === GET_HEADER_ARGS_COUNT, 'get_header requires 1 argument');
  assert(args[0].length === 1, 'blockNumber should be a single value');
  return decodeField(args[0][0]);
}

export async function getBlockHeader(client: AlchemyClient, blockNumber: bigint): Promise<BlockHeader> {
  const block: Block = (await client.getBlock({ blockNumber })) as Block;
  return blockToHeader(block);
}
