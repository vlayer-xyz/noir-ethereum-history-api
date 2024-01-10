import { type ForeignCallOutput } from '@noir-lang/noir_js';
import { fromRlp, type GetProofReturnType, type Hex, isHex, type PublicClient } from 'viem';
import { assert } from '../../assert.js';
import { decodeField, decodeHexAddress, encodeField, encodeHex } from '../encode.js';
import { padArray } from '../../arrays.js';
import every from 'lodash.every';

const PROOF_ONE_LEVEL_LENGTH = 532;
const MAX_ACCOUNT_STATE_LENGTH = 134;
const ZERO_PAD_VALUE = '0x0';
const RLP_VALUE_INDEX = 1;

export interface AccountWithProof {
  balance: string;
  codeHash: string[];
  nonce: string;
  key: string[];
  value: string[];
  proof: string[];
  depth: string;
}

export const getAccountOracle = async (client: PublicClient, args: string[][]): Promise<ForeignCallOutput[]> => {
  const { blockNumber, address } = parseNoirGetAccountArguments(args);
  const accountProof: GetProofReturnType = await getAccountProof(client, address, blockNumber);
  const accountWithProof = encodeAccount(accountProof);
  return serializeAccountWithProof(accountWithProof);
};

export function parseNoirGetAccountArguments(args: string[][]): {
  blockNumber: bigint;
  address: Hex;
} {
  assert(args.length === 2, 'get_account requires 2 arguments');
  assert(args[0].length === 1, 'get_account first argument must be an array of length 1');
  assert(isHex(args[0][0]), 'get_account first argument must be a hex value');
  assert(args[1].length === 42, 'get_account second argument must be an address');
  assert(every(args[1], isHex), 'get_account second argument must be an array of hex string values');
  const blockNumber: bigint = decodeField(args[0][0]);
  const address: Hex = decodeHexAddress(args[1]);
  return { blockNumber, address };
}

export async function getAccountProof(
  client: PublicClient,
  address: `0x${string}`,
  blockNumber: bigint
): Promise<GetProofReturnType> {
  return (await client.getProof({ address, storageKeys: [], blockNumber })) as GetProofReturnType;
}

export function serializeAccountWithProof(account: AccountWithProof): ForeignCallOutput[] {
  return [account.balance, account.codeHash, account.nonce, account.key, account.value, account.proof, account.depth];
}

export function encodeAccount(ethProof: GetProofReturnType): AccountWithProof {
  return {
    balance: encodeField(ethProof.balance),
    codeHash: encodeHex(ethProof.codeHash),
    nonce: encodeField(ethProof.nonce),
    key: encodeHex(ethProof.address),
    value: encodeValue(ethProof.accountProof),
    proof: encodeProof(ethProof.accountProof),
    depth: encodeField(ethProof.accountProof.length)
  };
}

function encodeProof(proof: string[]): string[] {
  return proof
    .map((it) => encodeHex(it))
    .map((it) => padArray(it, PROOF_ONE_LEVEL_LENGTH, ZERO_PAD_VALUE))
    .reduce((accumulator, current) => accumulator.concat(current), []);
}

function encodeValue(proof: Hex[]): string[] {
  const lastProofEntry = fromRlp(proof[proof.length - 1], 'hex');
  const value = lastProofEntry[RLP_VALUE_INDEX];
  assert(isHex(value), 'value should be of type Hex');
  return padArray(encodeHex(value), MAX_ACCOUNT_STATE_LENGTH, ZERO_PAD_VALUE, 'left');
}
