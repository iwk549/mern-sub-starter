export type Input = {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  validation?: {
    [key: string]: string | boolean | RegExp;
  };
  other?: {
    [key: string]: any;
  };
};
