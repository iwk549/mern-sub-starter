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
};
export type RawInputContent = RawContent & {
  step?: number;
};
export type RawSelectContent = RawContent & {
  options: {
    id: string;
    label: string;
  }[];
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
  name?: string;
  tabs: MappedTab[];
  notFound: boolean;
};
