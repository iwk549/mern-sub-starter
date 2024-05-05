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
