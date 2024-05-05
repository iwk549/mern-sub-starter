import { useContext, useEffect } from "react";

import AppContext from "@/context/appContext/appContext";
import UserContext from "@/context/userContext/userContext";

type AuthedPageProps = {
  level?: string;
  redirectPath?: string;
  children: React.ReactNode;
};

export default function AuthedPage({
  level,
  redirectPath,
  children,
}: AuthedPageProps) {
  const { user } = useContext(UserContext);
  const { navigate } = useContext(AppContext);

  useEffect(() => {
    if (!user || (level && !user.role?.includes(level)))
      navigate(redirectPath || "/", true);
  }, [user]);

  if (!user) return null;

  return <div>{children}</div>;
}
