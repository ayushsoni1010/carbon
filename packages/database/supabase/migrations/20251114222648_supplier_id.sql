CREATE TYPE "disposition" AS ENUM (
  'Conditional Acceptance',
  'Deviation Accepted',
  'Hold',
  'No Action Required',
  'Pending',
  'Quarantine',
  'Repair',
  'Return to Supplier',
  'Rework',
  'Scrap',
  'Use As Is'
);

ALTER TABLE public."nonConformanceActionTask"
ADD COLUMN "supplierId" text NULL;

ALTER TABLE public."nonConformanceActionTask"
ADD CONSTRAINT "nonConformanceActionTask_supplierId_fkey"
FOREIGN KEY ("supplierId")
REFERENCES supplier (id)
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "nonConformanceActionTask_supplierId_idx"
ON public."nonConformanceActionTask" ("supplierId");

ALTER TABLE public."nonConformanceInvestigationTask"
ADD COLUMN "supplierId" text NULL;

ALTER TABLE public."nonConformanceInvestigationTask"
ADD CONSTRAINT "nonConformanceInvestigationTask_supplierId_fkey"
FOREIGN KEY ("supplierId")
REFERENCES supplier (id)
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "nonConformanceInvestigationTask_supplierId_idx"
ON public."nonConformanceInvestigationTask" ("supplierId");

ALTER TABLE public."nonConformanceItem"
ADD COLUMN "disposition" "disposition" DEFAULT 'Pending';

ALTER TYPE "externalLinkDocumentType" ADD VALUE IF NOT EXISTS 'Non-Conformance';

-- Create trigger function to auto-create external link for non-conformance suppliers
CREATE OR REPLACE FUNCTION create_non_conformance_external_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into externalLink table
  INSERT INTO "externalLink" ("documentType", "documentId", "companyId")
  VALUES ('Non-Conformance', NEW."nonConformanceId", NEW."companyId")
  ON CONFLICT ("documentId", "documentType", "companyId") DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on nonConformanceSupplier table
CREATE TRIGGER create_non_conformance_external_link_trigger
AFTER INSERT ON "nonConformanceSupplier"
FOR EACH ROW
EXECUTE FUNCTION create_non_conformance_external_link();