import { describe, it, expect } from "vitest";
import { demoAgents, demoDriftAlerts, demoCostSummary, demoArtifacts } from "@/lib/demo-data";

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
});

describe("artifact review", () => {
  it("has pending review artifacts", () => {
    const pending = demoArtifacts.filter(a => a.status === "pending_review");
    expect(pending.length).toBeGreaterThan(0);
  });
});
