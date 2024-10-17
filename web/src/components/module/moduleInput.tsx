import React, { ChangeEvent } from "react";
import ValidationMessage from "../form/validationMessage";

type ModuleInputProps = {
  register: any;
  errors: any;
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  rest?: any;
};

const ModuleInput = ({
  register,
  errors,
  id,
  type,
  label,
  placeholder,
  step,
  onChange,
  rest,
}: ModuleInputProps) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-small" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="w-full px-2 py-1 text-sm"
        placeholder={placeholder}
        step={step || 1}
        {...register(id, {})}
        onChange={(event) => {
          if (onChange) onChange(event);
          register(id).onChange(event);
        }}
        {...rest}
      />

      <ValidationMessage errors={errors} name={id} label={label} />
    </div>
  );
};

export default ModuleInput;
