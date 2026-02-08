import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyPlan } from "../src/apply.js";
import type { Plan } from "../src/types.js";

describe("applyPlan", () => {
  it("moves files and resolves name collisions", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "inboxzero-"));
    const sourceDir = path.join(tmp, "source");
    const destDir = path.join(tmp, "dest");
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.mkdir(destDir, { recursive: true });

    const sourceFile = path.join(sourceDir, "file.txt");
    const existing = path.join(destDir, "file.txt");
    await fs.writeFile(sourceFile, "from", "utf8");
    await fs.writeFile(existing, "to", "utf8");

    const plan: Plan = {
      version: 1,
      createdAt: new Date().toISOString(),
      roots: [sourceDir],
      destRoots: { [sourceDir]: destDir },
      actions: [
        {
          from: sourceFile,
          to: existing,
          reason: "type:Docs",
          size: 4,
          mtime: new Date().toISOString()
        }
      ]
    };

    await applyPlan(plan);
    const contents = await fs.readdir(destDir);
    expect(contents.some((entry) => entry.startsWith("file (1)"))).toBe(true);
  });
});
