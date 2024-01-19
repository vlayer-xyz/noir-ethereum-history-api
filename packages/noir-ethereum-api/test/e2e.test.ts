import { PublicClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';
import { alterArray } from '../src/arrays.js';
import { incHexStr } from '../src/utils/string.js';
import { createMockClient } from '../src/ethereum/mockClient.js';
import { Call } from '../src/ethereum/recordingClient.js';
import { generateAndVerifyStorageProof, type MainInputs } from '../src/main.js';
import { encodeAddress } from '../src/noir/encode.js';
import { createOracles, defaultOraclesMap, type Oracles } from '../src/noir/oracles/oracles.js';
import { ADDRESS } from './ethereum/recordingClient.test.js';
import { expectCircuitFail } from './helpers.js';

const defaultTestCircuitInputParams: MainInputs = {
  block_no: 14194126,
  address: encodeAddress(ADDRESS),
  // prettier-ignore
  state_root: ['0xd7', '0x8d', '0x4f', '0x18', '0x2e', '0xbd', '0x7f', '0xd', '0xc8', '0x6c', '0x5b', '0x32', '0x8b',
    '0x73', '0xf9', '0xea', '0x3d', '0xfe', '0x17', '0xee', '0x56', '0xfb', '0xb4', '0x90', '0xd9', '0xb6', '0x7e',
    '0xda', '0xc4', '0x8e', '0x2b', '0x4']
};

describe(
  'e2e',
  () => {
    let client: PublicClient;
    let oracles: Oracles;

    beforeAll(async () => {
      client = await createMockClient('./test/fixtures/mockClientData.json');
      oracles = createOracles(client)(defaultOraclesMap);
    });

    it('proof successes', async () => {
      expect(await generateAndVerifyStorageProof(defaultTestCircuitInputParams, oracles)).toEqual(true);
    });

    it('proof fails: invalid proof', async () => {
      const resultModifier = (call: Call): Call => {
        if (call.method === 'getProof') {
          const accountProof = (call.result as { [key: string]: object }).accountProof as string[];
          return {
            ...call,
            result: {
              ...call.result,
              accountProof: [incHexStr(accountProof[0]), ...accountProof.slice(1)]
            }
          };
        }
        return call;
      };
      const oracles = createOracles(await createMockClient('./test/fixtures/mockClientData.json', resultModifier))(
        defaultOraclesMap
      );
      await expectCircuitFail(generateAndVerifyStorageProof(defaultTestCircuitInputParams, oracles));
    });

    it('proof fails: invalid state root', async () => {
      const inputParams = {
        ...defaultTestCircuitInputParams,
        state_root: alterArray(defaultTestCircuitInputParams.state_root)
      };
      await expectCircuitFail(generateAndVerifyStorageProof(inputParams, oracles));
    });
  },
  {
    timeout: 20000
  }
);
