import { Login } from "@/types/user.types";
import { makeRequest } from "./request.service";

const ext = "/auth";

export async function login(data: Login, overwriteSession: boolean) {
  return makeRequest(ext, "POST", true, { ...data, overwriteSession });
}

export async function logout() {
  return makeRequest(ext + "/logout", "POST", true);
}
