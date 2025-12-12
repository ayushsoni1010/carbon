import RiskRegisterCard from "~/modules/quality/ui/RiskRegister/RiskRegisterCard";

type QuoteLineRiskRegisterProps = {
  quoteLineId: string;
};

export default function QuoteLineRiskRegister({
  quoteLineId,
}: QuoteLineRiskRegisterProps) {
  return <RiskRegisterCard sourceId={quoteLineId} source="Quote Line" />;
}
