import { toast, ToastOptions } from "react-toastify";

const options: ToastOptions = {
  position: "bottom-center",
  autoClose: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
};

export default {
  success: (message: string) => {
    toast.dismiss();
    toast.success(message, options);
  },
  error: (message: string) => {
    toast.dismiss();
    toast.error(message, options);
  },
  info: (message: string) => {
    toast.dismiss();
    toast.info(message, options);
  },
};
