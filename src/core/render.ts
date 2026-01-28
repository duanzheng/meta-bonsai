import type { MetaNode } from "./tree";

type RenderOptions = {
  includeRoot?: boolean;
};

function formatLabel(node: MetaNode): string {
  const suffix = node.description ? ` // ${node.description}` : "";
  return `${node.name}${suffix}`;
}

function renderChildren(nodes: MetaNode[], prefix: string, lines: string[]) {
  const lastIndex = nodes.length - 1;
  nodes.forEach((node, index) => {
    const isLast = index === lastIndex;
    const connector = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${connector}${formatLabel(node)}`);
    if (node.children && node.children.length > 0) {
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      renderChildren(node.children, nextPrefix, lines);
    }
  });
}

function renderRootChildren(nodes: MetaNode[], lines: string[]) {
  nodes.forEach((node) => {
    lines.push(formatLabel(node));
    if (node.children && node.children.length > 0) {
      renderChildren(node.children, "    ", lines);
    }
  });
}

export function renderTree(
  tree: MetaNode,
  options: RenderOptions = {},
): string {
  const includeRoot = options.includeRoot ?? false;
  const lines: string[] = [];
  if (includeRoot) {
    lines.push(formatLabel(tree));
    if (tree.children && tree.children.length > 0) {
      renderChildren(tree.children, "", lines);
    }
    return lines.join("\n");
  }
  if (tree.children && tree.children.length > 0) {
    renderRootChildren(tree.children, lines);
  }
  return lines.join("\n");
}
