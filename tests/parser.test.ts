import { describe, expect, it } from "vitest";
import { parseMetaComment, parseMetaJson } from "../src/core/parser";

describe("parseMetaComment", () => {
  it("extracts @meta description from leading comment", () => {
    const content =
      "/** @meta 页面入口 */\n" +
      "const app = 1;\n".padEnd(1000, "x");
    expect(parseMetaComment(content)).toBe("页面入口");
  });

  it("returns null when comment is not at the beginning", () => {
    const content = "\n/** @meta 不应匹配 */\nconst app = 1;";
    expect(parseMetaComment(content)).toBeNull();
  });
});

describe("parseMetaJson", () => {
  it("prefers desc over name", () => {
    const json = JSON.stringify({ name: "目录名", desc: "关键模块" });
    expect(parseMetaJson(json)).toBe("关键模块");
  });

  it("falls back to name", () => {
    const json = JSON.stringify({ name: "目录名" });
    expect(parseMetaJson(json)).toBe("目录名");
  });

  it("returns null for invalid json", () => {
    expect(parseMetaJson("{")).toBeNull();
  });
});
