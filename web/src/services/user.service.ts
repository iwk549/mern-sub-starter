import { Registration, User } from "@/types/user.types";
import { makeRequest } from "./request.service";

const ext = "/user";

export async function registerUser(user: Registration) {
  return makeRequest(ext, "POST", true, user);
}

export async function updateUser(user: User) {
  return makeRequest(ext, "PUT", true, user);
}

export async function refreshUserToken() {
  return makeRequest(ext, "GET", true);
}

export async function deleteUser() {
  return makeRequest(ext, "DELETE", true);
}
