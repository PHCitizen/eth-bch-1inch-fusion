import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const compile = (): void => {
  const contractDir = path.join(import.meta.dirname, "../contracts");
  const contracts = fs.readdirSync(contractDir, {
    recursive: true,
  }) as string[];

  contracts
    .filter((contract) => contract.endsWith(".cash"))
    .forEach((contract) => {
      const contractPath = path.join(contractDir, contract);
      const outputPath = path.join(
        import.meta.dirname,
        "../artifacts/",
        contract.replace(/\.cash$/, ".artifact.ts")
      );

      execSync(`pnpm cashc -f ts ${contractPath} -o ${outputPath}`);
    });
};

switch (process.argv[2]) {
  case "compile":
    compile();
    break;
  default:
    console.log("Unknown task");
    break;
}
