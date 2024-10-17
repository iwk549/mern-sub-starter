"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
import AppContext from "./appContext";
import { translatePath } from "@/utils/path.util";
import BasicModal from "@/components/common/modal";
import "./appContext.css";

export default function AppContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pageHeader, setPageHeader] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function initApp() {
    // all code for initializing app settings goes here
  }

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    setPageHeader(translatePath(pathname));
  }, [pathname]);

  const navigate = (path: string, isRedirect: boolean) => {
    if (isRedirect) redirect(path);
    else router.push(path);
  };

  return (
    <AppContext.Provider value={{ pageHeader, navigate, loading, setLoading }}>
      {children}
      <BasicModal
        isOpen={loading}
        contentStyle={{ maxWidth: "60%", maxHeight: "60%" }}
      >
        <p className="font-semibold text-lg">Loading...</p>
        <div className="loading-spinner bg-darkest" />
      </BasicModal>
    </AppContext.Provider>
  );
}
