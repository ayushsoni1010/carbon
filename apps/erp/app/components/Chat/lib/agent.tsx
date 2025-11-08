import { agentConfigs } from "~/routes/api+/ai+/chat+/agents/config";
import type { AgentStatus } from "./types";

// Generate user-friendly status messages
export const getStatusMessage = (status?: AgentStatus | null) => {
  if (!status) {
    return null;
  }

  const { agent, status: state } = status;

  if (state === "routing") {
    return "Thinking...";
  }

  if (state === "executing") {
    const agentConfig = agentConfigs[agent];
    return agentConfig?.executingMessage || "Processing...";
  }

  return null;
};
