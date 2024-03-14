import { Address, Hex } from 'viem';

export const JS_FIXTURES_DIRECTORY = 'fixtures';
export const CIRCLE_USDC_BALANCE_STORAGE_KEY = '0x57d18af793d7300c4ba46d192ec7aa095070dde6c52c687c6d0d92fb8532b305';
export const UNISWAP_V3_USDC_BALANCE_STORAGE_KEY = '0x1f21a62c4538bacf2aabeca410f0fe63151869f172e03c0e00357ba26a341eff';

interface Fixture {
  blockNumber: bigint;
  address?: Address;
  storageKeys?: Hex[];
}

type Fixtures = Record<string, Record<string, Record<string, Fixture>>>;

export const FIXTURES: Fixtures = {
  mainnet: {
    frontier: {
      zero: {
        blockNumber: 0n,
        address: '0x756F45E3FA69347A9A973A725E3C98bC4db0b5a0'
      },
      first: {
        blockNumber: 1n,
        address: '0x40d45d9d7625d15156c932b771ca7b0527130958'
      }
    },
    london: {
      crypto_punks: {
        blockNumber: 14_194_126n,
        address: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb'
      },
      vitalik_balance: {
        blockNumber: 12_965_000n,
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      }
    },
    paris: {
      usdc: {
        blockNumber: 19_000_000n,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        storageKeys: [CIRCLE_USDC_BALANCE_STORAGE_KEY]
      }
    },
    cancun: {
      some: {
        blockNumber: 19_432_086n
      },
      some_blobGasUsed: {
        blockNumber: 19_432_086n
      }
    }
  }
};
