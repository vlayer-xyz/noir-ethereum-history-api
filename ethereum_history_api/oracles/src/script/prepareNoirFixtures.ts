import { mkdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { Hex } from 'viem';
import { Block } from '../ethereum/blockHeader.js';
import { createClient } from '../ethereum/client.js';
import { getReceiptProof } from '../ethereum/receiptProof.js';
import { FIXTURES } from '../fixtures/config.js';
import { assert } from '../main.js';
import { createAccountFixture } from './noir_fixtures/account.js';
import { createHeaderFixture } from './noir_fixtures/header.js';
import { createReceiptProofFixture } from './noir_fixtures/receipt_proof.js';
import { createStateProofFixture } from './noir_fixtures/state_proof.js';
import { createStorageProofFixture } from './noir_fixtures/storage_proof.js';
import { createTransactionFixture } from './noir_fixtures/transaction.js';
import { createReceiptFixture } from './noir_fixtures/receipt.js';

const INDEX_NOT_FOUND = -1;

const NOIR_FIXTURES_DIRECTORY = '../circuits/lib/src/fixtures';
await rm(NOIR_FIXTURES_DIRECTORY, { recursive: true, force: true });

for (const chain in FIXTURES) {
  const client = createClient.get(chain)!();

  let chainModule = ``;
  const chainModuleFile = `${NOIR_FIXTURES_DIRECTORY}/${chain}.nr`;
  for (const hardFork in FIXTURES[chain]) {
    let hardforkModule = ``;
    const hardforkModuleFile = `${NOIR_FIXTURES_DIRECTORY}/${chain}/${hardFork}.nr`;

    for (const fixtureName in FIXTURES[chain][hardFork]) {
      const { blockNumber, address, storageKeys, transactionHash } = FIXTURES[chain][hardFork][fixtureName];
      const modulePath = `${NOIR_FIXTURES_DIRECTORY}/${chain}/${hardFork}/${fixtureName}`;
      await mkdir(modulePath, { recursive: true });
      const fixtureModules: string[] = [];

      const block = await client.getBlock({ blockNumber });
      await writeFile(join(modulePath, 'header.nr'), createHeaderFixture(block));
      fixtureModules.push('header');

      if (address) {
        const stateProof = await client.getProof({
          address,
          storageKeys: storageKeys ?? [],
          blockNumber
        });

        await writeFile(join(modulePath, 'account.nr'), createAccountFixture(stateProof));
        await writeFile(join(modulePath, 'state_proof.nr'), createStateProofFixture(stateProof));
        fixtureModules.push('account', 'state_proof');
        if (storageKeys) {
          await writeFile(join(modulePath, 'storage_proof.nr'), createStorageProofFixture(stateProof.storageProof));
          fixtureModules.push('storage_proof');
        }
      }

      if (transactionHash) {
        const txIdx = getTxIdx(block, transactionHash);
        const blockReceipts = await client.getTransactionReceipts({ blockNumber });
        const receipt = blockReceipts[txIdx];
        const txReceiptProof = await getReceiptProof(block, blockReceipts, txIdx);
        await writeFile(join(modulePath, 'receipt.nr'), createReceiptFixture(receipt));
        await writeFile(join(modulePath, 'receipt_proof.nr'), createReceiptProofFixture(txReceiptProof));
        fixtureModules.push('receipt_proof', 'receipt');

        const tx = await client.getTransaction({ hash: transactionHash });
        await writeFile(join(modulePath, 'transaction.nr'), createTransactionFixture(tx));
        fixtureModules.push('transaction');
      }

      const declareFixtureModules = fixtureModules.map((name) => `mod ${name};`).join('\n') + '\n';
      await writeFile(`${modulePath}.nr`, declareFixtureModules);

      hardforkModule += `mod ${fixtureName};\n`;
    }
    chainModule += `mod ${hardFork};\n`;
    await writeFile(hardforkModuleFile, hardforkModule);
  }
  await writeFile(chainModuleFile, chainModule);
}

function getTxIdx(block: Block, transactionHash: Hex): number {
  const txIdx = block.transactions.indexOf(transactionHash);
  assert(txIdx !== INDEX_NOT_FOUND, `Transaction with hash: ${transactionHash} not found in block #${block.number}`);
  return txIdx;
}
