import { GenObj } from "./generic.types";

export type Organization = {
  name: string;
};

export type User = {
  name: string;
  email: string;
};

export type UserUpdate = {
  name: string;
};

export interface Registration extends User {
  password: string;
}

export type Login = {
  email: string;
  password: string;
  overwriteSession?: boolean;
};

export type Project = {
  _id?: string;
  name: string;
  organizationId?: string;
  ownerId?: User;
  authedUsers?: User[];
};

export type Module = {
  _id?: string | null;
  name: string;
  projectId?: string;
  organizationId?: string;
  checkedOutTo?: string | undefined;
  values: GenObj;
};
