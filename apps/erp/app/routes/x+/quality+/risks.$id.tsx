import { requirePermissions } from "@carbon/auth/auth.server";
import { useNavigate, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { riskRegisterValidator } from "~/modules/quality/quality.models";
import { upsertRisk, getRisk } from "~/modules/quality/quality.service";
import RiskRegisterForm from "~/modules/quality/ui/RiskRegister/RiskRegisterForm";
import { path } from "~/utils/path";
import { validationError, validator } from "@carbon/form";
import invariant from "tiny-invariant";
import { useDisclosure } from "@carbon/react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { client } = await requirePermissions(request, {
    view: "quality",
    role: "employee",
  });
  const { id } = params;
  invariant(id, "id is required");

  const risk = await getRisk(client, id);
  if (risk.error || !risk.data) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ risk: risk.data });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client, userId, companyId } = await requirePermissions(request, {
    update: "quality",
    role: "employee",
  });

  const formData = await request.formData();
  const validation = await validator(riskRegisterValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const result = await upsertRisk(client, {
    ...validation.data,
    id: validation.data.id!,
    companyId,
    updatedBy: userId,
  });

  if (result.error) {
    return json(
      {
        data: null,
        error: result.error,
        success: false,
      },
      { status: 500 }
    );
  }

  return json({
    data: result.data,
    success: true,
    error: null,
  });
};

export default function EditRiskRoute() {
  const { risk } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const formDisclosure = useDisclosure({
    defaultIsOpen: true,
  });
  const onClose = () => {
    formDisclosure.onClose();
    navigate(path.to.risks);
  };

  return (
    <RiskRegisterForm
      open={formDisclosure.isOpen}
      initialValues={{
        ...risk,
        description: risk.description ?? undefined,
        assigneeUserId: risk.assigneeUserId ?? undefined,
        sourceId: risk.sourceId ?? undefined,
        status: risk.status ?? undefined,
        title: risk.title ?? undefined,
        likelihood: risk.likelihood ?? undefined,
        severity: risk.severity ?? undefined,
      }}
      onClose={onClose}
    />
  );
}
