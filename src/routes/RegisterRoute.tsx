import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RegisterScreen from "../screens/RegisterScreen";

export default function RegisterRoute() {
  const navigate = useNavigate();

  return (
    <>
      <RegisterScreen onRegisterSuccess={() => navigate("/login", { replace: true })} />
      <ToastContainer
        position="bottom-right"
        autoClose={4200}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </>
  );
}
