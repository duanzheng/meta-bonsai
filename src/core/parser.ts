type MetaJson = {
  desc?: unknown;
  name?: unknown;
};

export function parseMetaComment(content: string): string | null {
  const match = content.match(/^\/\*\*\s*@meta\s+([^*]+?)\s*\*\//);
  if (!match) {
    return null;
  }
  const text = match[1].trim();
  return text.length > 0 ? text : null;
}

export function parseMetaJson(content: string): string | null {
  try {
    const data = JSON.parse(content) as MetaJson;
    const desc = typeof data.desc === "string" ? data.desc.trim() : "";
    if (desc) {
      return desc;
    }
    const name = typeof data.name === "string" ? data.name.trim() : "";
    return name || null;
  } catch {
    return null;
  }
}
