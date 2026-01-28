# meta-bonsai

[![ci](https://github.com/duanzheng/meta-bonsai/actions/workflows/ci-release.yml/badge.svg)](https://github.com/duanzheng/meta-bonsai/actions/workflows/ci-release.yml)
[![npm](https://img.shields.io/npm/v/meta-bonsai)](https://www.npmjs.com/package/meta-bonsai)
[![downloads](https://img.shields.io/npm/dm/meta-bonsai)](https://www.npmjs.com/package/meta-bonsai)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](./)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

meta-bonsai generates a pruned ASCII tree that highlights only developer-marked files and directories, keeping ancestor paths to preserve structure.

## Features

- Scans with dree and prunes unmarked branches
- Marks directories by `__meta.json` and files by `/** @meta ... */`
- Reads at most the first 1000 bytes per file for performance
- Respects `.gitignore` and CLI `--ignore` patterns
- Works as both a CLI and a library

## Installation

This package is intended to be used via `npx meta-bonsai` or as a library dependency in Node.js projects.

## CLI

- Run in the current directory: `npx meta-bonsai`
- Run with a target path: `npx meta-bonsai ./src`
- Ignore paths (repeatable or comma-separated): `--ignore dist --ignore node_modules,coverage`

If no marked nodes are found, the CLI prints a friendly message and exits normally.

### npx output example

When marked nodes exist, it prints a pruned ASCII tree:

```
project
├── src // core
│   └── main.ts // entry
└── README.md // docs
```

## Marking Rules

- Directory: create `__meta.json` under the directory and set `desc` or `name`
- File: start the file with `/** @meta Description */`

Only `.ts`, `.tsx`, `.js`, `.jsx`, and `.vue` files are scanned for file-level marks.

### Writing examples

#### `__meta.json` (directory)

Place it in the directory. Valid JSON; `desc` takes precedence over `name`:

```json
{ "desc": "core business" }
```

Or use `name` only:

```json
{ "name": "src" }
```

When both exist, `desc` is used: `{ "name": "src", "desc": "core business" }` → displays "core business".

#### `@meta` comment (file)

Must be at the **very beginning** of the file (no characters, including newlines, before `/**`). Only `.ts`, `.tsx`, `.js`, `.jsx`, and `.vue` are scanned:

```
/** @meta page entry */
```

```
/** @meta entry */
```

If there is a newline or any content before the comment, it will not match.

## Library API

Exports are available from the package root:

- `scanAndPruneTree`: scan a directory and return a pruned tree
- `renderTree`: render a pruned tree as ASCII
- `createIgnoreMatcher`: build an ignore matcher from `.gitignore` plus CLI patterns
- `parseMetaComment`: parse `@meta` from a file prefix
- `parseMetaJson`: parse `__meta.json`
- `MetaNode`, `IgnoreMatcher`: exported types

### Code example

```js
import { scanAndPruneTree, renderTree, createIgnoreMatcher } from "meta-bonsai";

// Basic usage: scan a directory and print
const tree = await scanAndPruneTree("./src");
if (tree) {
  console.log(renderTree(tree));
}

// With custom ignore rules (.gitignore + extra patterns)
const ignoreMatcher = await createIgnoreMatcher(".", ["dist", "coverage"]);
const tree2 = await scanAndPruneTree(".", { ignoreMatcher });
if (tree2) {
  console.log(renderTree(tree2));
}
```

## Development

- Run tests: `npm test`
- Build: `npm run build`
- Typecheck: `npm run typecheck`

## License

MIT
