"use client";

import { useContext } from "react";
import AppContext from "@/context/appContext/appContext";
import TabbedView from "@/components/common/tabbedView";
import { createModulePath } from "@/utils/modules.util";
import ModuleHeader from "@/components/module/moduleHeader";
import Confirm from "@/components/common/confirm";
import { useModule } from "@/hooks/useModule";
import AuthedPage from "@/components/common/authedPage";

export default function Module() {
  const { navigate } = useContext(AppContext);
  const {
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
  } = useModule();

  return (
    // <AuthedPage>
      <div className="w-full justify-center">
        {layout.notFound ? (
          <div className="text-center m-10">Module Not Found</div>
        ) : (
          <div className="justify-center">
            <ModuleHeader
              name={moduleInfo?.name || ""}
              material={layout.material}
              module={layout.module}
              onSave={handleSave}
              onReset={handleReset}
              isSaved={isSaved}
              handleGoBackToProject={handleGoBackToProject}
            />
            <div className="flex flex-col moduleSplit:flex-row moduleSplit:space-x-4 space-y-4 moduleSplit:space-y-0">
              <div className="moduleSplit:w-1/2 w-full">
                <TabbedView
                  tabs={layout.inputs}
                  activeTabIndex={tabIndex.inputs}
                  setActiveTabIndex={(idx) =>
                    setTabIndex({ ...tabIndex, inputs: idx })
                  }
                />
              </div>
              <div className="moduleSplit:w-1/2 w-full">
                <TabbedView
                  tabs={layout.calculations}
                  activeTabIndex={tabIndex.calculations}
                  setActiveTabIndex={(idx) =>
                    setTabIndex({ ...tabIndex, calculations: idx })
                  }
                />
              </div>
            </div>
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
                    warning.localModule!.projectId,
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
    // </AuthedPage>
  );
}
