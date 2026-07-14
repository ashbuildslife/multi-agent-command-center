import { describe, it, expect } from "vitest";
import { demoAgents, demoDriftAlerts, demoCostSummary, demoArtifacts, demoAuditLog, demoEgressGateReviews } from "@/lib/demo-data";

describe("agent observability", () => {
  it("has 10 agent workers", () => {
    expect(demoAgents).toHaveLength(10);
  });

  it("every agent has a project", () => {
    for (const agent of demoAgents) {
      expect(agent.projectId).toBeTruthy();
    }
  });

  it("halted agents have loopDetected=true or status=halted", () => {
    const halted = demoAgents.filter(a => a.loopDetected || a.status === "halted");
    expect(halted.length).toBeGreaterThan(0);
    for (const agent of halted) {
      expect(agent.loopDetected || agent.status === "halted").toBe(true);
    }
  });
});

describe("drift detection", () => {
  it("has at least one high-severity drift", () => {
    const high = demoDriftAlerts.filter(d => d.severity === "high");
    expect(high.length).toBeGreaterThanOrEqual(1);
  });

  it("each drift has two different agents", () => {
    for (const drift of demoDriftAlerts) {
      expect(drift.agentAId).not.toBe(drift.agentBId);
    }
  });
});

describe("cost tracking", () => {
  it("total does not exceed budget", () => {
    expect(demoCostSummary.totalSpent).toBeLessThanOrEqual(demoCostSummary.budgetLimit);
  });

  it("percent matches calculation", () => {
    const expected = Math.round((demoCostSummary.totalSpent / demoCostSummary.budgetLimit) * 100);
    expect(demoCostSummary.percentUsed).toBe(expected);
  });

  it("provides category-level cost attribution from the audit log", () => {
    const actualByCategory = new Map<string, number>();
    for (const entry of demoAuditLog) {
      const prev = actualByCategory.get(entry.category) ?? 0;
      actualByCategory.set(entry.category, prev + entry.cost);
    }

    for (const bucket of demoCostSummary.costByCategory) {
      expect(bucket.cost).toBeGreaterThan(0);
      expect(Math.abs(bucket.cost - (actualByCategory.get(bucket.category) ?? 0))).toBeLessThan(0.02);
    }
  });

  it("covers every audit category present in the log", () => {
    const loggedCategories = new Set(demoAuditLog.map(e => e.category));
    const summaryCategories = new Set(demoCostSummary.costByCategory.map(b => b.category));
    expect(summaryCategories).toEqual(loggedCategories);
  });
});

describe("artifact review", () => {
  it("has pending review artifacts", () => {
    const pending = demoArtifacts.filter(a => a.status === "pending_review");
    expect(pending.length).toBeGreaterThan(0);
  });
});

