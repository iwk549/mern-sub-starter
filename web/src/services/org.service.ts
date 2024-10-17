import { Organization } from "@/types/org.types";
import { makeRequest } from "./request.service";
import { Registration } from "@/types/user.types";

const ext = "/organization";

export async function createNewOrg(
  user: Registration,
  organization: Organization
) {
  return makeRequest(ext, "POST", true, { user, organization });
}

export async function getOrg() {
  return makeRequest(ext, "GET");
}
