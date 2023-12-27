import { describe, expect, it } from 'vitest'
import { generate_and_verify_simple_proof } from '../src/main.js'
import dotenv from 'dotenv';
import { oraclesStub } from './oraclesStub.js';

dotenv.config();


describe('generate_and_verify_simple_proof', () => {
  it('proof successes', async () => {
    expect(await generate_and_verify_simple_proof({ block_no: 18800000, address: "0x4200000000000000000000000000000000000016" }, oraclesStub)).toEqual(true)
  })

  it('proof fails', async () => {
    await expect(generate_and_verify_simple_proof({ block_no: 18800000, address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5" }, oraclesStub)).rejects.toThrow(
      'Circuit execution failed: Error: Failed to solve brillig function, reason: explicit trap hit in brillig',
    );
  })
}, {
  timeout: 20000
})
