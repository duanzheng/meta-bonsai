import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { scanAndPruneTree, type MetaNode } from "../src/core/tree";

async function createTempDir() {
  return mkdtemp(join(tmpdir(), "meta-bonsai-"));
}

async function writeTextFile(path: string, content: string) {
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, content, "utf8");
}

describe("scanAndPruneTree", () => {
  let root = "";

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true });
      root = "";
    }
  });

  it("returns null when no nodes are marked", async () => {
    root = await createTempDir();
    await writeTextFile(join(root, "a.ts"), "const a = 1;");

    const tree = await scanAndPruneTree(root);
    expect(tree).toBeNull();
  });

  it("keeps full path to a deep marked file", async () => {
    root = await createTempDir();
    const filePath = join(root, "src", "pages", "home.ts");
    await writeTextFile(filePath, "/** @meta 首页 */\nconst a = 1;");

    const tree = await scanAndPruneTree(root);
    expect(tree).not.toBeNull();
    expect(tree?.name).toBeDefined();
    const level1 = tree?.children?.[0];
    const level2 = level1?.children?.[0];
    const file = level2?.children?.[0];
    expect(level1?.name).toBe("src");
    expect(level2?.name).toBe("pages");
    expect(file?.name).toBe("home.ts");
    expect(file?.description).toBe("首页");
  });

  it("keeps mixed meta from directory and file", async () => {
    root = await createTempDir();
    const dirPath = join(root, "feature");
    await mkdir(dirPath, { recursive: true });
    await writeTextFile(
      join(dirPath, "__meta.json"),
      JSON.stringify({ desc: "关键模块" })
    );
    await writeTextFile(
      join(dirPath, "index.ts"),
      "/** @meta 入口 */\nexport const x = 1;"
    );

    const tree = await scanAndPruneTree(root);
    const feature = tree?.children?.[0] as MetaNode | undefined;
    const indexFile = feature?.children?.[0] as MetaNode | undefined;

    expect(feature?.name).toBe("feature");
    expect(feature?.description).toBe("关键模块");
    expect(indexFile?.name).toBe("index.ts");
    expect(indexFile?.description).toBe("入口");
  });
});
