#!/usr/bin/env node
import { cac } from "cac";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createIgnoreMatcher } from "./core/ignore";
import { renderTree } from "./core/render";
import { scanAndPruneTree } from "./core/tree";

type CliOptions = {
  ignore?: string | string[];
  includeRoot?: boolean;
};

function startSpinner(message: string): (finalMessage?: string) => void {
  if (!process.stderr.isTTY) {
    return (finalMessage?: string) => {
      if (finalMessage) {
        process.stderr.write(`${finalMessage}\n`);
      }
    };
  }
  const frames = ["|", "/", "-", "\\"];
  let frameIndex = 0;
  const interval = setInterval(() => {
    const frame = frames[frameIndex++ % frames.length];
    process.stderr.write(`\r${frame} ${message}`);
  }, 80);
  return (finalMessage?: string) => {
    clearInterval(interval);
    const clear = `\r${" ".repeat(message.length + 4)}\r`;
    process.stderr.write(clear);
    if (finalMessage) {
      process.stderr.write(`${finalMessage}\n`);
    }
  };
}

function copyToClipboard(text: string): boolean {
  const platform = process.platform;
  const candidates: Array<[string, string[]]> =
    platform === "darwin"
      ? [["pbcopy", []]]
      : platform === "win32"
        ? [["clip", []]]
        : [
            ["xclip", ["-selection", "clipboard"]],
            ["xsel", ["--clipboard", "--input"]],
          ];
  for (const [command, args] of candidates) {
    const result = spawnSync(command, args, {
      input: text,
      stdio: ["pipe", "ignore", "ignore"],
    });
    if (!result.error && result.status === 0) {
      return true;
    }
  }
  return false;
}

function normalizeIgnore(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

async function run(dir: string | undefined, options: CliOptions) {
  const stopSpinner = startSpinner("Scanning...");
  let spinnerStopped = false;
  const stop = (finalMessage?: string) => {
    if (spinnerStopped) {
      return;
    }
    spinnerStopped = true;
    stopSpinner(finalMessage);
  };
  const target = resolve(process.cwd(), dir ?? ".");
  try {
    const ignoreMatcher = await createIgnoreMatcher(
      target,
      normalizeIgnore(options.ignore),
    );
    const tree = await scanAndPruneTree(target, { ignoreMatcher });
    stop();
    if (!tree) {
      console.log("No marked nodes found.");
      return;
    }
    const output = renderTree(tree, { includeRoot: options.includeRoot });
    console.log(output);
    if (copyToClipboard(output)) {
      console.error("Copied to clipboard.");
    } else {
      console.error("Clipboard copy failed, please copy the output manually.");
    }
  } finally {
    stop();
  }
}

const cli = cac("meta-bonsai");

cli
  .command("[dir]", "Scan a directory")
  .option("--ignore <pattern>", "Ignore paths (repeatable or comma-separated)")
  .option("--include-root", "Include project root in output")
  .action((dir: string | undefined, options: CliOptions) => {
    run(dir, options).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exitCode = 1;
    });
  });

cli.help();
cli.parse();
