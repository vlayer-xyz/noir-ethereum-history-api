import { expect } from 'vitest';
import { ForeignCallOutput } from '@noir-lang/noir_js';

export async function expectCircuitAssertionFail(p: Promise<boolean>): Promise<void> {
  await expect(p).rejects.toThrow('Circuit execution failed: Error: Cannot satisfy constraint');
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export type FieldsOfType<ObjectType, FieldType> = {
  [K in keyof ObjectType]: ObjectType[K] extends FieldType ? K : never;
}[keyof ObjectType];

export interface AccountWithProof {
  balance: string;
  codeHash: string[];
  nonce: string;
  key: string[];
  value: string[];
  proof: string[];
  depth: string;
}

export function serializeAccountWithProof(account: AccountWithProof): ForeignCallOutput[] {
  return [account.balance, account.codeHash, account.nonce, account.key, account.value, account.proof, account.depth];
}
