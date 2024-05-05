import { ReactElement } from "react";
import BasicModal from "./modal";
import Button from "./button";

type ConfirmProps = {
  header: string;
  isOpen: boolean;
  onClose: () => void;
  body?: ReactElement | string;
  buttons: {
    text: string;
    onClick: () => void;
    type?: string;
  }[];
};

export default function Confirm({
  isOpen,
  onClose,
  header,
  body,
  buttons,
}: ConfirmProps) {
  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      contentStyle={{ maxWidth: "60%", maxHeight: "60%" }}
    >
      <h2 className="text-lg font-bold text-center">{header}</h2>
      {body}
      <div className="flex flex-row">
        {buttons.map((button, idx) => (
          <div key={idx} className="m-auto">
            <Button type={button.type} clickHandler={button.onClick}>
              {button.text}
            </Button>
          </div>
        ))}
      </div>
    </BasicModal>
  );
}
