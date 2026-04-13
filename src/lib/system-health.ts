export type ModuleHealth = "healthy" | "warning" | "offline";
export type LinkHealth = "healthy" | "warning" | "broken";

export type SystemSubmodule = {
  id: string;
  name: string;
  health: ModuleHealth;
  detail?: string;
};

export type SystemModuleNode = {
  id: string;
  title: string;
  stack: string;
  description: string;
  health: ModuleHealth;
  position: { x: number; y: number };
  submodules: SystemSubmodule[];
  details?: Record<string, unknown>;
};

export type SystemLinkEdge = {
  id: string;
  source: string;
  target: string;
  health: LinkHealth;
  note: string;
};

export type SystemHealthSnapshot = {
  generatedAt: string;
  nodes: SystemModuleNode[];
  edges: SystemLinkEdge[];
};

export type SystemLogLevel = "INFO" | "WARNING" | "ERROR";

export type SystemModuleLogEntry = {
  timestamp: string;
  level: SystemLogLevel;
  message: string;
  source: string;
};

export type SystemModuleLogs = {
  moduleId: string;
  title: string;
  health: ModuleHealth;
  logs: SystemModuleLogEntry[];
};

export type SystemLogsSnapshot = {
  generatedAt: string;
  modules: SystemModuleLogs[];
};
