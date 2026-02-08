import fs from "node:fs/promises";
import path from "node:path";
import { minimatch } from "minimatch";
import { classifyPath } from "./classify.js";
import type { Plan, PlanAction, Rule, ScanOptions } from "./types.js";

export async function buildPlan(
  roots: string[],
  destRoots: Record<string, string>,
  rules: Rule[],
  options: ScanOptions
): Promise<Plan> {
  const actions: PlanAction[] = [];
  const otherTypeCounts: Record<string, number> = {};
  const createdAt = new Date().toISOString();

  for (const root of roots) {
    const destRoot = destRoots[root];
    if (!destRoot) {
      continue;
    }
    const files = await walkFiles(root, destRoot, options);
    for (const filePath of files) {
      const relativePath = path.relative(root, filePath);
      const { target, reason } = classifyPath(filePath, relativePath, rules);
      if (target === "Other") {
        const ext = path.extname(filePath).toLowerCase();
        const key = ext || "(no extension)";
        otherTypeCounts[key] = (otherTypeCounts[key] ?? 0) + 1;
      }
      const targetSegments = normalizeTargetSegments(target);
      const destination = path.join(destRoot, ...targetSegments, path.basename(filePath));
      const stats = await fs.stat(filePath);
      actions.push({
        from: filePath,
        to: destination,
        reason,
        size: stats.size,
        mtime: stats.mtime.toISOString()
      });
    }
  }

  return {
    version: 1,
    createdAt,
    roots,
    destRoots,
    actions,
    otherTypeCounts
  };
}

async function walkFiles(
  root: string,
  destRoot: string,
  options: ScanOptions
): Promise<string[]> {
  const results: string[] = [];
  const stack: Array<{ dir: string; depth: number }> = [{ dir: root, depth: 0 }];
  const normalizedDest = path.resolve(destRoot);
  const normalizedRoot = path.resolve(root);

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const resolved = path.resolve(current.dir);
    if (isInside(resolved, normalizedDest)) {
      continue;
    }

    let entries;
    try {
      entries = await fs.readdir(resolved, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(resolved, entry.name);
      const relative = toPosix(path.relative(normalizedRoot, entryPath));
      if (!options.includeHidden && isHidden(entry.name)) {
        continue;
      }
      if (entry.isDirectory()) {
        if (entry.name === "_Sorted") {
          continue;
        }
        if (isIgnored(relative, options.ignore)) {
          continue;
        }
        if (current.depth < options.maxDepth) {
          stack.push({ dir: entryPath, depth: current.depth + 1 });
        }
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      if (isIgnored(relative, options.ignore)) {
        continue;
      }
      results.push(entryPath);
    }
  }

  return results;
}

function isHidden(name: string): boolean {
  return name.startsWith(".");
}

function isIgnored(relativePath: string, ignores: string[]): boolean {
  if (!ignores.length) {
    return false;
  }
  for (const pattern of ignores) {
    if (minimatch(relativePath, pattern, { dot: true, nocase: true })) {
      return true;
    }
  }
  return false;
}

function normalizeTargetSegments(target: string): string[] {
  return target
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function toPosix(value: string): string {
  return value.replace(/\\/g, "/");
}

function isInside(candidate: string, root: string): boolean {
  if (candidate === root) {
    return true;
  }
  const relative = path.relative(root, candidate);
  return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}
