import { GenObj } from "@/types/generic.types";
import { IconContext, IconType } from "react-icons";
import {
  FaArrowDown,
  FaArrowUp,
  FaRegUser,
  FaProjectDiagram,
  FaEdit,
  FaFolderOpen,
} from "react-icons/fa";
import { MdAutoDelete } from "react-icons/md";
import { RiLogoutBoxLine } from "react-icons/ri";

type IconProps = {
  name: string | undefined;
  overrideClass?: string;
};

const iconMap: GenObj<IconType> = {
  delete: MdAutoDelete,
  downArrow: FaArrowDown,
  edit: FaEdit,
  logout: RiLogoutBoxLine,
  open: FaFolderOpen,
  project: FaProjectDiagram,
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
