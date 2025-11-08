import type { IconType } from "react-icons";

export interface ToolConfig {
  name: string;
  icon: IconType;
  displayText: string;
  message: string;
}

export interface AgentConfig {
  name: string;
  displayName: string;
  description: string;
  executingMessage: string;
}
