import React from "react";
import { Input, Select } from "@/types/form.types";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import ModuleInput from "../module/moduleInput";
import Button from "../common/button";
import { GenObj } from "@/types/generic.types";
import ModuleSelect from "../module/moduleSelect";

type FormProps = {
  raiseSubmit: (data: any) => void;
  submitButtonText: string;
  inputs: (Input | Select)[];
  schema: yup.ObjectSchema<GenObj>;
  show?: boolean;
};

const Form = ({
  raiseSubmit,
  submitButtonText,
  inputs,
  schema,
  show = true,
}: FormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  if (!show) return null;

  return (
    <form onSubmit={handleSubmit(raiseSubmit)}>
      {inputs.map((input: Input | Select, idx) => {
        if (input.type === "") return null;
        else if (input.type === "select") {
          const typedInput: Select = input as Select;
          return (
            <ModuleSelect
              key={idx}
              register={register}
              errors={errors}
              id={typedInput.name}
              label={typedInput.label}
              onChange={typedInput.onChange}
              options={typedInput.options || []}
              placeholder={typedInput.placeholder}
            />
          );
        } else {
          return (
            <ModuleInput
              key={idx}
              register={register}
              errors={errors}
              id={input.name}
              type={input.type}
              label={input.label}
              onChange={input.onChange}
              rest={input.other}
              placeholder={input.placeholder}
            />
          );
        }
      })}
      <Button>{submitButtonText}</Button>
    </form>
  );
};

export default Form;
