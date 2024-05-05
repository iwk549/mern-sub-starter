"use client";

import { useState, useContext, useEffect } from "react";
import * as yup from "yup";

import toast from "../../utils/toast.util";
import Form from "@/components/form";
import Button from "@/components/common/button";
import Confirm from "@/components/common/confirm";
import {
  deleteUser,
  refreshUserToken,
  updateUser,
} from "@/services/user.service";
import AppContext from "@/context/appContext/appContext";
import UserContext from "@/context/userContext/userContext";
import { UserUpdate } from "@/types/user.types";
import AuthedPage from "@/components/common/authedPage";

const schema = yup.object({
  name: yup.string().required().min(3).max(20),
});

export default function Profile() {
  const { user, refreshUser } = useContext(UserContext);
  const { navigate, setLoading } = useContext(AppContext);
  const [editMode, setEditMode] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  async function handleRefreshToken() {
    await refreshUserToken();
    refreshUser();
  }
  useEffect(() => {
    handleRefreshToken();
  }, []);

  async function handleDeleteAccount() {
    setLoading(true);
    const res = await deleteUser();
    if (res.ok) {
      refreshUser();
      setDeleteAccountOpen(false);
      toast.success("Account deleted");
      navigate("/login");
    } else toast.error(res.body);
    setLoading(false);
  }

  async function handleUpdateAccount(data: UserUpdate) {
    setLoading(true);
    const res = await updateUser({ ...data, email: user.email });
    if (res.ok) {
      toast.success(res.body);
      setEditMode(false);
      refreshUser();
    } else toast.error(res.body);
    setLoading(false);
  }

  const form = new Form(
    handleUpdateAccount,
    "Update",
    schema,
    [
      {
        type: "text",
        name: "name",
        label: "Name",
        placeholder: "name",
        other: { defaultValue: user?.name },
      },
    ],
    editMode
  );

  return (
    <AuthedPage>
      <div className="app-wrap">
        <Button
          clickHandler={() => setEditMode(!editMode)}
          size="small"
          type={editMode ? "secondary" : "primary"}
        >
          {editMode ? "Cancel" : ""} Edit Profile
        </Button>
        <div className="flex flex-col items-center">
          {!editMode ? <div>{user?.name}</div> : null}
          {form.render()}
        </div>
        <div className="float-right">
          <Button
            size="small"
            type="dark"
            clickHandler={() => setDeleteAccountOpen(true)}
          >
            Delete Account
          </Button>
        </div>

        <Confirm
          isOpen={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          header="Permanently Delete your Account"
          body={
            <div className="text-center">
              <p>Any data associated with this account will be deleted.</p>
              <p>Confirm?</p>
            </div>
          }
          buttons={[
            {
              text: "Cancel",
              type: "dark",
              onClick: () => {
                setDeleteAccountOpen(false);
              },
            },
            { text: "Confirm", onClick: handleDeleteAccount },
          ]}
        />
      </div>
    </AuthedPage>
  );
}
