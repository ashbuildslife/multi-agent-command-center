import type { AgentWorker, AuditEntry, CostSummary, DriftAlert, EgressGateReview, Project, RunArtifact, Workspace, WorkspaceMember } from "./types";

export const demoWorkspace: Workspace = {
  id: "ws_fintech",
  name: "Fintech Compliance Operations",
  memberCount: 8,
  projectCount: 4,
  totalAgentRuns: 247
};

export const demoMembers: WorkspaceMember[] = [
  { id: "mem_priya", name: "Priya Sharma", role: "admin", avatarInitials: "PS" },
  { id: "mem_marcus", name: "Marcus Webb", role: "operator", avatarInitials: "MW" },
  { id: "mem_elena", name: "Elena Voss", role: "operator", avatarInitials: "EV" },
  { id: "mem_david", name: "David Okonkwo", role: "viewer", avatarInitials: "DO" }
];

export const demoProjects: Project[] = [
  { id: "proj_kyc", workspaceId: "ws_fintech", name: "KYC Document Review", description: "Agent pipeline for identity document verification and risk flagging", activeAgentCount: 3, totalCost: 47.50 },
  { id: "proj_fraud", workspaceId: "ws_fintech", name: "Transaction Fraud Detection", description: "Real-time anomaly detection with explainable flag reasons", activeAgentCount: 2, totalCost: 82.30 },
  { id: "proj_reporting", workspaceId: "ws_fintech", name: "Regulatory Report Generation", description: "Automated MIFID/FinCEN narrative drafting with compliance review", activeAgentCount: 2, totalCost: 31.20 },
  { id: "proj_onboarding", workspaceId: "ws_fintech", name: "Client Onboarding Pipeline", description: "Multi-step KYC/AML checks with human-in-the-loop gates", activeAgentCount: 4, totalCost: 124.80 }
];

