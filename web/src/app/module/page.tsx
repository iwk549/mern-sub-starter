"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import AppContext from "@/context/appContext/appContext";
import TabbedView from "@/components/common/tabbedView";
import { ModuleLayout, RawTab } from "@/types/module.types";
import { mapTabContent } from "@/components/module/moduleTabContent";
import {
  createModulePath,
  getModuleInProgressInfo,
  getValues,
  removeValue,
  saveValues,
} from "@/utils/modules.util";
import ModuleHeader from "@/components/module/moduleHeader";
import { createValidationObject } from "@/utils/form.util";
import Confirm from "@/components/common/confirm";

export default function Module() {
  const router = useRouter();
  const params = useSearchParams();
  const [id, setId] = useState("null");

  const { navigate, setLoading } = useContext(AppContext);

  const [module, setModule] = useState<{ [key: string]: any } | null>(null);
  const [layout, setLayout] = useState<ModuleLayout>({
    name: "",
    tabs: [],
    notFound: false,
  });
  const [values, setValues] = useState<{ [key: string]: string }>({});
  const [blankValues, setBlankValues] = useState<{ [key: string]: string }>({});
  const [dbValues, setDbValues] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState(false);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [warning, setWarning] = useState<{
    open: boolean;
    localModule?: { [key: string]: string };
  }>({
    open: false,
  });
  const [schema, setSchema] = useState<
    yup.ObjectSchema<{ [key: string]: string }> | undefined
  >(undefined);

  const {
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: schema && yupResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    setLoading(true);
    const moduleId = params.get("id");
    // retrieve values from db for loaded module
    if (moduleId) {
      // TODO: replace dummy values
      setDbValues({ name: "test" });
    }

    const savedValues = getValues(params);
    if (savedValues) {
      const module = getModuleInProgressInfo(params)?.module;
      setIsSaved(module?.saved);
      setValues(savedValues);
      reset(savedValues);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const moduleName = params.get("module");
      const materialName = params.get("material");
      setId(params.get("id") || "null");
      setModule(require(`@/data/modules/${materialName}/${moduleName}`));
    } catch (error) {
      setLayout({ name: "", tabs: [], notFound: true });
    }
  }, [params.get("module"), params.get("material")]);

  useEffect(() => {
    if (module) {
      if (!schema) {
        const { schema: newSchema, blankEntries } = createValidationObject(
          module.tabs
        );
        setSchema(newSchema);
        setBlankValues(blankEntries);
      }

      setLayout({
        name: module.name,
        tabs: mapTabContent(
          register,
          errors,
          module.tabs,
          handleChange,
          values
        ),
        notFound: false,
      });
    }
  }, [module, values, id]);

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

  const handleSave = () => {
    /* save values to the db
      update dbValues in state
      update the search params to include the id of the saved module
      resave the values locally */

    const currentId = params.get("id");
    // TODO: save module and get this id from response
    const moduleId = "abcd";
    if (!currentId) removeValue(params, "null");

    router.replace(
      createModulePath(params.get("material"), params.get("module"), moduleId)
    );
    saveValues(values, params, moduleId, { saved: true });
    setId(moduleId);
    setIsSaved(true);
  };

  return (
    <div className="w-full justify-center">
      {layout.notFound ? (
        <div className="text-center m-10">Module Not Found</div>
      ) : (
        <div className="justify-center">
          <ModuleHeader
            header={layout.name}
            onSave={handleSave}
            onReset={handleReset}
            isSaved={isSaved}
          />
          <TabbedView
            tabs={layout.tabs}
            activeTabIndex={activeTabIndex}
            setActiveTabIndex={setActiveTabIndex}
          />
        </div>
      )}
      <Confirm
        isOpen={warning.open}
        onClose={() => setWarning({ open: false })}
        header="Module in Use"
        body={
          <div className="text-center">
            <p>
              You have another module in progress with unsaved work. If you
              continue you will lose that work.
            </p>
          </div>
        }
        buttons={[
          {
            text: "Go to Module in Progress",
            onClick: () => {
              navigate(
                createModulePath(
                  warning.localModule!.material,
                  warning.localModule!.module,
                  warning.localModule!.id
                )
              );
              setWarning({ open: false });
            },
          },
          { text: "Continue", onClick: () => setWarning({ open: false }) },
        ]}
      />
    </div>
  );
}
