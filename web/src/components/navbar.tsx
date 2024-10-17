"use client";

import { useState, useContext } from "react";
import UserContext from "@/context/userContext/userContext";
import Confirm from "./common/confirm";
import { logout } from "@/services/auth.service";
import AppContext from "@/context/appContext/appContext";
import Dropdown from "./common/dropdown";

export default function Navbar() {
  const { user, refreshUser } = useContext(UserContext);
  const { pageHeader, navigate, setLoading } = useContext(AppContext);

  const [logoutOpen, setLogoutOpen] = useState(false);

  function renderNavItem(link: string, text: string) {
    return (
      <div className="flex-grow flex items-center justify-center h-12">
        <div onClick={() => navigate(link)} className="cursor-pointer">
          {text}
        </div>
      </div>
    );
  }

  async function doLogout() {
    setLoading(true);
    await logout();
    refreshUser();
    setLogoutOpen(false);
    setLoading(false);
    navigate("/login");
  }

  return (
    <div>
      <div className="flex justify-center bg-muted text-lightest">
        {user ? (
          <>
            {renderNavItem("/", "Home")}
            {renderNavItem(
              "/module?material=samples&module=sampleModule",
              "Module Demo"
            )}
            <Dropdown
              header={user.name}
              items={[
                {
                  text: "Profile",
                  iconName: "user",
                  onClick: () => navigate("/profile"),
                },
                {
                  text: "Projects",
                  iconName: "project",
                  onClick: () => navigate("/project"),
                },
                {
                  text: "Logout",
                  iconName: "logout",
                  onClick: () => setLogoutOpen(true),
                },
              ]}
            />
          </>
        ) : (
          <>
            {renderNavItem("/register", "Register")}
            {renderNavItem("/login", "Login")}
          </>
        )}
        <Confirm
          isOpen={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          header="Logout"
          buttons={[
            {
              text: "No",
              onClick: () => {
                setLogoutOpen(false);
              },
            },
            { text: "Yes", onClick: doLogout },
          ]}
        />
      </div>
      <div className="bg-lightest text-dark">
        {pageHeader ? (
          <h2 className="font-semibold text-lg text-center">{pageHeader}</h2>
        ) : null}
      </div>
    </div>
  );
}
