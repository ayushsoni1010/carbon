import { requirePermissions } from "@carbon/auth/auth.server";
import { useParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import SupplierRiskRegister from "~/modules/purchasing/ui/Supplier/SupplierRiskRegister";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    view: "purchasing",
  });

  return json({});
}

export default function SupplierRisksRoute() {
  const { supplierId } = useParams();
  if (!supplierId) throw new Error("Could not find supplierId");

  return <SupplierRiskRegister supplierId={supplierId} />;
}
