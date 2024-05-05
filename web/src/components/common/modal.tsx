import Modal from "react-modal";

type BasicModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  contentStyle?: {
    [key: string]: string | number | boolean;
  };
};

export default function BasicModal({
  isOpen,
  onClose,
  children,
  contentStyle,
}: BasicModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-49%",
          transform: "translate(-50%, -50%)",
          height: "auto",
          width: "auto",
          backgroundColor: "#5c6d70",
          border: "2px solid #e88873",
          zIndex: 101,
          maxHeight: "95%",
          maxWidth: "95%",
          ...contentStyle,
        },
      }}
    >
      {children}
    </Modal>
  );
}
