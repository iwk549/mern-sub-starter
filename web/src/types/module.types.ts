import { SelectOption } from "./form.types";
import { GenObj } from "./generic.types";

export type RawContent = {
  id: string;
  name: string;
  label: string;
  type: "textBreak" | "text" | "number" | "select";
  validation: any;
  class: string;
  placeholder: string;
  value?: string;
  path?: string;
  properties?: GenObj<any>;
};
export type RawInputContent = RawContent & {
  step?: number;
};
export type RawSelectContent = RawContent & {
  options: SelectOption[];
};

export type RawTab = {
  id?: string;
  label: string;
  content: (RawInputContent | RawSelectContent)[];
};

export type MappedTab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

export type ModuleLayout = {
  material: string;
  module: string;
  inputs: MappedTab[];
  calculations: MappedTab[];
  notFound: boolean;
};
