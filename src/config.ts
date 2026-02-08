import os from "node:os";
import path from "node:path";

export function getDefaultRoots(): string[] {
  const home = os.homedir();
  return [path.join(home, "Downloads"), path.join(home, "Desktop")];
}

export function getDefaultDestRoots(roots: string[]): Record<string, string> {
  const destRoots: Record<string, string> = {};
  for (const root of roots) {
    destRoots[root] = path.join(root, "_Sorted");
  }
  return destRoots;
}

export function getDefaultRulesPath(): string {
  const home = os.homedir();
  return path.join(home, ".inboxzero", "rules.json");
}
