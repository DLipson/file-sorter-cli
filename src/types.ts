export type PlanAction = {
  from: string;
  to: string;
  reason: string;
  size: number;
  mtime: string;
};

export type Plan = {
  version: 1;
  createdAt: string;
  roots: string[];
  destRoots: Record<string, string>;
  actions: PlanAction[];
  otherTypeCounts: Record<string, number>;
};

export type Rule = {
  name: string;
  match: string;
  target: string;
  priority?: number;
};

export type RulesFile = {
  rules: Rule[];
};

export type ScanOptions = {
  includeHidden: boolean;
  ignore: string[];
};
