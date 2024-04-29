import dotenv from 'dotenv';
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { type AlchemyClient, alchemyActions } from './alchemyClient.js';

dotenv.config();

enum Chain {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia'
}

export const createClient = new Map<string, () => AlchemyClient>([
  [Chain.MAINNET, createDefaultClient],
  [Chain.SEPOLIA, createSepoliaClient]
]);

export function createDefaultClient(): AlchemyClient {
  return createPublicClient({
    chain: mainnet,
    transport: http(process.env.ETHEREUM_JSON_RPC_API_URL)
  }).extend(alchemyActions());
}

function createSepoliaClient(): AlchemyClient {
  return createPublicClient({
    chain: sepolia,
    transport: http(process.env.ETHEREUM_JSON_RPC_API_URL_SEPOLIA)
  }).extend(alchemyActions());
}

export { AlchemyClient };