export const demoAgents: AgentWorker[] = [
  {
    id: "ag_kyc_doc", name: "DocReview-v2", type: "document_analyzer",
    status: "running", currentTask: "Extracting passport fields from batch #47",
    workspaceId: "ws_fintech", projectId: "proj_kyc",
    tokensUsed: 12450, estimatedCost: 0.37,
    trustLevel: "auto_approve", stateHistory: ["init", "document_loaded", "ocr_running", "fields_extracted", "validating"],
    loopDetected: false, lastStateChange: "2026-06-08T14:32:00Z"
  },
  {
    id: "ag_kyc_risk", name: "RiskScorer-v1", type: "risk_assessor",
    status: "review_needed", currentTask: "Flagged high-risk entity — awaiting operator review",
    workspaceId: "ws_fintech", projectId: "proj_kyc",
    tokensUsed: 8900, estimatedCost: 0.27,
    trustLevel: "review_required", stateHistory: ["init", "entity_lookup", "sanctions_check", "risk_calculated", "flag_raised"],
    loopDetected: false, lastStateChange: "2026-06-08T14:28:00Z"
  },
  {
    id: "ag_kyc_audit", name: "AuditTrail-v1", type: "audit_logger",
    status: "idle", currentTask: "Waiting for new review assignments",
    workspaceId: "ws_fintech", projectId: "proj_kyc",
    tokensUsed: 2100, estimatedCost: 0.06,
    trustLevel: "auto_approve", stateHistory: ["init", "idle"],
    loopDetected: false, lastStateChange: "2026-06-08T14:20:00Z"
  },
  {
    id: "ag_fraud_tx", name: "TxScreener-v3", type: "transaction_analyzer",
    status: "running", currentTask: "Analyzing 2,847 transactions from last hour",
    workspaceId: "ws_fintech", projectId: "proj_fraud",
    tokensUsed: 45600, estimatedCost: 1.37,
    trustLevel: "auto_approve", stateHistory: ["init", "batch_loaded", "anomaly_scan", "pattern_matching", "risk_scoring"],
    loopDetected: false, lastStateChange: "2026-06-08T14:35:00Z"
  },
  {
    id: "ag_fraud_explain", name: "ExplainGen-v2", type: "explanation_generator",
    status: "halted", currentTask: "Loop detected — agent revisiting same state",
    workspaceId: "ws_fintech", projectId: "proj_fraud",
    tokensUsed: 31200, estimatedCost: 0.94,
    trustLevel: "review_required", stateHistory: ["init", "explain_attempt_1", "explain_attempt_2", "explain_attempt_3", "explain_attempt_3", "explain_attempt_3"],
    loopDetected: true, lastStateChange: "2026-06-08T14:30:00Z"
  },
  {
    id: "ag_reg_draft", name: "RegDraft-v1", type: "report_generator",
    status: "completed", currentTask: "MIFID quarterly narrative — draft complete",
    workspaceId: "ws_fintech", projectId: "proj_reporting",
    tokensUsed: 18900, estimatedCost: 0.57,
    trustLevel: "review_required", stateHistory: ["init", "data_collected", "template_loaded", "narrative_generated", "review_ready"],
    loopDetected: false, lastStateChange: "2026-06-08T14:15:00Z"
  },
  {
    id: "ag_reg_format", name: "FormatCheck-v1", type: "format_validator",
    status: "completed", currentTask: "Format validation passed — 0 errors",
    workspaceId: "ws_fintech", projectId: "proj_reporting",
    tokensUsed: 3400, estimatedCost: 0.10,
    trustLevel: "auto_approve", stateHistory: ["init", "schema_loaded", "validation_run", "passed"],
    loopDetected: false, lastStateChange: "2026-06-08T14:18:00Z"
  },
  {
    id: "ag_onb_collect", name: "DataCollect-v3", type: "data_collector",
    status: "running", currentTask: "Collecting incorporation docs for 12 new entities",
    workspaceId: "ws_fintech", projectId: "proj_onboarding",
    tokensUsed: 27800, estimatedCost: 0.83,
    trustLevel: "auto_approve", stateHistory: ["init", "registry_query", "doc_fetch", "ocr"],
    loopDetected: false, lastStateChange: "2026-06-08T14:33:00Z"
  },
  {
    id: "ag_onb_verify", name: "VerifyChain-v2", type: "verification_chain",
    status: "failed", currentTask: "Failed: upstream registry API timeout after 3 retries",
    workspaceId: "ws_fintech", projectId: "proj_onboarding",
    tokensUsed: 6200, estimatedCost: 0.19,
    trustLevel: "review_required", stateHistory: ["init", "api_call", "retry_1", "retry_2", "retry_3", "failed"],
    loopDetected: false, lastStateChange: "2026-06-08T14:10:00Z"
  },
  {
    id: "ag_onb_risk", name: "RiskEval-v4", type: "risk_evaluator",
    status: "idle", currentTask: "Awaiting verified entity data",
    workspaceId: "ws_fintech", projectId: "proj_onboarding",
    tokensUsed: 400, estimatedCost: 0.01,
    trustLevel: "review_required", stateHistory: ["init", "idle"],
    loopDetected: false, lastStateChange: "2026-06-08T14:05:00Z"
  }
];

export const demoDriftAlerts: DriftAlert[] = [
  {
    id: "drift_001",
    agentAId: "ag_kyc_doc", agentAName: "DocReview-v2",
    agentBId: "ag_onb_collect", agentBName: "DataCollect-v3",
    assumption: "Entity jurisdiction classification",
    aValue: "Singapore (ACRA registry)", bValue: "Singapore (MAS register)",
    severity: "medium", detectedAt: "2026-06-08T14:25:00Z"
  },
  {
    id: "drift_002",
    agentAId: "ag_fraud_tx", agentAName: "TxScreener-v3",
    agentBId: "ag_fraud_explain", agentBName: "ExplainGen-v2",
    assumption: "Transaction risk threshold for PEP flagging",
    aValue: "$10,000 single-transaction threshold", bValue: "$5,000 cumulative-7-day threshold",
    severity: "high", detectedAt: "2026-06-08T14:32:00Z"
  }
];

