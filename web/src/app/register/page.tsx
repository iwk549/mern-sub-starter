"use client";

import { useContext } from "react";
import * as yup from "yup";

import Form from "@/components/form";
import toast from "../../utils/toast.util";
import { registerUser } from "@/services/user.service";
import { Registration } from "@/types/user.types";
import UserContext from "@/context/userContext/userContext";
import AppContext from "@/context/appContext/appContext";

const schema = yup.object({
  name: yup.string().required().min(3).max(20),
  email: yup.string().email().required(),
  password: yup.string().required().min(8).max(128),
});

export default function RegisterForm() {
  const { refreshUser } = useContext(UserContext);
  const { navigate, setLoading } = useContext(AppContext);

  async function handleRegister(data: Registration) {
    setLoading(true);
    const res = await registerUser(data);
    if (res.ok) {
      refreshUser();
      toast.success(res.body);
      navigate("/profile");
    } else {
      toast.error(res.body);
    }
    setLoading(false);
  }

  const form = new Form(handleRegister, "Register", schema, [
    {
      type: "text",
      name: "name",
      label: "Name",
      placeholder: "name",
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      placeholder: "email",
      other: {
        autoComplete: "username",
      },
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "password",
      other: {
        autoComplete: "current-password",
      },
    },
  ]);

  return (
    <div className="flex h-screen">
      <div className="m-auto">{form.render()}</div>
    </div>
  );
}
