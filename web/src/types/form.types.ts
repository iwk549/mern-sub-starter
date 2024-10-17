import { ChangeEvent } from "react";
import { GenObj } from "./generic.types";

type GenInput = {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  other?: GenObj<any>;
};
export type Input = GenInput & {
  min?: number;
  max?: number;
  validation?: GenObj<string | boolean | RegExp>;
};

export type Select = GenInput & {
  options: {
    label: string;
    id: string;
  }[];
};

export type SelectOption = {
  id: string;
  label: string;
};
