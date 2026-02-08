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
  ".heif": "Images",
  ".bmp": "Images",
  ".tif": "Images",
  ".tiff": "Images",
  ".avif": "Images",
  ".ico": "Images",
  ".psd": "Images",
  ".ai": "Images",
  ".eps": "Images",
  ".dng": "Images",
  ".cr2": "Images",
  ".nef": "Images",
  ".arw": "Images",
  ".pdf": "Docs",
  ".docx": "Docs",
  ".doc": "Docs",
  ".xlsx": "Docs",
  ".xls": "Docs",
  ".pptx": "Docs",
  ".ppt": "Docs",
  ".txt": "Docs",
  ".md": "Docs",
  ".rtf": "Docs",
  ".odt": "Docs",
  ".ods": "Docs",
  ".odp": "Docs",
  ".pages": "Docs",
  ".numbers": "Docs",
  ".key": "Docs",
  ".epub": "Docs",
  ".mobi": "Docs",
  ".log": "Docs",
  ".tex": "Docs",
  ".zip": "Archives",
  ".rar": "Archives",
  ".7z": "Archives",
  ".tar": "Archives",
  ".gz": "Archives",
  ".bz2": "Archives",
  ".xz": "Archives",
  ".tgz": "Archives",
  ".tbz": "Archives",
  ".tbz2": "Archives",
  ".tar.gz": "Archives",
  ".tar.bz2": "Archives",
  ".tar.xz": "Archives",
  ".iso": "Archives",
  ".exe": "Installers",
  ".msi": "Installers",
  ".msix": "Installers",
  ".msixbundle": "Installers",
  ".appx": "Installers",
  ".appxbundle": "Installers",
  ".apk": "Installers",
  ".cab": "Installers",
  ".mp3": "Audio",
  ".m4a": "Audio",
  ".aac": "Audio",
  ".ogg": "Audio",
  ".opus": "Audio",
  ".wma": "Audio",
  ".wav": "Audio",
  ".flac": "Audio",
  ".mp4": "Video",
  ".m4v": "Video",
  ".mov": "Video",
  ".mkv": "Video",
  ".avi": "Video",
  ".wmv": "Video",
  ".webm": "Video",
  ".flv": "Video",
  ".js": "Code",
  ".jsx": "Code",
  ".ts": "Code",
  ".tsx": "Code",
  ".py": "Code",
  ".ps1": "Code",
  ".psm1": "Code",
  ".psd1": "Code",
  ".bat": "Code",
  ".cmd": "Code",
  ".sh": "Code",
  ".c": "Code",
  ".cpp": "Code",
  ".h": "Code",
  ".hpp": "Code",
  ".cs": "Code",
  ".java": "Code",
  ".go": "Code",
  ".rs": "Code",
  ".rb": "Code",
  ".php": "Code",
  ".swift": "Code",
  ".kt": "Code",
  ".kts": "Code",
  ".sql": "Code",
  ".toml": "Code",
  ".ini": "Code",
  ".cfg": "Code",
  ".yaml": "Data",
  ".yml": "Data",`n  ".html": "Code",
  ".csv": "Data",
  ".json": "Data",
  ".jsonl": "Data",
  ".ndjson": "Data",
  ".xml": "Data",
  ".parquet": "Data",
  ".tsv": "Data",
  ".db": "Data",
  ".sqlite": "Data",
  ".sqlite3": "Data",
  ".db3": "Data",
  ".feather": "Data",
  ".avro": "Data",
  ".orc": "Data"
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

