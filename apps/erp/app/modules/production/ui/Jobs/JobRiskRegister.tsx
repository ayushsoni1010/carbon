import RiskRegisterCard from "~/modules/quality/ui/RiskRegister/RiskRegisterCard";

type JobRiskRegisterProps = {
  jobId: string;
};

export default function JobRiskRegister({ jobId }: JobRiskRegisterProps) {
  return <RiskRegisterCard sourceId={jobId} source="Job" />;
}
