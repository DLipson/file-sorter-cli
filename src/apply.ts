import fs from "node:fs/promises";
import path from "node:path";
import type { Plan, PlanAction } from "./types.js";

export async function applyPlan(plan: Plan): Promise<void> {
  for (const action of plan.actions) {
    await applyAction(action);
  }
}

async function applyAction(action: PlanAction): Promise<void> {
  const from = action.from;
  const to = action.to;
  const exists = await fileExists(from);
  if (!exists) {
    console.warn(`skip missing: ${from}`);
    return;
  }

  const destination = await uniqueDestination(to);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await moveFile(from, destination);
}

async function moveFile(from: string, to: string): Promise<void> {
  try {
    await fs.rename(from, to);
  } catch (err: unknown) {
    if (isExdev(err)) {
      await fs.copyFile(from, to);
      await fs.unlink(from);
      return;
    }
    throw err;
  }
}

async function uniqueDestination(target: string): Promise<string> {
  if (!(await fileExists(target))) {
    return target;
  }

  const parsed = path.parse(target);
  for (let i = 1; i < 10000; i += 1) {
    const candidate = path.join(parsed.dir, `${parsed.name} (${i})${parsed.ext}`);
    if (!(await fileExists(candidate))) {
      return candidate;
    }
  }

  throw new Error(`Unable to find unique filename for ${target}`);
}

async function fileExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function isExdev(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "EXDEV"
  );
}
