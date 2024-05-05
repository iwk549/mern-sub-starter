import { createContext } from "react";

type AppContextType = {
  pageHeader: string;
  navigate: any;
  loading: boolean;
  setLoading: any;
};

const AppContext = createContext<AppContextType>({
  pageHeader: "",
  navigate: null,
  loading: false,
  setLoading: null,
});

export default AppContext;
