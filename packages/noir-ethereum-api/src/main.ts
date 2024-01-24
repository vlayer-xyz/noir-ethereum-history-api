import { BarretenbergBackend, ProofData, type CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { Noir, WitnessMap } from '@noir-lang/noir_js';
import { promises as fs } from 'fs';
import toml from 'toml';
import os from 'os';
import noir_ethereum_history_api from '../../../circuit/target/noir_ethereum_history_api.json';
import { type Oracles, defaultOracles } from './noir/oracles/oracles.js';
import { decodeHexString, encodeHexString } from './noir/noir_js/encode.js';
import { abiEncode, type InputMap } from '@noir-lang/noirc_abi';

export const circuit = noir_ethereum_history_api as unknown as CompiledCircuit;
const backend = new BarretenbergBackend(circuit, { threads: os.cpus().length });
const noir = new Noir(circuit, backend);

export interface MainInputs extends InputMap {
  block_no: number;
  address: string[];
  state_root: string[];
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export async function recordStorageProof(
  input: MainInputs,
  oracles: Oracles = defaultOracles,
  name: string
): Promise<boolean> {
  const proof = await noir.generateFinalProof(input, oracles);

  const proofHex = decodeHexString(proof.proof);
  await fs.writeFile(`${name}.proof`, proofHex);

  const publicInputsData = Array.from(proof.publicInputs.values()).join('\n');
  await fs.writeFile(`${name}.publicInputs`, publicInputsData);

  const isCorrect = await noir.verifyFinalProof(proof);
  return isCorrect;
}

export async function verifyStorageProof(proof: ProofData): Promise<boolean> {
  return await noir.verifyFinalProof(proof);
}

export async function readProof(path: string): Promise<Uint8Array> {
  const proofHex = await fs.readFile(path, 'utf-8');
  return encodeHexString('0x' + proofHex);
}

export async function readWitnessMap(path: string): Promise<WitnessMap> {
  const inputMap = await readInputMap(path);
  const witnessMap = abiEncode(circuit.abi, inputMap, inputMap['return']);
  return witnessMap;
}

export async function readInputMap(path: string): Promise<InputMap> {
  const verifierData = await fs.readFile(path, 'utf-8');
  const inputMap = toml.parse(verifierData);
  return inputMap;
}
