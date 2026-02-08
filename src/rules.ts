import fs from "node:fs/promises";
import path from "node:path";
import type { Rule, RulesFile } from "./types.js";

export async function loadRules(rulesPath: string): Promise<Rule[]> {
  try {
    const raw = await fs.readFile(rulesPath, "utf8");
    const parsed = JSON.parse(raw) as RulesFile;
    if (!parsed || !Array.isArray(parsed.rules)) {
      throw new Error("rules.json missing rules array");
    }
    return parsed.rules.filter((rule) => isValidRule(rule));
  } catch (err: unknown) {
    if (isMissingFile(err)) {
      return [];
    }
    throw err;
  }
}

function isValidRule(rule: Rule): boolean {
  return (
    typeof rule.name === "string" &&
    typeof rule.match === "string" &&
    typeof rule.target === "string"
  );
}

function isMissingFile(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "ENOENT"
  );
}

export function resolveRulesPath(pathArg: string | undefined, defaultPath: string): string {
  if (!pathArg) {
    return defaultPath;
  }
  return path.isAbsolute(pathArg) ? pathArg : path.resolve(pathArg);
}
