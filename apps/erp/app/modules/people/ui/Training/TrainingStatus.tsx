import { Badge } from "@carbon/react";
import type { trainingStatus } from "~/modules/people";

type TrainingStatusProps = {
  status: (typeof trainingStatus)[number] | null;
};

export default function TrainingStatus({ status }: TrainingStatusProps) {
  switch (status) {
    case "Draft":
      return <Badge variant="secondary">Draft</Badge>;
    case "Active":
      return <Badge variant="green">Active</Badge>;
    case "Archived":
      return <Badge variant="outline">Archived</Badge>;
    default:
      return null;
  }
}
