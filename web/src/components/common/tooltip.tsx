import React from "react";

type WithTooltipProps = {
  text?: React.ReactNode;
  containerClassName?: string;
  direction?: "left" | "right" | "top" | "bottom";
  children?: React.ReactNode;
};

const dMap = {
  left: "right-full top-1/2",
  right: "left-full top-1/2",
  top: "bottom-full left-1/2",
  bottom: "top-full left-1/2",
};
const WithTooltip = ({
  text,
  containerClassName = "",
  direction = "left",
  children,
}: WithTooltipProps) => {
  return (
    <div className={containerClassName + " relative inline-block group"}>
      {children}
      {text ? (
        <div
          className={`absolute ${dMap[direction]} transform -translate-y-1/2 hidden group-hover:block bg-darkest text-white text-sm rounded py-1 px-2 whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-1`}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};

export default WithTooltip;
