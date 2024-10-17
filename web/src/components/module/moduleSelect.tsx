import React from "react";
import { RawSelectContent } from "@/types/module.types";
import ValidationMessage from "../form/validationMessage";

interface ModuleSelectProps {
  register: any;
  errors: any;
  id: string;
  label: string;
  placeholder?: string;
  options: RawSelectContent["options"];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  schema?: any;
}

const ModuleSelect: React.FC<ModuleSelectProps> = ({
  register,
  errors,
  id,
  label,
  placeholder,
  onChange,
  options,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-small">
        {label}
      </label>
      <select
        id={id}
        className="block w-full px-2 py-1 text-sm border rounded-md"
        {...register(id, {})}
        onChange={(event) => {
          if (onChange) onChange(event);
          register(id).onChange(event);
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option, idx) => (
          <option key={idx} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ValidationMessage errors={errors} name={id} label={label} />
    </div>
  );
};

export default ModuleSelect;
