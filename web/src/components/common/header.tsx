import React from "react";

type HeaderProps = {
  sub?: boolean;
  children: React.ReactNode;
};

const Header = ({ sub = false, children }: HeaderProps) => {
  return (
    <div className={`text-${sub ? "" : "2"}xl font-bold text-center mt-4 mb-2`}>
      {children}
    </div>
  );
};

export default Header;
