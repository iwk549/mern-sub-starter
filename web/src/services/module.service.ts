import { Module } from "@/types/data.types";
import { makeRequest } from "./request.service";

const ext = "/module";

export async function getModules(
  projectId: string,
  deleted: string | null = null
) {
  const query = deleted ? `?deleted=${deleted}` : "";
  return makeRequest(ext + "/project/" + projectId + query, "GET");
}

export async function checkoutModule(moduleId: string) {
  return makeRequest(ext + "/" + moduleId, "GET");
}

export async function saveModule(module: Module) {
  const requestType = module._id ? "PUT" : "POST";
  return await makeRequest(
    ext + (requestType === "POST" ? "" : "/" + module._id),
    requestType,
    false,
    module
  );
}

export async function checkinModule(moduleId: string | null) {
  return await makeRequest(ext + "/checkin/" + moduleId, "PUT");
}

export async function deleteModule(moduleId: string) {
  return await makeRequest(ext + "/" + moduleId, "DELETE");
}
