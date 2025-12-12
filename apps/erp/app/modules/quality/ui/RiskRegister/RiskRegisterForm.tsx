import { ValidatedForm } from "@carbon/form";
import {
  Button,
  HStack,
  ModalDrawer,
  ModalDrawerBody,
  ModalDrawerContent,
  ModalDrawerFooter,
  ModalDrawerHeader,
  ModalDrawerProvider,
  ModalDrawerTitle,
  VStack,
  toast,
  useDisclosure,
} from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import type { PostgrestResponse } from "@supabase/supabase-js";
import { useEffect } from "react";
import type { z } from "zod/v3";
import {
  Employee,
  Hidden,
  Input,
  Select,
  Submit,
  TextArea,
  Number as NumberInput,
} from "~/components/Form";
import { Confirm } from "~/components/Modals";
import { usePermissions } from "~/hooks";
import {
  riskRegisterValidator,
  riskStatus,
} from "~/modules/quality/quality.models";
import { path } from "~/utils/path";

type RiskRegisterFormProps = {
  initialValues: z.infer<typeof riskRegisterValidator>;
  type?: "modal" | "drawer";
  open?: boolean;
  onClose: () => void;
};

const RiskRegisterForm = ({
  initialValues,
  open = true,
  type = "drawer",
  onClose,
}: RiskRegisterFormProps) => {
  const permissions = usePermissions();
  const fetcher =
    useFetcher<PostgrestResponse<{ id: string; success: boolean }>>();
  const deleteDisclosure = useDisclosure();
  const deleteFetcher = useFetcher();

  console.log("zaza", fetcher);

  useEffect(() => {
    console.log("zaza1", fetcher.state, fetcher.data);

    if (fetcher.state === "idle" && fetcher.data?.data) {
      console.log("zaza2", fetcher.data.data);
      onClose?.();
      toast.success(`Saved risk`);
    } else if (fetcher.state === "idle" && fetcher.data?.error) {
      toast.error(`Failed to save risk: ${fetcher.data.error.message}`);
    }
  }, [fetcher.data, fetcher.state, onClose, type]);

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data) {
      deleteDisclosure.onClose();
      onClose?.();
      toast.success(`Deleted risk`);
    }
  }, [deleteFetcher.state, deleteFetcher.data, deleteDisclosure, onClose]);

  const isEditing = !!initialValues.id;
  const isDisabled = isEditing
    ? !permissions.can("update", "quality")
    : !permissions.can("create", "quality");

  // Set default values for severity and likelihood
  const formInitialValues = {
    ...initialValues,
    severity: initialValues.severity ?? 1,
    likelihood: initialValues.likelihood ?? 1,
  };

  return (
    <>
      <ModalDrawerProvider type={type}>
        <ModalDrawer
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose?.();
          }}
        >
          <ModalDrawerContent>
            <ValidatedForm
              validator={riskRegisterValidator}
              method="post"
              action={
                isEditing ? path.to.risk(initialValues.id!) : path.to.newRisk
              }
              defaultValues={formInitialValues}
              fetcher={fetcher}
              className="flex flex-col h-full"
            >
              <ModalDrawerHeader>
                <ModalDrawerTitle>
                  {isEditing ? "Edit" : "New"} Risk
                </ModalDrawerTitle>
              </ModalDrawerHeader>
              <ModalDrawerBody>
                <Hidden name="id" />
                <Hidden name="source" />
                {/* Context field for the source entity ID */}
                <Hidden name="sourceId" />

                <VStack spacing={4}>
                  <Input name="title" label="Title" />
                  <TextArea name="description" label="Description" />

                  <Select
                    name="status"
                    label="Status"
                    options={riskStatus.map((s) => ({ value: s, label: s }))}
                  />

                  <HStack spacing={4} className="w-full">
                    <NumberInput
                      name="severity"
                      label="Severity (1-5)"
                      minValue={1}
                      maxValue={5}
                    />
                    <NumberInput
                      name="likelihood"
                      label="Likelihood (1-5)"
                      minValue={1}
                      maxValue={5}
                    />
                  </HStack>

                  <Employee name="assigneeUserId" label="Assignee" />
                </VStack>
              </ModalDrawerBody>
              <ModalDrawerFooter>
                <HStack className="justify-between w-full">
                  <div>
                    {isEditing && permissions.can("delete", "quality") && (
                      <Button
                        size="md"
                        variant="destructive"
                        onClick={() => deleteDisclosure.onOpen()}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                  <HStack>
                    <Submit isDisabled={isDisabled}>Save</Submit>
                    <Button
                      size="md"
                      variant="solid"
                      onClick={() => onClose?.()}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </HStack>
              </ModalDrawerFooter>
            </ValidatedForm>
          </ModalDrawerContent>
        </ModalDrawer>
      </ModalDrawerProvider>

      {isEditing && initialValues.id && deleteDisclosure.isOpen && (
        <Confirm
          isOpen={deleteDisclosure.isOpen}
          confirmText="Delete"
          onCancel={deleteDisclosure.onClose}
          onSubmit={() => {
            // Handled by form action
          }}
          title="Delete Risk"
          text="Are you sure you want to delete this risk?"
          action={path.to.deleteRisk(initialValues.id)}
        />
      )}
    </>
  );
};

export default RiskRegisterForm;
