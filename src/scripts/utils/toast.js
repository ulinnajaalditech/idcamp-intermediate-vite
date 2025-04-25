import Toastify from "toastify-js";

const useToast = (message, type = "success") => {
  const toast = Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: "bottom",
    position: "right",
    style: {
      background: type === "success" ? "#4CAF50" : "#F44336",
      color: "#fff",
      borderRadius: "5px",
      padding: "10px",
    },
  });
  toast.showToast();
};

export default useToast;
