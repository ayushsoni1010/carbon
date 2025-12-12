import { requirePermissions } from "@carbon/auth/auth.server";
import { useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import CustomerRiskRegister from "~/modules/sales/ui/Customer/CustomerRiskRegister";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    view: "sales",
  });

  return json({});
}

export default function CustomerRisksRoute() {
  const { customerId } = useParams();
  if (!customerId) throw new Error("Could not find customerId");

  return <CustomerRiskRegister customerId={customerId} />;
}
