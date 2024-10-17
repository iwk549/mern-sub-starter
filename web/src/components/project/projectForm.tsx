import React from "react";

import * as yup from "yup";
import { nameSchema } from "@/utils/form.util";
import { Project } from "@/types/data.types";
import BasicModal from "../common/modal";
import Form from "../form/form";
import Header from "../common/header";

const schema = yup.object({
  name: nameSchema,
});

type ProjectFormProps = {
  onSave: (data: Project) => void;
  project: Project | null;
  setProject: (project: Project | null) => void;
  show: boolean;
};

const ProjectForm = ({
  onSave,
  project,
  setProject,
  show,
}: ProjectFormProps) => {
  return (
    <BasicModal isOpen={!!project && show} onClose={() => setProject(null)}>
      <Header>
        {project?.name ? `Edit ${project.name}` : "Create New Project"}
      </Header>
      <Form
        raiseSubmit={onSave}
        submitButtonText={
          (project?._id === "new" ? "Create" : "Update") + " Project"
        }
        schema={schema}
        inputs={[
          {
            type: "text",
            name: "name",
            label: "Project Name",
            other: {
              defaultValue: project?.name,
            },
          },
        ]}
        show={!!project}
      />
    </BasicModal>
  );
};

export default ProjectForm;
