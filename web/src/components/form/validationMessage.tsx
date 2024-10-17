import React from "react";
import WarningMessage from "../common/warningMessage";

type ValidationMessageProps = {
  errors: any;
  name: string;
  label: string;
};

const ValidationMessage = ({ errors, name, label }: ValidationMessageProps) => {
  return errors[name] ? (
    <WarningMessage>
      {errors[name].type === "required"
        ? `${label} is required`
        : String(errors[name].message)}
    </WarningMessage>
  ) : null;
};

export default ValidationMessage;