describe("egress gate", () => {
  it("blocks external actions tainted by untrusted content", () => {
    const untrustedExternalActions = demoEgressGateReviews.filter(
      review => review.sourceKind === "untrusted_content" && !review.target.startsWith("internal://")
    );

    expect(untrustedExternalActions.length).toBeGreaterThan(0);
    for (const review of untrustedExternalActions) {
      expect(review.decision).toBe("blocked");
      expect(review.taintedFields.length).toBeGreaterThan(0);
    }
  });

  it("binds every egress decision to the agent authorization scope", () => {
    const outOfScope = demoEgressGateReviews.filter(review => review.authorizationState === "out_of_scope");
    const humanReview = demoEgressGateReviews.filter(review => review.authorizationState === "human_review_required");

    expect(outOfScope.length).toBeGreaterThan(0);
    expect(humanReview.length).toBeGreaterThan(0);
    expect(outOfScope.every(review => review.decision === "blocked")).toBe(true);
    expect(humanReview.every(review => review.decision === "review_required")).toBe(true);
  });

  it("documents a policy and rationale for every egress decision", () => {
    for (const review of demoEgressGateReviews) {
      expect(review.policyId).toMatch(/^POL-EGRESS-/);
      expect(review.decisionReason.length).toBeGreaterThan(80);
    }
  });

  it("blocks lethal-trifecta egress before private data leaves through untrusted external channels", () => {
    const lethalTrifecta = demoEgressGateReviews.filter(
      review =>
        review.riskFactors.includes("private_data_access") &&
        review.riskFactors.includes("untrusted_content") &&
        review.riskFactors.includes("external_communication")
    );

    expect(lethalTrifecta.length).toBeGreaterThan(0);
    for (const review of lethalTrifecta) {
      expect(review.sourceKind).toBe("untrusted_content");
      expect(review.target).not.toMatch(/^internal:\/\//);
      expect(review.decision).toBe("blocked");
      expect(review.decisionReason.toLowerCase()).toContain("exfiltration");
    }
  });

  it("blocks untrusted documents from selecting external targets for customer evidence packets", () => {
    const evidencePacketAttempts = demoEgressGateReviews.filter(
      review =>
        review.sourceKind === "untrusted_content" &&
        review.taintedFields.includes("kyc_evidence_packet") &&
        review.taintedFields.includes("external_upload_url")
    );

    expect(evidencePacketAttempts.length).toBeGreaterThan(0);
    for (const review of evidencePacketAttempts) {
      expect(review.target).not.toMatch(/^internal:\/\//);
      expect(review.decision).toBe("blocked");
      expect(review.decisionReason).toContain("data exfiltration");
    }
  });

  it("blocks third-party API responses from authorizing sensitive exports", () => {
    const apiResponseExports = demoEgressGateReviews.filter(
      review =>
        review.sourceKind === "untrusted_content" &&
        review.taintedFields.includes("api_response_webhook_url")
    );

    expect(apiResponseExports.length).toBeGreaterThan(0);
    for (const review of apiResponseExports) {
      expect(review.target).not.toMatch(/^internal:\/\//);
      expect(review.decision).toBe("blocked");
      expect(review.taintedFields).toEqual(expect.arrayContaining(["customer_risk_scores"]));
      expect(review.decisionReason.toLowerCase()).toContain("tool abuse");
      expect(review.decisionReason.toLowerCase()).toContain("data exfiltration");
    }
  });

  it("blocks external image rendering from leaking telemetry through URL parameters", () => {
    const externalRenders = demoEgressGateReviews.filter(review =>
      review.taintedFields.includes("external_image_url")
    );

    expect(externalRenders.length).toBeGreaterThan(0);
    for (const review of externalRenders) {
      expect(review.sourceKind).toBe("untrusted_content");
      expect(review.target).not.toMatch(/^internal:\/\//);
      expect(review.taintedFields).toEqual(expect.arrayContaining(["url_query_parameter", "account_telemetry"]));
      expect(review.authorizationState).toBe("out_of_scope");
      expect(review.decision).toBe("blocked");
      expect(review.decisionReason.toLowerCase()).toContain("image rendering");
      expect(review.decisionReason.toLowerCase()).toContain("data exfiltration");
    }
  });
});


describe("permissioned audit trail", () => {
  it("records immutable hashes for every audit event", () => {
    for (const entry of demoAuditLog) {
      expect(entry.immutableHash).toMatch(/^sha256:/);
    }
  });

  it("ties every permission decision to an auditable policy and rationale", () => {
    for (const entry of demoAuditLog) {
      expect(entry.policyId).toMatch(/^POL-/);
      expect(entry.decisionReason.length).toBeGreaterThan(40);
    }
  });

  it("routes risk and compliance decisions through explicit review gates", () => {
    const gated = demoAuditLog.filter(entry => ["risk_decision", "compliance_review"].includes(entry.category));

    expect(gated.length).toBeGreaterThan(0);
    expect(gated.some(entry => entry.permissionDecision === "review_required")).toBe(true);
  });

  it("blocks system events when agents loop or upstream systems fail", () => {
    const blockedSystemEvents = demoAuditLog.filter(entry => entry.category === "system" && entry.permissionDecision === "blocked");

    expect(blockedSystemEvents.map(entry => entry.action)).toEqual(expect.arrayContaining(["loop_halted", "api_timeout"]));
  });

  it("never auto-approves material regulatory actions — risk flags, compliance drafts, and anomaly reports always route through review", () => {
    const materialRegulatoryActions = demoAuditLog.filter(
      entry =>
        entry.category === "risk_decision" ||
        (entry.category === "compliance_review" && entry.action !== "validation_passed")
    );

    expect(materialRegulatoryActions.length).toBeGreaterThan(0);
    for (const entry of materialRegulatoryActions) {
      expect(entry.permissionDecision).not.toBe("allowed");
    }
  });
});
