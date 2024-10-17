import { GenObj } from "@/types/generic.types";
import WithTooltip from "./tooltip";

type ButtonProps = {
  clickHandler?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: string;
  size?: string;
  tooltip?: React.ReactNode;
  children: React.ReactNode;
};

const typeClassMap: GenObj = {
  primary:
    "bg-light border-light text-dark hover:bg-muted hover:text-lightest hover:border-lightest",
  secondary:
    "bg-muted border-muted text-lightest hover:text-light hover:border-light",
  dark: "bg-darkest border-darkest text-light hover:bg-dark hover:text-light hover:border-light",
};

const sizeMap: GenObj = {
  small: "text-sm mx-2 my-2 py-1 px-2",
  medium: "text-base mx-4 my-4 py-2 px-4",
};

export default function Button({
  clickHandler,
  type,
  size,
  tooltip,
  children,
}: ButtonProps) {
  const typeClass = type ? typeClassMap[type] : typeClassMap.primary;
  const sizeClass = size ? sizeMap[size] : sizeMap.medium;

  return (
    <WithTooltip containerClassName="flex flex-col items-center" text={tooltip}>
      <button
        className={
          typeClass + " " + sizeClass + " font-semibold border-2 rounded"
        }
        onClick={clickHandler}
      >
        {children}
      </button>
    </WithTooltip>
  );
}
