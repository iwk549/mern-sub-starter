import React, { ChangeEvent } from "react";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import {
  MappedTab,
  RawContent,
  RawInputContent,
  RawSelectContent,
  RawTab,
} from "@/types/module.types";
import WarningMessage from "../common/warningMessage";
import ModuleSelect from "./moduleSelect";
import ModuleInput from "./moduleInput";

function mapContentLine(
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors<{ [key: string]: string }>,
  contentLine: RawContent | RawInputContent | RawSelectContent,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  values: { [key: string]: string },
  idx: number
) {
  let error = `Invalid Content: ${contentLine.id}`;

  if (contentLine.type === "textBreak") {
    return (
      <p key={idx} className={contentLine.class}>
        {contentLine.label || <>&nbsp;</>}
      </p>
    );
  } else if (!contentLine.id) {
    error = "All data fields must contain an id";
  } else if (contentLine.type === "text" || contentLine.type === "number") {
    let inputContent: RawInputContent = contentLine as RawInputContent;
    return (
      <ModuleInput
        register={register}
        errors={errors}
        id={inputContent.id}
        key={idx}
        label={inputContent.label}
        type={inputContent.type}
        placeholder={inputContent.placeholder}
        onChange={onChange}
        step={inputContent.step}
      />
    );
  } else if (contentLine.type === "select") {
    try {
      let selectContent: RawSelectContent = contentLine as RawSelectContent;
      let options = selectContent.options;
      if (!Array.isArray(options)) {
        // load options from file
        options = require(`@/data/constants/${options}`);
      }
      return (
        <ModuleSelect
          register={register}
          errors={errors}
          id={selectContent.id}
          key={idx}
          label={selectContent.label}
          placeholder={selectContent.placeholder}
          onChange={onChange}
          options={options}
        />
      );
    } catch (error) {
      console.error(error);
    }
  } else if (contentLine.type === "function") {
    try {
      const file = require(`@/data/functions/${contentLine.path}`);
      const func = file[contentLine.id];
      return <div className="w-full">{func(values)}</div>;
    } catch (error) {
      console.error(error);
    }
  }

  return <WarningMessage>{error}</WarningMessage>;
}

export function mapTabContent(
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors<{ [key: string]: string }>,
  tabs: RawTab[],
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  values: { [key: string]: string }
): MappedTab[] {
  console.log("re-render");
  let mappedContent: MappedTab[] = [];

  tabs.forEach((tab: RawTab) => {
    mappedContent.push({
      id: tab.id || tab.label.toLowerCase().replace(" ", ""),
      label: tab.label,
      content: (
        <ModuleTabContent
          register={register}
          errors={errors}
          tab={tab}
          onChange={onChange}
          values={values}
        />
      ),
    });
  });
  return mappedContent;
}

type ModuleTabContentProps = {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<{ [key: string]: string }>;
  tab: RawTab;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  values: { [key: string]: string };
};

const ModuleTabContent = ({
  register,
  errors,
  tab,
  onChange,
  values,
}: ModuleTabContentProps) => {
  return (
    <div key={tab.id || tab.label}>
      {tab.content.map(
        (contentLine: RawInputContent | RawSelectContent, idx) => (
          <div className="flex" key={idx}>
            {Array.isArray(contentLine)
              ? contentLine.map(
                  (contentLine: RawInputContent | RawSelectContent, idx2) => (
                    <div className="flex-1 px-2" key={idx2}>
                      {mapContentLine(
                        register,
                        errors,
                        contentLine,
                        onChange,
                        values,
                        idx2
                      )}
                    </div>
                  )
                )
              : mapContentLine(
                  register,
                  errors,
                  contentLine,
                  onChange,
                  values,
                  idx
                )}
          </div>
        )
      )}
    </div>
  );
};
