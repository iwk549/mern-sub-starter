"use client";

import { useState, useEffect } from "react";
import UserContext from "./userContext";
import { getCurrentUser } from "@/services/request.service";
import { refreshUserToken } from "@/services/user.service";

export default function UserContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wrapperUser, setWrapperUser] = useState<any>(null);

  const refreshUser = async () => {
    const user = await getCurrentUser();
    setWrapperUser(user);
  };

  const refreshUserFromDatabase = async () => {
    await refreshUserToken();
    refreshUser();
  };

  useEffect(() => {
    refreshUserFromDatabase();
  }, []);

  return (
    <UserContext.Provider value={{ user: wrapperUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
