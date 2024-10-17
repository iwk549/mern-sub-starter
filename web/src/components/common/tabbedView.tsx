import { MappedTab } from "@/types/module.types";
import React, { useState } from "react";

type TabbedViewProps = {
  tabs: MappedTab[];
  activeTabIndex: number;
  setActiveTabIndex: (idx: number) => void;
};

const TabbedView = ({
  tabs = [],
  activeTabIndex,
  setActiveTabIndex,
}: TabbedViewProps) => {
  return (
    <div className="mx-auto mt-4 px-8">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`flex-1 py-2 text-center ${
              activeTabIndex === index
                ? "border-b-2 font-semibold"
                : " hover:text-light"
            }`}
            onClick={() => setActiveTabIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs[activeTabIndex] ? (
        <div className="p-4 bg-gray-50 border border-t-0 rounded-b">
          {tabs[activeTabIndex].content}
        </div>
      ) : null}
    </div>
  );
};

export default TabbedView;