export const demoArtifacts: RunArtifact[] = [
  {
    id: "art_001", agentId: "ag_reg_draft", agentName: "RegDraft-v1",
    type: "report", title: "Q2 2026 MIFID Transaction Report — Draft",
    content: "This report covers 3,412 transactions across 847 client accounts for the period April–June 2026. Key findings: 12 reportable transactions under Article 26, 3 best-execution deviations (within tolerance), and 0 suspicious activity flags requiring escalation.",
    status: "pending_review", createdAt: "2026-06-08T14:15:00Z"
  },
  {
    id: "art_002", agentId: "ag_kyc_risk", agentName: "RiskScorer-v1",
    type: "risk_flag", title: "High-Risk Entity: GreenField Holdings Ltd",
    content: "Sanctions screening returned potential match against OFAC SDN list (confidence: 87%). Entity registered in Mauritius with beneficial ownership chain that terminates in a jurisdiction flagged by FATF as high-risk. Three associated accounts show transaction patterns inconsistent with stated business activity.",
    status: "pending_review", createdAt: "2026-06-08T14:28:00Z"
  },
  {
    id: "art_003", agentId: "ag_fraud_explain", agentName: "ExplainGen-v2",
    type: "explanation", title: "Fraud Case #TX-2847 Explanation — Stale",
    content: "This explanation was generated by an agent that subsequently entered a loop. The agent revisited the same state 3+ times and was auto-halted. This artifact should be reviewed before any downstream action is taken.",
    status: "pending_review", createdAt: "2026-06-08T14:29:00Z"
  }
];

export const demoAuditLog: AuditEntry[] = [
  { id: "aud_001", agentId: "ag_kyc_doc", action: "batch_processed", detail: "Batch #47: 50 passports processed, 48 valid, 2 flagged for manual review", category: "data_access", permissionDecision: "allowed", policyId: "POL-DATA-MIN-001", decisionReason: "Allowed because the batch stayed inside the passport extraction scope and flagged exceptions for review", immutableHash: "sha256:9e1c2d0a-aud-001", timestamp: "2026-06-08T14:32:00Z", cost: 0.37 },
  { id: "aud_002", agentId: "ag_kyc_risk", action: "risk_flag_raised", detail: "Entity GreenField Holdings flagged as high-risk (87% sanctions match confidence)", category: "risk_decision", permissionDecision: "review_required", policyId: "POL-RISK-HITL-002", decisionReason: "Required review because sanctions confidence exceeded the high-risk entity threshold", immutableHash: "sha256:9e1c2d0a-aud-002", timestamp: "2026-06-08T14:28:00Z", cost: 0.27 },
  { id: "aud_003", agentId: "ag_fraud_tx", action: "anomaly_detected", detail: "Transaction #TX-2847: $47,200 outbound to new beneficiary, 14x account average", category: "risk_decision", permissionDecision: "review_required", policyId: "POL-ANOMALY-HITL-003", decisionReason: "Required review because a new-beneficiary transfer exceeded behavioral and velocity thresholds", immutableHash: "sha256:9e1c2d0a-aud-003", timestamp: "2026-06-08T14:35:00Z", cost: 0.08 },
  { id: "aud_004", agentId: "ag_fraud_explain", action: "loop_halted", detail: "Agent auto-halted after revisiting explain_attempt_3 state 3 times", category: "system", permissionDecision: "blocked", policyId: "POL-RUNTIME-LOOP-004", decisionReason: "Blocked because repeated state revisits indicate a loop and downstream explanations may be stale", immutableHash: "sha256:9e1c2d0a-aud-004", timestamp: "2026-06-08T14:30:00Z", cost: 0.94 },
  { id: "aud_005", agentId: "ag_reg_draft", action: "draft_completed", detail: "Q2 MIFID narrative draft ready for compliance review", category: "compliance_review", permissionDecision: "review_required", policyId: "POL-REG-REVIEW-005", decisionReason: "Required review because externally reportable regulatory narratives need compliance signoff", immutableHash: "sha256:9e1c2d0a-aud-005", timestamp: "2026-06-08T14:15:00Z", cost: 0.57 },
  { id: "aud_006", agentId: "ag_onb_verify", action: "api_timeout", detail: "Registry API timeout after 3 retries (30s each). Affected: 12 entity verifications.", category: "system", permissionDecision: "blocked", policyId: "POL-RESILIENCE-RETRY-006", decisionReason: "Blocked because registry evidence could not be refreshed after the retry budget was exhausted", immutableHash: "sha256:9e1c2d0a-aud-006", timestamp: "2026-06-08T14:10:00Z", cost: 0.19 },
  { id: "aud_007", agentId: "ag_onb_collect", action: "docs_fetched", detail: "12 incorporation documents retrieved from ACRA", category: "data_access", permissionDecision: "allowed", policyId: "POL-DATA-SOURCE-007", decisionReason: "Allowed because the request used an approved registry source and only pulled onboarding evidence", immutableHash: "sha256:9e1c2d0a-aud-007", timestamp: "2026-06-08T14:33:00Z", cost: 0.83 },
  { id: "aud_008", agentId: "ag_reg_format", action: "validation_passed", detail: "MIFID format validation: 0 errors, 3 warnings (non-blocking)", category: "compliance_review", permissionDecision: "allowed", policyId: "POL-FORMAT-VALID-008", decisionReason: "Allowed because the validator only checked schema format and did not approve report content", immutableHash: "sha256:9e1c2d0a-aud-008", timestamp: "2026-06-08T14:18:00Z", cost: 0.10 }
];

