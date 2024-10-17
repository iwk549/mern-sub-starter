import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AppContext from "@/context/appContext/appContext";
import { GenObj } from "@/types/generic.types";
import { ModuleLayout } from "@/types/module.types";
import {
  createModulePath,
  getModuleInProgressInfo,
  getValues,
  removeValue,
  saveValues,
} from "@/utils/modules.util";
import { createValidationObject } from "@/utils/form.util";
import { mapTabContent } from "@/components/module/moduleTabContent";
import toastUtil from "@/utils/toast.util";
import {
  checkinModule,
  checkoutModule,
  saveModule,
} from "@/services/module.service";
import { Project } from "@/types/data.types";

/**
 * State and update provider for a single module
 * module loads from json by material and module name
 */
export function useModule() {
  const { setLoading } = useContext(AppContext);
  const params = useSearchParams();
  const router = useRouter();
  const [id, setId] = useState("null");
  const [moduleJson, setModuleJson] = useState<GenObj<any> | null>(null);
  const [layout, setLayout] = useState<ModuleLayout>({
    material: "",
    module: "",
    inputs: [],
    calculations: [],
    notFound: false,
  });
  const [values, setValues] = useState<GenObj>({});
  const [blankValues, setBlankValues] = useState<GenObj>({});
  const [dbValues, setDbValues] = useState<GenObj>({});
  const [moduleInfo, setModuleInfo] = useState<{
    name: string;
    project: Project;
  } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [tabIndex, setTabIndex] = useState({ inputs: 0, calculations: 0 });
  const [warning, setWarning] = useState<{
    open: boolean;
    localModule?: GenObj;
  }>({
    open: false,
  });
  const [schema, setSchema] = useState<yup.ObjectSchema<GenObj> | undefined>(
    undefined
  );

  const {
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: schema && yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    getModuleValues();
  }, [params.get("id")]);

  useEffect(() => {
    try {
      const moduleName = params.get("module");
      const materialName = params.get("material");
      setId(params.get("id") || "null");
      setModuleJson(require(`@/data/modules/${materialName}/${moduleName}`));
    } catch (error) {
      setLayout({
        material: "",
        module: "",
        inputs: [],
        calculations: [],
        notFound: true,
      });
    }
  }, [params.get("module"), params.get("material")]);

  useEffect(() => {
    if (moduleJson) {
      if (!schema) {
        const { schema: newSchema, blankEntries } = createValidationObject(
          moduleJson.inputs
        );
        setSchema(newSchema);
        setBlankValues(blankEntries);
      }

      setLayout({
        material: moduleJson.material,
        module: moduleJson.module,
        inputs: mapTabContent(
          register,
          errors,
          moduleJson.inputs,
          handleChange,
          values
        ),
        calculations: mapTabContent(
          register,
          errors,
          moduleJson.calculations,
          handleChange,
          values
        ),
        notFound: false,
      });
    }
  }, [moduleJson, values, id]);

  const getModuleValues = async () => {
    const id = params.get("id");
    if (id) {
      setLoading(true);
      const res = await checkoutModule(id);
      const savedValues = getValues(params);
      if (res.status === 200) {
        setDbValues(res.body.values || {});
        setModuleInfo({ name: res.body.name, project: res.body.projectId });
        let values = res.body.values || {};
        if (savedValues) {
          const module = getModuleInProgressInfo(params)?.module;
          setIsSaved(module?.saved);
          values = savedValues;
        } else {
        }
        setValues(values);
        reset(values);
      } else toastUtil.error(res.body);
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<any>) => {
    let newValues = { ...values };
    newValues[event.target.id] = event.target.value;
    setValues(newValues);
    setIsSaved(false);
    saveValues(newValues, params, id);
  };

  const handleReset = () => {
    reset({ ...blankValues, ...dbValues });
    setValues(dbValues);
    saveValues(dbValues, params);
  };

  const handleSave = async () => {
    let errorMessage;
    for (let key in errors) {
      if (!errorMessage) errorMessage = errors[key]?.message;
    }
    if (errorMessage) return toastUtil.error(errorMessage);

    setLoading(true);
    const res = await saveModule({
      _id: params.get("id")!,
      name: moduleInfo!.name,
      values,
    });
    if (res.status === 200) {
      setDbValues(values);
      saveValues(values, params, "", { saved: true });
      setIsSaved(true);
      toastUtil.success("Module saved");
    } else toastUtil.error(res.body);
    setLoading(false);
  };

  const handleGoBackToProject = () => {
    setLoading(true);
    checkinModule(params.get("id"));
    router.replace(`/project?id=${params.get("projectId")}`);
    setLoading(false);
  };

  return {
    layout,
    handleSave,
    handleReset,
    isSaved,
    tabIndex,
    setTabIndex,
    warning,
    setWarning,
    handleGoBackToProject,
    moduleInfo,
  };
}
