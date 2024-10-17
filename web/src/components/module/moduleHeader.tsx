import React, { useState } from "react";
import Header from "@/components/common/header";
import Button from "@/components/common/button";
import Confirm from "@/components/common/confirm";

type ModuleHeaderProps = {
  name: string;
  material: string;
  module: string;
  isSaved: boolean;
  onReset: () => void;
  onSave: () => void;
  handleGoBackToProject: () => void;
};

const ModuleHeader = ({
  name,
  material,
  module,
  isSaved,
  onReset,
  onSave,
  handleGoBackToProject,
}: ModuleHeaderProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="shadow-lg">
      <Header>{name}</Header>
      <Header sub={true}>
        {material}: {module}
      </Header>
      <div className="flex text-center py-4">
        <div className="flex-1">
          <Button type="dark" clickHandler={handleGoBackToProject} size="small">
            Go Back
          </Button>
        </div>
        <div className="flex-1">
          {!isSaved ? (
            <Button
              type="secondary"
              clickHandler={() => setConfirmOpen(true)}
              size="small"
            >
              Reset
            </Button>
          ) : null}
        </div>
        <div className="flex-1">
          <Button type="primary" clickHandler={onSave} size="small">
            Save
          </Button>
        </div>
      </div>
      <Confirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        header="Reset to last saved state?"
        buttons={[
          {
            text: "No",
            onClick: () => setConfirmOpen(false),
          },
          {
            text: "Yes",
            onClick: () => {
              onReset();
              setConfirmOpen(false);
            },
          },
        ]}
      />
    </div>
  );
};

export default ModuleHeader;
