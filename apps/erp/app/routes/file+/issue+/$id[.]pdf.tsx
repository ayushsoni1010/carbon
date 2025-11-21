import { requirePermissions } from "@carbon/auth/auth.server";
import { IssuePDF } from "@carbon/documents/pdf";
import { renderToStream } from "@react-pdf/renderer";
import { type LoaderFunctionArgs } from "@vercel/remix";
import {
  getIssue,
  getIssueActionTasks,
  getIssueApprovalTasks,
  getIssueItems,
  getIssueReviewers,
  getIssueTypes,
  getRequiredActionsList,
} from "~/modules/quality";
import { getCompany } from "~/modules/settings";
import { getLocale } from "~/utils/request";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "quality",
  });

  const { id } = params;
  if (!id) throw new Error("Could not find issue id");

  const [
    company,
    nonConformance,
    nonConformanceTypes,
    actionTasks,
    approvalTasks,
    reviewers,
    requiredActions,
    items,
  ] = await Promise.all([
    getCompany(client, companyId),
    getIssue(client, id),
    getIssueTypes(client, companyId),
    getIssueActionTasks(client, id, companyId),
    getIssueApprovalTasks(client, id, companyId),
    getIssueReviewers(client, id, companyId),
    getRequiredActionsList(client, companyId),
    getIssueItems(client, id, companyId),
  ]);

  if (company.error) {
    console.error(company.error);
  }

  if (nonConformance.error) {
    console.error(nonConformance.error);
  }

  if (nonConformanceTypes.error) {
    console.error(nonConformanceTypes.error);
  }

  if (actionTasks.error) {
    console.error(actionTasks.error);
  }

  if (approvalTasks.error) {
    console.error(approvalTasks.error);
  }

  if (items.error) {
    console.error(items.error);
  }

  if (
    company.error ||
    nonConformance.error ||
    nonConformanceTypes.error ||
    actionTasks.error ||
    approvalTasks.error ||
    items.error
  ) {
    throw new Error("Failed to load issue");
  }

  const locale = getLocale(request);

  const stream = await renderToStream(
    <IssuePDF
      company={company.data}
      locale={locale}
      nonConformance={nonConformance.data}
      nonConformanceTypes={nonConformanceTypes.data ?? []}
      actionTasks={actionTasks.data ?? []}
      requiredActions={requiredActions.data ?? []}
      reviewers={reviewers.data ?? []}
      items={items.data ?? []}
    />
  );

  const body: Buffer = await new Promise((resolve, reject) => {
    const buffers: Uint8Array[] = [];
    stream.on("data", (data) => {
      buffers.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    stream.on("error", reject);
  });

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${nonConformance.data.nonConformanceId}.pdf"`,
  });
  return new Response(body, { status: 200, headers });
}
