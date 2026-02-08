import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildPlan } from "../src/scan.js";

describe("buildPlan", () => {
  it("places Desktop files under Desktop/_Sorted", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "inboxzero-"));
    const downloads = path.join(tmp, "Downloads");
    const desktop = path.join(tmp, "Desktop");
    await fs.mkdir(downloads, { recursive: true });
    await fs.mkdir(desktop, { recursive: true });
    const desktopFile = path.join(desktop, "note.txt");
    await fs.writeFile(desktopFile, "hello", "utf8");

    const roots = [downloads, desktop];
    const destRoots = {
      [downloads]: path.join(downloads, "_Sorted"),
      [desktop]: path.join(desktop, "_Sorted")
    };

    const plan = await buildPlan(roots, destRoots, [], { includeHidden: false, ignore: [] });
    expect(plan.actions.length).toBe(1);
    expect(plan.actions[0].to).toBe(path.join(desktop, "_Sorted", "Docs", "note.txt"));
  });

  it("skips _Sorted directories", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "inboxzero-"));
    const downloads = path.join(tmp, "Downloads");
    const sorted = path.join(downloads, "_Sorted");
    await fs.mkdir(sorted, { recursive: true });
    await fs.writeFile(path.join(sorted, "skip.txt"), "skip", "utf8");

    const plan = await buildPlan(
      [downloads],
      { [downloads]: sorted },
      [],
      { includeHidden: false, ignore: [] }
    );
    expect(plan.actions.length).toBe(0);
  });
});
