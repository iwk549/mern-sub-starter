import { Project } from "@/types/data.types";
import { makeRequest } from "./request.service";

const ext = "/project";

export async function getProjects(
  ownedOnly: boolean,
  deleted: string | null = null
) {
  const query = deleted ? `?deleted=${deleted}` : "";
  return makeRequest(ext + (ownedOnly ? "" : "/authed") + query, "GET");
}

export async function saveProject(project: Project, _id?: string) {
  const requestType = _id === "new" ? "POST" : "PUT";
  return makeRequest(
    ext + (requestType === "POST" ? "" : "/" + _id),
    requestType,
    false,
    project
  );
}

export async function deleteProject(project: Project) {
  return makeRequest(ext + "/" + project._id, "DELETE");
}
