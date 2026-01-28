import ignore from "ignore";
import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";

export type IgnoreMatcher = (absolutePath: string, isDir: boolean) => boolean;

function toRelativePath(rootPath: string, absolutePath: string): string {
  const rel = relative(rootPath, absolutePath);
  return rel.split("\\").join("/");
}

export async function createIgnoreMatcher(
  rootPath: string,
  cliIgnores: string[] = []
): Promise<IgnoreMatcher> {
  const ig = ignore();

  const gitignorePath = join(rootPath, ".gitignore");
  try {
    const gitignore = await readFile(gitignorePath, "utf8");
    ig.add(gitignore);
  } catch {
    // ignore missing .gitignore
  }

  const normalizedCliIgnores = cliIgnores
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (normalizedCliIgnores.length > 0) {
    ig.add(normalizedCliIgnores);
  }

  return (absolutePath: string, isDir: boolean) => {
    if (absolutePath === rootPath) {
      return false;
    }
    const rel = toRelativePath(rootPath, absolutePath);
    if (!rel) {
      return false;
    }
    const pathWithType = isDir ? `${rel}/` : rel;
    return ig.ignores(pathWithType);
  };
}
