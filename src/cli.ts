#!/usr/bin/env node
import path from "node:path";
import { Command } from "commander";
import { getDefaultDestRoots, getDefaultRoots, getDefaultRulesPath } from "./config.js";
import { loadRules, resolveRulesPath } from "./rules.js";
import { buildPlan } from "./scan.js";
import { applyPlan } from "./apply.js";
import { defaultPlanPath, readPlan, writePlan } from "./plan.js";
import type { ScanOptions } from "./types.js";

const program = new Command();

program
  .name("file-sorter")
  .description("Scan Downloads/Desktop and plan organized moves.")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan and write a plan JSON without applying changes.")
  .option("--out <path>", "custom plan output path")
  .option("--root <path>", "add a root to scan", collectValues, [] as string[])
  .option("--rules <path>", "path to rules.json")
  .option("--include-hidden", "include hidden files", false)
  .option("--ignore <glob>", "ignore glob pattern", collectValues, [] as string[])
  .option("--max-depth <n>", "max folder depth to scan", "0")
  .action(async (options) => {
    const roots = options.root.length ? options.root.map(resolvePath) : getDefaultRoots();
    const destRoots = getDefaultDestRoots(roots);
    const rulesPath = resolveRulesPath(options.rules, getDefaultRulesPath());
    const rules = await loadRules(rulesPath);
    const maxDepth = toNumber(options.maxDepth, 0);
    const baseIgnores = ["node_modules/**", ".git/**", "**/_Sorted/**"];
    const scanOptions: ScanOptions = {
      includeHidden: Boolean(options.includeHidden),
      ignore: baseIgnores.concat(options.ignore ?? []),
      maxDepth
    };
    const plan = await buildPlan(roots, destRoots, rules, scanOptions);
    const outPath = options.out ? resolvePath(options.out) : defaultPlanPath(destRoots);
    await writePlan(plan, outPath);
    printSummary(plan, outPath);
  });

program
  .command("apply")
  .description("Apply a plan JSON and move files.")
  .argument("<plan>", "path to plan json")
  .action(async (planPath) => {
    const plan = await readPlan(resolvePath(planPath));
    await applyPlan(plan);
    console.log("done");
  });

program.parse(process.argv);

function collectValues(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

function resolvePath(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(value);
}

function printSummary(plan: Awaited<ReturnType<typeof buildPlan>>, outPath: string): void {
  const counts: Record<string, number> = {};
  let totalSize = 0;
  for (const action of plan.actions) {
    const bucket = bucketFromReason(action.reason);
    counts[bucket] = (counts[bucket] ?? 0) + 1;
    totalSize += action.size;
  }
  console.log(`plan: ${outPath}`);
  console.log(`files: ${plan.actions.length}`);
  console.log(`bytes: ${totalSize}`);
  const buckets = Object.keys(counts).sort();
  for (const bucket of buckets) {
    console.log(`${bucket}: ${counts[bucket]}`);
  }

  const otherEntries = Object.entries(plan.otherTypeCounts)
    .sort((a, b) => b[1] - a[1]);
  if (otherEntries.length) {
    console.log("Other types:");
    for (const [ext, count] of otherEntries) {
      console.log(`${ext}: ${count}`);
    }
  }
}

function bucketFromReason(reason: string): string {
  const parts = reason.split(":");
  if (parts.length === 2) {
    return parts[1];
  }
  return reason;
}

function toNumber(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}
