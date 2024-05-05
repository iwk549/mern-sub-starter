import { useEffect, RefObject } from "react";

export default function useOutsideClickHandler(
  ref: RefObject<HTMLDivElement>,
  onClick: () => void
) {
  useEffect(() => {
    function handleOutsideClick(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        onClick();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [ref]);
}
