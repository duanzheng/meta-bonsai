import * as dree from "dree";
import { open, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { parseMetaComment, parseMetaJson } from "./parser";
import type { IgnoreMatcher } from "./ignore";

const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".vue"]);
const META_FILE = "__meta.json";
const MAX_PREFIX_BYTES = 1000;

export type MetaNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  description?: string;
  children?: MetaNode[];
};

type DreeNode = {
  name: string;
  path?: string;
  type: "file" | "directory";
  children?: DreeNode[];
};

async function readFilePrefix(path: string): Promise<string> {
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(MAX_PREFIX_BYTES);
    const { bytesRead } = await handle.read(buffer, 0, MAX_PREFIX_BYTES, 0);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally {
    await handle.close();
  }
}

async function getFileDescription(path: string): Promise<string | null> {
  const ext = extname(path);
  if (!CODE_EXTENSIONS.has(ext)) {
    return null;
  }
  const prefix = await readFilePrefix(path);
  return parseMetaComment(prefix);
}

async function getDirDescription(path: string): Promise<string | null> {
  const metaPath = join(path, META_FILE);
  try {
    await stat(metaPath);
    const content = await readFilePrefix(metaPath);
    return parseMetaJson(content);
  } catch {
    return null;
  }
}

async function transformNode(
  node: DreeNode,
  parentPath: string,
  ignoreMatcher?: IgnoreMatcher
): Promise<MetaNode | null> {
  const resolvedPath = node.path ? node.path : join(parentPath, node.name);
  if (ignoreMatcher?.(resolvedPath, node.type === "directory")) {
    return null;
  }
  if (node.type === "file") {
    const description = await getFileDescription(resolvedPath);
    if (!description) {
      return null;
    }
    return {
      name: node.name,
      path: resolvedPath,
      type: "file",
      description,
    };
  }

  const description = await getDirDescription(resolvedPath);
  const children: MetaNode[] = [];
  for (const child of node.children ?? []) {
    const next = await transformNode(child, resolvedPath, ignoreMatcher);
    if (next) {
      children.push(next);
    }
  }
  if (!description && children.length === 0) {
    return null;
  }
  return {
    name: node.name,
    path: resolvedPath,
    type: "directory",
    description: description || undefined,
    children: children.length > 0 ? children : undefined,
  };
}

export async function scanAndPruneTree(
  rootPath: string,
  config?: { ignoreMatcher?: IgnoreMatcher }
): Promise<MetaNode | null> {
  const scanOptions: Record<string, boolean> = {
    stat: false,
    followLinks: false,
    size: false,
    hash: false,
  };
  const tree = dree.scan(rootPath, scanOptions) as DreeNode;
  return transformNode(tree, rootPath, config?.ignoreMatcher);
}
