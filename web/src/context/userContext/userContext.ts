import { createContext } from "react";

type UserContextType = {
  user: any;
  refreshUser: any;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: null,
});

export default UserContext;
