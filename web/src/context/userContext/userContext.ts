import { createContext } from "react";

type UserContextType = {
  user: any;
  refreshUser: () => void;
  org: any;
  refreshOrg: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: () => {},
  org: null,
  refreshOrg: () => {},
});

export default UserContext;
