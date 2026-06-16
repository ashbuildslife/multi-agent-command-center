import { describe, it, expect } from "vitest";
import { demoAgents, demoDriftAlerts, demoCostSummary, demoArtifacts, demoAuditLog } from "@/lib/demo-data";

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

describe("permissioned audit trail", () => {
  it("records immutable hashes for every audit event", () => {
    for (const entry of demoAuditLog) {
      expect(entry.immutableHash).toMatch(/^sha256:/);
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
});
