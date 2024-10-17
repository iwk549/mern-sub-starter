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
import { GenObj } from "@/types/generic.types";

function mapContentLine(
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors<GenObj>,
  contentLine: RawContent | RawInputContent | RawSelectContent,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  values: GenObj,
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
  } else if (contentLine.type === "image") {
    try {
      const src = `images/${contentLine.path}/${contentLine.id}`;
      return (
        <div className="mx-auto">
          <img
            src={src}
            className="mx-auto"
            alt={contentLine.label}
            {...contentLine.properties}
          />
          <p className="text-center">{contentLine.label}</p>
        </div>
      );
    } catch (error) {
      console.error(error);
    }
  }

  return <WarningMessage>{error}</WarningMessage>;
}

export function mapTabContent(
  register: UseFormRegister<FieldValues>,
  errors: FieldErrors<GenObj>,
  tabs: RawTab[],
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  values: GenObj
): MappedTab[] {
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
  errors: FieldErrors<GenObj>;
  tab: RawTab;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  values: GenObj;
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
      {!tab.content || !tab.content.length ? (
        <div className="text-center">There's nothing here</div>
      ) : (
        tab.content.map(
          (contentLine: RawInputContent | RawSelectContent, idx) => (
            <div className="flex" key={idx}>
              {Array.isArray(contentLine)
                ? contentLine.map(
                    (
                      contentLineRow: RawInputContent | RawSelectContent,
                      idx2
                    ) => (
                      <div className="flex-1 px-2" key={idx2}>
                        {Array.isArray(contentLineRow)
                          ? contentLineRow.map(
                              (
                                contentLineCol:
                                  | RawInputContent
                                  | RawSelectContent,
                                idx3
                              ) =>
                                mapContentLine(
                                  register,
                                  errors,
                                  contentLineCol,
                                  onChange,
                                  values,
                                  idx3
                                )
                            )
                          : mapContentLine(
                              register,
                              errors,
                              contentLineRow,
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
        )
      )}
    </div>
  );
};
