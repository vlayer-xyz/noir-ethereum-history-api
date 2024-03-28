import { describe, expect, it } from 'vitest';
import {
  encodeReceipt,
  logToRlpFields,
  receiptToRlpFields,
  statusToField,
  statusToHex,
  txTypeToField,
  txTypeToHex
} from './receipt.js';
import { toEventSelector } from 'viem';
import { assert } from '../util/assert.js';
import { loadReceiptFixture } from '../fixtures.js';

describe('logToRlpFields', () => {
  it(`log`, async () => {
    const chainLinkTransferReceipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'small_block',
      '0x98e19df80eb8feae436896cc7cc6d4a97818e6010b56a249352b9ac2caf0d573'
    );
    const transferLog = chainLinkTransferReceipt.logs[0];

    expect(logToRlpFields(transferLog)).toEqual([
      '0x514910771af9ca656af840dff83e8264ecf986ca',
      [
        toEventSelector('Transfer(address,address,uint256)'),
        '0x000000000000000000000000fa4d81487ece32e95ae2bee5fc860f189fe163d8',
        '0x000000000000000000000000125f660239707c9de3462d3fa633f2723ad0b884'
      ],
      '0x00000000000000000000000000000000000000000000003f44127fb43fa10000'
    ]);
  });
});

describe('statusToHex', () => {
  it(`success`, () => {
    expect(statusToHex('success')).toEqual('0x01');
  });

  it(`reverted`, () => {
    expect(statusToHex('reverted')).toEqual('0x');
  });
});

describe('statusToField', () => {
  it(`success`, () => {
    expect(statusToField('success')).toEqual(1);
  });

  it(`reverted`, () => {
    expect(statusToField('reverted')).toEqual(0);
  });
});

describe('txTypeToHex', () => {
  it(`legacy`, () => {
    expect(txTypeToHex('legacy')).toEqual('0x00');
  });

  it(`eip2930`, () => {
    expect(txTypeToHex('eip2930')).toEqual('0x01');
  });

  it(`eip1559`, () => {
    expect(txTypeToHex('eip1559')).toEqual('0x02');
  });

  it(`eip4844`, () => {
    expect(txTypeToHex('eip4844')).toEqual('0x03');
  });

  it(`unknown`, () => {
    expect(() => txTypeToHex('unknown')).toThrowError(`Unknown transaction type: unknown`);
  });
});

describe('txTypeToField', () => {
  it('legacy', () => {
    expect(txTypeToField('legacy')).toEqual(0);
  });

  it('unknown', () => {
    expect(() => txTypeToField('unknown')).toThrowError(`Unknown transaction type: unknown`);
  });
});

describe('receiptToRlpFields', () => {
  it('pre Byzantinum receipt', async () => {
    const homesteadReceipt = await loadReceiptFixture(
      'mainnet',
      'homestead',
      'fork',
      '0xee83a1cd74a17c0c119c48280de365d8b196d8fe93cc388d1202a97d757f4dbe'
    );
    const rlpFields = receiptToRlpFields(homesteadReceipt);

    expect(rlpFields).toMatchInlineSnapshot(`
      [
        "0xec4470dcadf823c65cff92dad244a029cfc5153609f13c82e14a2039e9d14529",
        "0x9e751",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        [],
      ]
    `);
  });

  it(`post Byzantinum receipt`, async () => {
    const legacyReceipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'small_block',
      '0x94a8715a083008845fc4983e89627e6a99de9f15d8455cc3fb2c1583f594932a'
    );
    const rlpFields = receiptToRlpFields(legacyReceipt);

    expect(rlpFields).toMatchInlineSnapshot(`
      [
        "0x01",
        "0x8a73c",
        "0x00000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000200000000000000001000000000000000080000000000000000000000000400000000000000000000000000000800000000000000000000000000080000000000000000000000000000000000000000000000000000000080000000000000000000000020000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000001000000000000",
        [
          [
            "0x405154cfaf5ea4ef57b65b86959c73dd079fa312",
            [
              "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
              "0x0000000000000000000000007069eca2855d49926d2bb9508cbceb92e3d26f0b",
              "0x000000000000000000000000c465cc50b7d5a29b9308968f870a4b242a8e1873",
            ],
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          ],
        ],
      ]
    `);
  });
});

describe('encodeReceipt', () => {
  it('legacy receipt', async () => {
    const legacyReceipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'small_block',
      '0x94a8715a083008845fc4983e89627e6a99de9f15d8455cc3fb2c1583f594932a'
    );
    assert(legacyReceipt.type === 'legacy', 'Expected legacy receipt type. Please check the fixtures');

    const encodedReceipt = encodeReceipt(legacyReceipt);

    expect(encodedReceipt.startsWith('0x00')).toBeFalsy();
  });

  it('eip2930 receipt', async () => {
    const eip2930Receipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'access_list',
      '0x702385c4922ef4476df045495d122c87294de15ad8abad104991458d98765978'
    );
    assert(eip2930Receipt.type === 'eip2930', 'Expected eip2930 receipt type. Please check the fixtures');

    const encodedReceipt = encodeReceipt(eip2930Receipt);

    expect(encodedReceipt.startsWith('0x01')).toBeTruthy();
  });

  it(`eip1559 receipt`, async () => {
    const eip1559Receipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'small_block',
      '0x98e19df80eb8feae436896cc7cc6d4a97818e6010b56a249352b9ac2caf0d573'
    );
    assert(eip1559Receipt.type === 'eip1559', 'Expected eip1559 receipt type. Please check the fixtures');

    const encodedReceipt = encodeReceipt(eip1559Receipt);

    expect(encodedReceipt.startsWith('0x02')).toBeTruthy();
  });

  it(`eip4844 receipt`, async () => {
    const eip4344Receipt = await loadReceiptFixture(
      'mainnet',
      'cancun',
      'with_blob',
      '0xd76ce9d036dc7e8491d134f9bc953ebb204545950821d8ada25968fea779a4b2'
    );
    assert(eip4344Receipt.type === 'eip4844', 'Expected eip4844 receipt type. Please check the fixtures');

    const encodedReceipt = encodeReceipt(eip4344Receipt);

    expect(encodedReceipt.startsWith('0x03')).toBeTruthy();
  });
});
