import { IconContext, IconType } from "react-icons";
import { FaArrowDown, FaArrowUp, FaRegUser } from "react-icons/fa";
import { RiLogoutBoxLine } from "react-icons/ri";

type IconProps = {
  name: string | undefined;
  overrideClass?: string;
};

const iconMap: {
  [key: string]: IconType;
} = {
  downArrow: FaArrowDown,
  logout: RiLogoutBoxLine,
  upArrow: FaArrowUp,
  user: FaRegUser,
};

export default function Icon({ name, overrideClass }: IconProps) {
  if (!name) name = "";
  const ThisIcon: IconType | null = iconMap[name];
  if (!ThisIcon) return null;

  return (
    <IconContext.Provider value={{ className: overrideClass || "m-1" }}>
      <ThisIcon />
    </IconContext.Provider>
  );
}
