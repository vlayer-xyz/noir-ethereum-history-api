import { type CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { promises as fs } from 'fs';
import toml from 'toml';
import noir_ethereum_history_api from '../../../target/ethereum_history_api.json';
import { encodeHexString } from 'noir-ethereum-api-oracles';
import { abiEncode, type InputMap, WitnessMap } from '@noir-lang/noirc_abi';

export const circuit = noir_ethereum_history_api as unknown as CompiledCircuit;

export interface MainInputs extends InputMap {
  block_no: number;
  address: string[];
  state_root: string[];
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
