import { GenObj } from "@/types/generic.types";
import {
  RawContent,
  RawInputContent,
  RawSelectContent,
  RawTab,
} from "@/types/module.types";
import * as yup from "yup";

export const nameSchema = yup.string().required().min(3).max(99);

function createSchemaEntry(contentLine: RawContent) {
  if (!contentLine.validation) return null;
  let schema =
    contentLine.type === "number"
      ? yup
          .number()
          .transform((value) => (Number.isNaN(value) ? undefined : value))
      : yup.string();
  schema = schema.label(contentLine.validation.label || contentLine.label);
  Object.keys(contentLine.validation).forEach((k) => {
    if (k === "required" && contentLine.validation[k])
      schema = schema.required();
    else schema = schema.optional();
    if (k === "min") schema = schema.min(contentLine.validation[k]);
    if (k === "max") schema = schema.max(contentLine.validation[k]);
  });

  return schema;
}

export function createValidationObject(tabs: RawTab[]): {
  schema: yup.ObjectSchema<GenObj>;
  blankEntries: GenObj;
} {
  let fullSchema: GenObj<any> = {};
  let blankEntries: GenObj<any> = {};
  tabs.forEach((tab) => {
    tab.content.forEach((contentLine) => {
      if (Array.isArray(contentLine)) {
        contentLine.forEach((contentLineRow: RawContent) => {
          if (Array.isArray(contentLineRow)) {
            contentLineRow.forEach((contentLineCol: RawContent) => {
              fullSchema[contentLineCol.id] = createSchemaEntry(contentLineCol);
              blankEntries[contentLineCol.id] = "";
            });
          } else {
            fullSchema[contentLineRow.id] = createSchemaEntry(contentLineRow);
            blankEntries[contentLineRow.id] = "";
          }
        });
      } else {
        fullSchema[contentLine.id] = createSchemaEntry(contentLine);
        blankEntries[contentLine.id] = "";
      }
    });
  });

  return { schema: yup.object(fullSchema), blankEntries };
}
