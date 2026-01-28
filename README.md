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

## Marking Rules

- Directory: create `__meta.json` under the directory and set `desc` or `name`
- File: start the file with `/** @meta Description */`

Only `.ts`, `.tsx`, `.js`, `.jsx`, and `.vue` files are scanned for file-level marks.

## Library API

Exports are available from the package root:

- `scanAndPruneTree`: scan a directory and return a pruned tree
- `renderTree`: render a pruned tree as ASCII
- `createIgnoreMatcher`: build an ignore matcher from `.gitignore` plus CLI patterns
- `parseMetaComment`: parse `@meta` from a file prefix
- `parseMetaJson`: parse `__meta.json`
- `MetaNode`, `IgnoreMatcher`: exported types

## Development

- Run tests: `npm test`
- Build: `npm run build`
- Typecheck: `npm run typecheck`

## License

MIT
