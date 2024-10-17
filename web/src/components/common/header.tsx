import React from "react";

type HeaderProps = {
  children: React.ReactNode;
};

const Header = ({ children }: HeaderProps) => {
  return <div className="text-2xl font-bold text-center mt-4">{children}</div>;
};

export default Header;