export const demoEgressGateReviews: EgressGateReview[] = [
  {
    id: "eg_001",
    agentId: "ag_fraud_explain",
    agentName: "ExplainGen-v2",
    requestedAction: "Post fraud-case explanation to external case-management webhook",
    target: "https://case-sync.example.com/fraud/TX-2847",
    sourceKind: "untrusted_content",
    taintedFields: ["webhook_url", "beneficiary_name"],
    decision: "blocked",
    policyId: "POL-EGRESS-TAINT-009",
    decisionReason: "Blocked because external target and beneficiary context were derived from untrusted transaction notes, preventing prompt-injection exfiltration"
  },
  {
    id: "eg_002",
    agentId: "ag_reg_draft",
    agentName: "RegDraft-v1",
    requestedAction: "Submit MIFID narrative to regulator portal",
    target: "FCA transaction-reporting portal",
    sourceKind: "operator_instruction",
    taintedFields: ["narrative_body"],
    decision: "review_required",
    policyId: "POL-EGRESS-REVIEW-010",
    decisionReason: "Required compliance review because a generated regulatory filing leaves the workspace and may carry model-derived assertions"
  },
  {
    id: "eg_003",
    agentId: "ag_kyc_audit",
    agentName: "AuditTrail-v1",
    requestedAction: "Write audit hash to internal evidence ledger",
    target: "internal://evidence-ledger/audit-hashes",
    sourceKind: "trusted_system",
    taintedFields: [],
    decision: "allowed",
    policyId: "POL-EGRESS-INTERNAL-011",
    decisionReason: "Allowed because the target is internal-only and all fields come from signed system events rather than untrusted content"
  },
  {
    id: "eg_004",
    agentId: "ag_onb_collect",
    agentName: "DataCollect-v3",
    requestedAction: "Upload full KYC evidence packet to vendor URL embedded in an onboarding PDF",
    target: "https://vendor-review.example.net/upload?client=greenfield",
    sourceKind: "untrusted_content",
    taintedFields: ["uploaded_pdf_instructions", "external_upload_url", "kyc_evidence_packet"],
    decision: "blocked",
    policyId: "POL-EGRESS-PII-012",
    decisionReason: "Blocked because an untrusted onboarding document supplied the external upload destination while the payload contained customer KYC evidence, preventing prompt-injection-driven data exfiltration"
  }
];

export const demoCostSummary: CostSummary = {
  totalSpent: 285.80,
  budgetLimit: 500.00,
  percentUsed: 57,
  costByAgent: [
    { agentName: "DocReview-v2", cost: 47.50 },
    { agentName: "TxScreener-v3", cost: 82.30 },
    { agentName: "ExplainGen-v2", cost: 45.20 },
    { agentName: "DataCollect-v3", cost: 38.10 },
    { agentName: "RegDraft-v1", cost: 31.20 },
    { agentName: "RiskScorer-v1", cost: 18.40 },
    { agentName: "VerifyChain-v2", cost: 12.30 },
    { agentName: "FormatCheck-v1", cost: 5.40 },
    { agentName: "AuditTrail-v1", cost: 3.20 },
    { agentName: "RiskEval-v4", cost: 2.20 }
  ],
  costByProject: [
    { projectName: "Client Onboarding Pipeline", cost: 124.80 },
    { projectName: "Transaction Fraud Detection", cost: 82.30 },
    { projectName: "KYC Document Review", cost: 47.50 },
    { projectName: "Regulatory Report Generation", cost: 31.20 }
  ],
  costByCategory: [
    { category: "data_access", cost: 1.20 },
    { category: "risk_decision", cost: 0.35 },
    { category: "compliance_review", cost: 0.67 },
    { category: "system", cost: 1.13 }
  ]
};
