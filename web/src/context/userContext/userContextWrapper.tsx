"use client";

import { useState, useEffect, useContext } from "react";
import UserContext from "./userContext";
import { getCurrentUser } from "@/services/request.service";
import { refreshUserToken } from "@/services/user.service";
import { getOrg } from "@/services/org.service";
import AppContext from "../appContext/appContext";

export default function UserContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLoading } = useContext(AppContext);
  const [wrapperUser, setWrapperUser] = useState<any>(null);
  const [wrapperOrg, setWrapperOrg] = useState<any>(null);

  const refreshUser = async () => {
    const user = await getCurrentUser();
    setWrapperUser(user);
  };

  const refreshOrg = async () => {
    const res = await getOrg();
    if (res.ok) setWrapperOrg(res.body);
  };

  const refreshData = async () => {
    setLoading(true);
    await refreshUserToken();
    refreshUser();
    const res = await getOrg();
    if (res.ok) setWrapperOrg(res.body);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <UserContext.Provider
      value={{ user: wrapperUser, refreshUser, org: wrapperOrg, refreshOrg }}
    >
      {children}
    </UserContext.Provider>
  );
}
