import { GenObj } from "./generic.types";

export type Input = {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  validation?: GenObj<string | boolean | RegExp>;
  other?: GenObj<any>;
};
