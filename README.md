# File Sorter CLI

Scan `Downloads` and `Desktop`, generate a plan JSON, and apply moves when you're ready.

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
