#!/usr/bin/env node
import { cac } from "cac";
import { resolve } from "node:path";
import { createIgnoreMatcher } from "./core/ignore";
import { renderTree } from "./core/render";
import { scanAndPruneTree } from "./core/tree";

type CliOptions = {
  ignore?: string | string[];
};

function normalizeIgnore(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function run(dir: string | undefined, options: CliOptions) {
  const target = resolve(process.cwd(), dir ?? ".");
  const ignoreMatcher = await createIgnoreMatcher(
    target,
    normalizeIgnore(options.ignore),
  );
  const tree = await scanAndPruneTree(target, { ignoreMatcher });
  if (!tree) {
    console.log("No marked nodes found.");
    return;
  }
  console.log(renderTree(tree));
}

const cli = cac("meta-bonsai");

cli
  .command("[dir]", "Scan a directory")
  .option("--ignore <pattern>", "Ignore paths (repeatable or comma-separated)")
  .action((dir: string | undefined, options: CliOptions) => {
    run(dir, options).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exitCode = 1;
    });
  });

cli.help();
cli.parse();
