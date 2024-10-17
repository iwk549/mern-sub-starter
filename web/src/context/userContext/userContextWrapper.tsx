"use client";

import { useState, useEffect } from "react";
import UserContext from "./userContext";
import { getCurrentUser } from "@/services/request.service";
import { refreshUserToken } from "@/services/user.service";
import { getOrg } from "@/services/org.service";

export default function UserContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wrapperUser, setWrapperUser] = useState<any>(null);
  const [wrapperOrg, setWrapperOrg] = useState<any>(null);

  const refreshUser = async () => {
    const user = await getCurrentUser();
    setWrapperUser(user);
  };

  const refreshUserFromDatabase = async () => {
    await refreshUserToken();
    refreshUser();
  };

  const refreshOrg = async () => {
    const res = await getOrg();
    if (res.ok) setWrapperOrg(res.body);
  };

  useEffect(() => {
    refreshUserFromDatabase();
    refreshOrg();
  }, []);

  return (
    <UserContext.Provider
      value={{ user: wrapperUser, refreshUser, org: wrapperOrg, refreshOrg }}
    >
      {children}
    </UserContext.Provider>
  );
}
