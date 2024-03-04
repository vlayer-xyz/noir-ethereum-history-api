import { describe, it, expect } from 'vitest';
import { withMockOracleServer } from './server.js';

const JSON_RPC_PAYLOAD = {
  jsonrpc: '2.0',
  method: 'get_header',
  params: [{ Single: { inner: 'd895ce' } }],
  id: 1
};

const GET_HEADER_POST_DATA = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(JSON_RPC_PAYLOAD)
};

const MOCK_ORACLE_SERVER_URL = `http://localhost:5556`;

async function expectServerUp(serverUrl: string) {
  const response = await fetch(serverUrl, GET_HEADER_POST_DATA);
  expect(response.status).toStrictEqual(200);
}

async function expectServerDown(serverUrl: string) {
  await expect(async () => await fetch(serverUrl, GET_HEADER_POST_DATA)).rejects.toThrow('fetch failed');
}

describe('mock oracle server', async () => {
  it('start server', async () => {
    await withMockOracleServer(async (serverUrl) => {
      await expectServerUp(serverUrl);
    });
  });

  it('return callback value', async () => {
    const result = await withMockOracleServer(async () => 'callback return value');

    expect(result).toStrictEqual('callback return value');
  });

  it('close server after callback finish', async () => {
    await withMockOracleServer(async () => {});

    await expectServerDown(MOCK_ORACLE_SERVER_URL);
  });

  it('close server when callback throws an exception', async () => {
    await expect(
      async () =>
        await withMockOracleServer(() => {
          throw new Error('error');
        })
    ).rejects.toThrow('error');

    await expectServerDown(MOCK_ORACLE_SERVER_URL);
  });
});
