import {
  binToHex,
  decodeAuthenticationInstructions,
  encodeAuthenticationInstructions,
  vmNumberToBigInt,
} from "@bitauth/libauth";
import { Artifact } from "cashscript";

export function bytecodeToScript(
  bytecode: Uint8Array
): (number | Uint8Array)[] {
  const instructions = decodeAuthenticationInstructions(bytecode);

  const script = instructions.map((instruction) =>
    "data" in instruction ? instruction.data : instruction.opcode
  );

  return script;
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function isValidContract(
  abi: Artifact,
  contract: Uint8Array,
  _assumption: (string | bigint | null)[]
) {
  const inputs = [...abi.constructorInputs].reverse();
  const assumption = [..._assumption].reverse();
  const script = decodeAuthenticationInstructions(contract);

  assert(
    assumption.length === inputs.length,
    "All contract params are required"
  );

  for (let i = 0; i < inputs.length; i++) {
    const { type } = inputs[i];
    const expected = assumption[i];
    const instruction = script[i] as any;

    if (expected === null) {
      continue;
    }

    if (type === "int") {
      if (instruction.opcode === 0 && expected === 0n) continue;

      // OP_1 - OP_16
      if (
        instruction.opcode >= 81 &&
        instruction.opcode <= 96 &&
        BigInt(instruction.opcode - 80) === expected
      )
        continue;

      if (vmNumberToBigInt(instruction.data) === expected) continue;

      return false;
    } else {
      if (binToHex(instruction.data) !== expected) return false;
    }
  }

  const contractOnly = binToHex(
    encodeAuthenticationInstructions(script.splice(inputs.length))
  );
  return contractOnly === abi.debug!.bytecode;
}
