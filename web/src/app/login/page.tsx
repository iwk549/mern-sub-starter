"use client";

import { useState, useContext } from "react";
import * as yup from "yup";

import toast from "../../utils/toast.util";
import { Login } from "@/types/data.types";
import { login } from "@/services/auth.service";
import Confirm from "@/components/common/confirm";
import UserContext from "@/context/userContext/userContext";
import AppContext from "@/context/appContext/appContext";
import Form from "@/components/form/form";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required().min(8).max(128),
});

export default function LoginForm() {
  const { refreshUser } = useContext(UserContext);
  const { navigate, setLoading } = useContext(AppContext);

  const [savedLogin, setSavedLogin] = useState<Login | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);

  async function doLogin(
    data: Login | null,
    overwriteSession: boolean = false
  ) {
    if (!data) return toast.error("Invalid Login");
    setLoading(true);
    const res = await login(data, overwriteSession);
    if (res.ok) {
      refreshUser();
      setOverrideOpen(false);
      toast.success(res.body);
      navigate("/profile");
    } else if (res.status === 300) {
      setSavedLogin(data);
      setOverrideOpen(true);
    } else {
      toast.error(res.body);
    }
    setLoading(false);
  }

  function handleLogin(data: Login) {
    doLogin(data, false);
  }

  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <Form
          raiseSubmit={handleLogin}
          submitButtonText="Login"
          schema={schema}
          inputs={[
            {
              type: "text",
              name: "email",
              label: "Email",
              placeholder: "email",
              other: {
                autoComplete: "username",
                defaultValue: "test1@structuremate.com",
              },
            },
            {
              type: "password",
              name: "password",
              label: "Password",
              placeholder: "password",
              other: {
                autoComplete: "current-password",
                defaultValue: "Password1!",
              },
            },
          ]}
        />
      </div>
      <Confirm
        isOpen={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        header="Account is already is session"
        body={
          <div className="text-center">
            <p>
              This account is already logged in on another browser or computer.
              Continuing to log in here will end that session, causing the
              potential for lost work.
            </p>
            <p>Continue?</p>
          </div>
        }
        buttons={[
          {
            text: "No",
            onClick: () => {
              setSavedLogin(null);
              setOverrideOpen(false);
            },
          },
          { text: "Yes", onClick: () => doLogin(savedLogin, true) },
        ]}
      />
    </div>
  );
}
