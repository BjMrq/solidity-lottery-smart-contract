import { resolve } from "path";
import { readFileSync } from "fs";
import solc from "solc";
import * as R from "ramda";

const getContractSourceCodeFor = (contractName: string) => {
  const runFromDistFolder = __dirname.includes("dist");

  const ifRunFolderPathOneLevelDown = runFromDistFolder ? [".."] : [];

  const contractPath = resolve(
    __dirname,
    ...ifRunFolderPathOneLevelDown,
    "contracts",
    contractName.toLowerCase(),
    `${contractName}.sol`
  );

  return readFileSync(contractPath, "utf8");
};

const startCompilationFor = (contractName: string): solc.CompilerOutput => {
  const compileConfigBase = {
    language: "Solidity",
    sources: {},
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const compileConfigWithSourceCode = R.assocPath(
    ["sources", `${contractName}.sol`, "content"],
    getContractSourceCodeFor(contractName),
    compileConfigBase
  );

  return JSON.parse(solc.compile(JSON.stringify(compileConfigWithSourceCode)));
};

export const compileContract = (contractName: string) => {
  console.log(`Compiling ${contractName}...`);

  const { contracts, errors } = startCompilationFor(contractName);

  if (errors) console.log(`${contractName} compiled with errors:\n`, errors);
  else console.log(`${contractName} compiled with no error!\n`);

  return contracts[`${contractName}.sol`][contractName];
};
