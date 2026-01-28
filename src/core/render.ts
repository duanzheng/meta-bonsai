import type { MetaNode } from "./tree";

function formatLabel(node: MetaNode): string {
  const suffix = node.description ? ` // ${node.description}` : "";
  return `${node.name}${suffix}`;
}

function renderChildren(
  nodes: MetaNode[],
  prefix: string,
  lines: string[]
) {
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

export function renderTree(tree: MetaNode): string {
  const lines = [formatLabel(tree)];
  if (tree.children && tree.children.length > 0) {
    renderChildren(tree.children, "", lines);
  }
  return lines.join("\n");
}
