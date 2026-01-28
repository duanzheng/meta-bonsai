import { describe, expect, it } from "vitest";
import { renderTree } from "../src/core/render";
import type { MetaNode } from "../src/core/tree";

describe("renderTree", () => {
  it("renders ascii tree without root by default", () => {
    const tree: MetaNode = {
      name: "project",
      path: "/project",
      type: "directory",
      children: [
        {
          name: "src",
          path: "/project/src",
          type: "directory",
          description: "核心代码",
          children: [
            {
              name: "main.ts",
              path: "/project/src/main.ts",
              type: "file",
              description: "入口",
            },
          ],
        },
        {
          name: "README.md",
          path: "/project/README.md",
          type: "file",
          description: "说明",
        },
      ],
    };

    const output = renderTree(tree);
    expect(output).toBe(
      ["src // 核心代码", "    └── main.ts // 入口", "README.md // 说明"].join(
        "\n",
      ),
    );
  });

  it("can include root when configured", () => {
    const tree: MetaNode = {
      name: "project",
      path: "/project",
      type: "directory",
      children: [
        {
          name: "src",
          path: "/project/src",
          type: "directory",
          description: "核心代码",
          children: [
            {
              name: "main.ts",
              path: "/project/src/main.ts",
              type: "file",
              description: "入口",
            },
          ],
        },
        {
          name: "README.md",
          path: "/project/README.md",
          type: "file",
          description: "说明",
        },
      ],
    };

    const output = renderTree(tree, { includeRoot: true });
    expect(output).toBe(
      [
        "project",
        "├── src // 核心代码",
        "│   └── main.ts // 入口",
        "└── README.md // 说明",
      ].join("\n"),
    );
  });
});
