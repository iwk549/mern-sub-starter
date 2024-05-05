export type Input = {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  validation?: {
    [key: string]: string | boolean | RegExp;
  };
  other?: {
    [key: string]: any;
  };
};
