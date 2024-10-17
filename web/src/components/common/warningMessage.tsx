import React from "react";

type WarningMessageProps = {
  children: React.ReactNode;
};

const WarningMessage = ({ children }: WarningMessageProps) => {
  if (!children) return null;
  return (
    <div className="w-full bg-dark text-light text-sm border rounded p-1 mx-1 px-2 mb-1">
      {children}
    </div>
  );
};

export default WarningMessage;
