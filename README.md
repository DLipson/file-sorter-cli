# File Sorter CLI

Scan `Downloads` and `Desktop`, generate a plan JSON, and apply moves when you're ready.

Defaults:
- Scans top-level files only (`--max-depth 0`)
- Ignores `node_modules/**`, `.git/**`, and `_Sorted/**`

## Quick Start

```powershell
npm install
npm run scan
npm run apply -- path\to\plan-YYYYMMDD-HHMMSS.json
```

## CLI

```powershell
tsx src/cli.ts scan --out C:\path\plan.json
tsx src/cli.ts apply C:\path\plan.json
```

## Scan Options

```powershell
tsx src/cli.ts scan --max-depth 0
tsx src/cli.ts scan --max-depth 2 --ignore "**/*.map"
```

## Buckets

Type-based buckets include:
- `Images`
- `Docs`
- `Archives`
- `Installers`
- `Audio`
- `Video`
- `Code`
- `Data`
- `Other`

The plan also includes `otherTypeCounts` for file extensions that landed in `Other`.

## Rules File

Default location: `%USERPROFILE%\.inboxzero\rules.json`

Example:
```json
{
  "rules": [
    { "name": "Invoices", "match": "**/*invoice*.pdf", "target": "Finance/Invoices", "priority": 10 }
  ]
}
```
