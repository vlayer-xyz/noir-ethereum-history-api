import { beforeAll, describe, expect, it } from 'vitest';
import { copy, updateNestedField, incHexStr, assert, verifyStorageProofInSolidity } from 'noir-ethereum-api-oracles';
import { abiEncode, InputMap, WitnessMap } from '@noir-lang/noirc_abi';

import { Account, privateKeyToAccount } from 'viem/accounts';
import ultraVerifier from '../../contracts/out/UltraVerifier.sol/UltraVerifier.json';
import { Address, Hex } from 'viem';
import { createAnvilClient, AnvilClient } from './ethereum/anvilClient.js';
import { circuit, readInputMap, readProof, readWitnessMap } from './main.js';

console.log(process.cwd());
const PROOF_PATH = '../../proofs/ethereum_history_api.proof';
const INPUT_MAP_PATH = '../circuits/lib/Verifier.toml';
const ANVIL_TEST_ACCOUNT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const VERIFICATION_GAS_LIMIT = 500_000n;

describe(
  'e2e',
  () => {
    let proof: Uint8Array;
    let inputMap: InputMap;
    let witnessMap: WitnessMap;
    let account: Account;
    let client: AnvilClient;
    let contractAddress: Address;

    beforeAll(async () => {
      proof = await readProof(PROOF_PATH);
      inputMap = await readInputMap(INPUT_MAP_PATH);
      witnessMap = await readWitnessMap(INPUT_MAP_PATH);
      account = privateKeyToAccount(ANVIL_TEST_ACCOUNT_PRIVATE_KEY);
      client = createAnvilClient();
      contractAddress = await deployVerificationContract();
    });

    async function deployVerificationContract(): Promise<Address> {
      const deploymentTxHash = await client.deployContract({
        abi: ultraVerifier.abi,
        account,
        bytecode: ultraVerifier.bytecode.object as Hex,
        chain: client.chain
      });

      const deploymentTxReceipt = await client.waitForTransactionReceipt({ hash: deploymentTxHash });
      expect(deploymentTxReceipt.status).toEqual('success');

      assert(!!deploymentTxReceipt.contractAddress, 'Deployed contract address should not be empty');
      return deploymentTxReceipt.contractAddress!;
    }

    it('smart contract proof verification successes', async () => {
      const proofVerificationTxHash = await verifyStorageProofInSolidity(
        client,
        account,
        contractAddress,
        proof,
        witnessMap
      );
      const proofVerificationTxReceipt = await client.waitForTransactionReceipt({ hash: proofVerificationTxHash });
      expect(proofVerificationTxReceipt.status).toEqual('success');
      expect(proofVerificationTxReceipt.gasUsed).toBeLessThanOrEqual(VERIFICATION_GAS_LIMIT);
    });

    it('proof fails: invalid nonce', async () => {
      const inputMapCopy = copy(inputMap);
      updateNestedField(inputMapCopy, ['return', 'nonce'], incHexStr);
      const witnessMapInvalidNonce = abiEncode(circuit.abi, inputMapCopy, inputMapCopy['return']);
      expect(
        async () => await verifyStorageProofInSolidity(client, account, contractAddress, proof, witnessMapInvalidNonce)
      ).rejects.toThrowError('Execution reverted');
    });

    it('proof fails: invalid state root', async () => {
      const inputMapCopy = copy(inputMap);
      updateNestedField(inputMapCopy, ['state_root', '0'], incHexStr);
      const witnessMapInvalidStateRoot = abiEncode(circuit.abi, inputMapCopy, inputMapCopy['return']);
      expect(
        async () =>
          await verifyStorageProofInSolidity(client, account, contractAddress, proof, witnessMapInvalidStateRoot)
      ).rejects.toThrowError('Execution reverted');
    });
  },
  {
    timeout: 3 * 60 * 1000
  }
);
