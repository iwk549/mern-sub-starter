import { useForm } from "react-hook-form";

import Button from "../common/button";
import { Input } from "@/types/form.types";
import { yupResolver } from "@hookform/resolvers/yup";
import ModuleInput from "../module/moduleInput";

class Form {
  _raiseSubmit: any;
  _submitButtonText: string;
  _inputs: Input[];
  _schema: any;
  _show: boolean;

  constructor(
    raiseSubmit: any,
    submitButtonText: string,
    schema: any,
    inputs: Input[],
    show?: boolean
  ) {
    this._raiseSubmit = raiseSubmit;
    this._submitButtonText = submitButtonText;
    this._inputs = inputs;
    this._schema = schema;
    this._show = typeof show === "boolean" ? show : true;
  }

  render() {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm({ resolver: yupResolver(this._schema) });

    if (!this._show) return null;

    return (
      <form onSubmit={handleSubmit(this._raiseSubmit)}>
        {this._inputs.map((input, idx) => {
          if (input.type === "") return null;

          return (
            <div key={idx}>
              <ModuleInput
                register={register}
                errors={errors}
                id={input.name}
                type={input.type}
                label={input.label}
                rest={input.other}
              />
            </div>
          );
        })}
        <Button>{this._submitButtonText}</Button>
      </form>
    );
  }
}

export default Form;
