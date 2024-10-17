import { SelectOption } from "@/types/form.types";
import { GenObj } from "@/types/generic.types";
import { ReadonlyURLSearchParams } from "next/navigation";

export const validModules: {
  [key: string]: {
    label: string;
    modules: SelectOption[];
  };
} = {
  samples: {
    label: "Samples",
    modules: [{ id: "sampleModule", label: "Sample Module" }],
  },
};

function getInfo(params: ReadonlyURLSearchParams) {
  return {
    id: params.get("id"),
    module: params.get("module"),
    material: params.get("material"),
  };
}
function createStorageKey(
  params: ReadonlyURLSearchParams,
  forInfo?: boolean,
  overrideId?: string
) {
  const { id, module, material } = getInfo(params);
  return `module:${material}:${module}:${overrideId || id}${
    forInfo ? ":info" : ""
  }`;
}

export function createModulePath(
  projectId: string | null,
  material?: string | null,
  module?: string | null,
  id?: string
) {
  return `/module?projectId=${projectId}&material=${material}&module=${module}${
    id ? `&id=${id}` : ""
  }`;
}

export function saveValues(
  values: GenObj,
  params: ReadonlyURLSearchParams,
  overrideId?: string,
  options: {
    saved: boolean;
  } = { saved: false }
) {
  localStorage.setItem(
    createStorageKey(params, false, overrideId),
    JSON.stringify(values)
  );

  const { id, module, material } = getInfo(params);
  const thisModule = JSON.stringify({
    module,
    material,
    id,
    ...options,
  });
  localStorage.setItem(
    createStorageKey(params, true, overrideId),
    JSON.stringify(thisModule)
  );
}

export function getModuleInProgressInfo(params: ReadonlyURLSearchParams) {
  const moduleInfo = localStorage.getItem(createStorageKey(params, true));
  if (moduleInfo) return JSON.parse(moduleInfo);
  else return null;
}

export function getValues(params: ReadonlyURLSearchParams): GenObj | null {
  const values = localStorage.getItem(createStorageKey(params));
  if (values) return JSON.parse(values);
  return null;
}

export function removeValue(
  params: ReadonlyURLSearchParams,
  idToRemove: string
) {
  localStorage.removeItem(createStorageKey(params, false, idToRemove));
  localStorage.removeItem(createStorageKey(params, true, idToRemove));
}

export function clearValues() {
  localStorage.clear();
}
