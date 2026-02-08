import fs from "node:fs/promises";
import path from "node:path";
import type { Plan } from "./types.js";

export async function writePlan(plan: Plan, outputPath: string): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(plan, null, 2), "utf8");
}

export async function readPlan(planPath: string): Promise<Plan> {
  const raw = await fs.readFile(planPath, "utf8");
  const parsed = JSON.parse(raw) as Plan;
  return parsed;
}

export function defaultPlanPath(destRoots: Record<string, string>): string {
  const candidates = Object.values(destRoots);
  const base = candidates[0] ?? process.cwd();
  const stamp = timestamp();
  return path.join(base, `plan-${stamp}.json`);
}

function timestamp(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}
