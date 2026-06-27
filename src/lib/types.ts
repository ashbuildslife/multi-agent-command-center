export type AgentStatus = "idle" | "running" | "review_needed" | "halted" | "completed" | "failed";
export type TrustLevel = "auto_approve" | "review_required" | "deny";
export type DriftSeverity = "none" | "low" | "medium" | "high";
export type AuditCategory = "system" | "data_access" | "risk_decision" | "compliance_review";
export type PermissionDecision = "allowed" | "review_required" | "blocked";
export type TaintSource = "trusted_system" | "untrusted_content" | "operator_instruction";

export interface WorkspaceMember {
  id: string;
  name: string;
  role: "admin" | "operator" | "viewer";
  avatarInitials: string;
}

export interface Workspace {
  id: string;
  name: string;
  memberCount: number;
  projectCount: number;
  totalAgentRuns: number;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  activeAgentCount: number;
  totalCost: number;
}

export interface AgentWorker {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  currentTask: string;
  workspaceId: string;
  projectId: string;
  tokensUsed: number;
  estimatedCost: number;
  trustLevel: TrustLevel;
  stateHistory: string[];
  loopDetected: boolean;
  lastStateChange: string;
}

export interface DriftAlert {
  id: string;
  agentAId: string;
  agentAName: string;
  agentBId: string;
  agentBName: string;
  assumption: string;
  aValue: string;
  bValue: string;
  severity: DriftSeverity;
  detectedAt: string;
}

export interface RunArtifact {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  title: string;
  content: string;
  status: "pending_review" | "accepted" | "rejected";
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  agentId: string;
  action: string;
  detail: string;
  category: AuditCategory;
  permissionDecision: PermissionDecision;
  policyId: string;
  decisionReason: string;
  immutableHash: string;
  timestamp: string;
  cost: number;
}

export interface EgressGateReview {
  id: string;
  agentId: string;
  agentName: string;
  requestedAction: string;
  target: string;
  sourceKind: TaintSource;
  taintedFields: string[];
  decision: PermissionDecision;
  policyId: string;
  decisionReason: string;
}

export interface CostSummary {
  totalSpent: number;
  budgetLimit: number;
  percentUsed: number;
  costByAgent: { agentName: string; cost: number }[];
  costByProject: { projectName: string; cost: number }[];
  costByCategory: { category: AuditCategory; cost: number }[];
}

export interface CommandCenterSnapshot {
  workspace: Workspace;
  projects: Project[];
  agents: AgentWorker[];
  driftAlerts: DriftAlert[];
  artifacts: RunArtifact[];
  auditLog: AuditEntry[];
  egressGateReviews: EgressGateReview[];
  costSummary: CostSummary;
}
