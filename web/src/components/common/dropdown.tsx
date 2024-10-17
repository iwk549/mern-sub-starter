import { useState, useRef } from "react";
import useOutsideClickHandler from "@/hooks/outsideClickHandler";
import Icon from "./icon";

type DropdownProps = {
  header: string;
  items: {
    text: string;
    iconName?: string;
    onClick: () => void;
  }[];
};

export default function Dropdown({ header, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef(null);
  useOutsideClickHandler(wrapperRef, () => setIsOpen(false));

  return (
    <div ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="text-center text-md font-semibold m-2 p-1 flex cursor-pointer hover:text-light"
      >
        {header}&nbsp;
        <Icon name={(isOpen ? "up" : "down") + "Arrow"} />
      </div>
      {isOpen ? (
        <div className="z-10 absolute right-2 top-8 bg-muted text-light m-2 p-2 rounded border-2 border-dark shadow-lg">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="cursor-pointer hover:text-lightest flex p-1 m-1"
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              <Icon name={item.iconName} /> {item.text}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
