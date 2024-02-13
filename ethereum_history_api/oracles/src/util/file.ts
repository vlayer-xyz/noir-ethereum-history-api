import { parse, stringify } from './json-bigint.js';
import fs, { writeFile } from 'fs/promises';
import os from 'os';
import packageJson from '../../package.json';

export function writeObject(object: object, filePath: string): Promise<void> {
  return writeFile(filePath, stringify(object));
}

export async function readObject<T>(filePath: string): Promise<T> {
  return parse(await fs.readFile(filePath, 'utf8')) as T;
}

export async function withTempFile<T>(callback: (path: string) => Promise<T>): Promise<T> {
  const testTempDir = await fs.mkdtemp(`${os.tmpdir()}/${packageJson.name}-temp-dir-`);
  const tempFilePath = `${testTempDir}/temp-${Date.now()}.json`;
  try {
    return await callback(tempFilePath);
  } finally {
    await fs.unlink(tempFilePath);
    await fs.rmdir(testTempDir);
  }
}
