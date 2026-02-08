import path from "node:path";
import { minimatch } from "minimatch";
import type { Rule } from "./types.js";

const EXT_BUCKETS: Record<string, string> = {
  ".png": "Images",
  ".jpg": "Images",
  ".jpeg": "Images",
  ".gif": "Images",
  ".svg": "Images",
  ".webp": "Images",
  ".heic": "Images",
  ".pdf": "Docs",
  ".docx": "Docs",
  ".doc": "Docs",
  ".xlsx": "Docs",
  ".xls": "Docs",
  ".pptx": "Docs",
  ".ppt": "Docs",
  ".txt": "Docs",
  ".md": "Docs",
  ".zip": "Archives",
  ".rar": "Archives",
  ".7z": "Archives",
  ".tar": "Archives",
  ".gz": "Archives",
  ".exe": "Installers",
  ".msi": "Installers",
  ".msix": "Installers",
  ".apk": "Installers",
  ".mp3": "Media",
  ".wav": "Media",
  ".flac": "Media",
  ".mp4": "Media",
  ".mov": "Media",
  ".mkv": "Media",
  ".js": "Code",
  ".ts": "Code",
  ".tsx": "Code",
  ".py": "Code",
  ".ps1": "Code",
  ".cs": "Code",
  ".java": "Code",
  ".json": "Code",
  ".yaml": "Code",
  ".yml": "Code",
  ".csv": "Data",
  ".parquet": "Data",
  ".tsv": "Data",
  ".db": "Data",
  ".sqlite": "Data"
};

export function classifyPath(
  filePath: string,
  relativePath: string,
  rules: Rule[]
): { target: string; reason: string } {
  const normalizedRel = toPosix(relativePath);
  const matchingRule = pickRule(filePath, normalizedRel, rules);
  if (matchingRule) {
    return { target: matchingRule.target, reason: `rule:${matchingRule.name}` };
  }

  const ext = path.extname(filePath).toLowerCase();
  const bucket = EXT_BUCKETS[ext];
  if (bucket) {
    return { target: bucket, reason: `type:${bucket}` };
  }

  return { target: "Other", reason: "fallback:Other" };
}

function pickRule(filePath: string, relativePath: string, rules: Rule[]): Rule | null {
  if (!rules.length) {
    return null;
  }

  const basename = path.basename(filePath);
  const sorted = [...rules].sort((a, b) => {
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    return 0;
  });

  for (const rule of sorted) {
    if (minimatch(relativePath, rule.match, { dot: true, nocase: true })) {
      return rule;
    }
    if (minimatch(basename, rule.match, { dot: true, nocase: true })) {
      return rule;
    }
  }

  return null;
}

function toPosix(value: string): string {
  return value.replace(/\\/g, "/");
}
