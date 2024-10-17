import { Project, Module } from "@/types/data.types";
import React from "react";
import Button from "./button";
import Icon from "./icon";

type Item = Project & Module;

type CardListProps = {
  items: Item[];
  additionalKeys?: {
    label: string;
    func: (item: Item) => string;
  }[];
  buttons?: {
    type: string;
    tooltip?: string;
    label: React.ReactNode;
    clickHandler: (item: Item) => void;
  }[];
};

const CardList = ({
  items,
  buttons = [],
  additionalKeys = [],
}: CardListProps) => {
  return items.map((item: Item, idx) => (
    <div className="max-w-md mx-auto" key={idx}>
      <div className="shadow-md rounded-lg p-4">
        <div className="flex justify-between items-center border-b py-3">
          <div>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            {additionalKeys?.map((key, kIdx) => (
              <p className="text-sm" key={kIdx}>
                {key.label}{" "}
                <span className="font-medium">{key.func(item)}</span>
              </p>
            ))}
          </div>
          <div className="flex flex-col space-y-2">
            {buttons.map((button, bIdx) => (
              <Button
                key={bIdx}
                size="small"
                type={button.type}
                tooltip={button.tooltip ? button.tooltip + " " + item.name : ""}
                clickHandler={() => button.clickHandler(item)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  ));
};

export default CardList;
