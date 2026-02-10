import { describe, expect, it } from "vitest";
import { classifyPath } from "../src/classify.js";

describe("classifyPath", () => {
  it("uses rule overrides before type buckets", () => {
    const rules = [
      { name: "Invoices", match: "**/*invoice*.pdf", target: "Finance/Invoices", priority: 10 }
    ];
    const result = classifyPath(
      "C:/tmp/invoice-2026.pdf",
      "invoice-2026.pdf",
      rules
    );
    expect(result.target).toBe("Finance/Invoices");
    expect(result.reason).toBe("rule:Invoices");
  });

  it("falls back to Other when no match", () => {
    const result = classifyPath("C:/tmp/file.unknown", "file.unknown", []);
    expect(result.target).toBe("Other");
    expect(result.reason).toBe("fallback:Other");
  });

  it("maps html to Code and yaml to Data", () => {
    const html = classifyPath("C:/tmp/index.html", "index.html", []);
    const yaml = classifyPath("C:/tmp/config.yml", "config.yml", []);
    expect(html.target).toBe("Code");
    expect(yaml.target).toBe("Data");
  });

  it("maps gdoc/gsheet/gscript to expected buckets", () => {
    const gdoc = classifyPath("C:/tmp/doc.gdoc", "doc.gdoc", []);
    const gsheet = classifyPath("C:/tmp/sheet.gsheet", "sheet.gsheet", []);
    const gscript = classifyPath("C:/tmp/script.gscript", "script.gscript", []);
    expect(gdoc.target).toBe("Docs");
    expect(gsheet.target).toBe("Docs");
    expect(gscript.target).toBe("Code");
  });
});
