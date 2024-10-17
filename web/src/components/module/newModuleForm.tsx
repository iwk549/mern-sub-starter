import React, { ChangeEvent, useState } from "react";

import * as yup from "yup";
import { nameSchema } from "@/utils/form.util";
import { Module } from "@/types/data.types";
import BasicModal from "../common/modal";
import Form from "../form/form";
import Header from "../common/header";
import { validModules } from "@/utils/modules.util";
import { SelectOption } from "@/types/form.types";

const schema = yup.object({
  name: nameSchema,
  material: yup.string().required(),
  module: yup.string().required(),
});

const validMaterials: SelectOption[] = [];
for (let material in validModules) {
  validMaterials.push({ id: material, label: validModules[material].label });
}

type NewModuleFormProps = {
  onSave: (data: Module) => void;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
};

const NewModuleForm = ({
  onSave,
  showForm,
  setShowForm,
}: NewModuleFormProps) => {
  const [moduleOptions, setModuleOptions] = useState<SelectOption[]>([]);

  const handleMaterialChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setModuleOptions(validModules[event.target.value].modules);
  };

  return (
    <BasicModal isOpen={showForm} onClose={() => setShowForm(false)}>
      <Header>Add New Module</Header>
      <Form
        raiseSubmit={onSave}
        submitButtonText="Add Module"
        schema={schema}
        inputs={[
          {
            type: "text",
            name: "name",
            label: "Module Name",
          },
          {
            type: "select",
            name: "material",
            label: "Material",
            onChange: handleMaterialChange,
            options: validMaterials,
            placeholder: "Select Material",
          },
          {
            type: "select",
            name: "module",
            label: "Module",
            options: moduleOptions,
            placeholder: "Select Module",
          },
        ]}
      />
    </BasicModal>
  );
};

export default NewModuleForm;
