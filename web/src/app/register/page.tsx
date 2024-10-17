"use client";

import { useContext } from "react";
import * as yup from "yup";

import toast from "../../utils/toast.util";
import { Registration } from "@/types/data.types";
import UserContext from "@/context/userContext/userContext";
import AppContext from "@/context/appContext/appContext";
import { createNewOrg } from "@/services/org.service";
import { nameSchema } from "@/utils/form.util";
import Form from "@/components/form/form";

const schema = yup.object({
  name: nameSchema.label("Name"),
  orgName: nameSchema.label("Organization Name"),
  email: yup.string().email().required(),
  password: yup.string().required().min(8).max(128),
});

export default function RegisterForm() {
  const { refreshUser } = useContext(UserContext);
  const { navigate, setLoading } = useContext(AppContext);

  async function handleRegister(data: Registration & { orgName: string }) {
    setLoading(true);
    const res = await createNewOrg(
      { name: data.name, email: data.email, password: data.password },
      { name: data.orgName }
    );
    if (res.ok) {
      refreshUser();
      toast.success(res.body);
      navigate("/profile");
    } else {
      toast.error(res.body);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen">
      <div className="m-auto">
        <Form
          raiseSubmit={handleRegister}
          submitButtonText="Register"
          schema={schema}
          inputs={[
            {
              type: "text",
              name: "orgName",
              label: "Organization Name",
              placeholder: "organization name",
            },
            {
              type: "text",
              name: "name",
              label: "Your Name",
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
          ]}
        />
      </div>
    </div>
  );
}
