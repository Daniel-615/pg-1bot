import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoginScreen from "../screens/loginScreen";

export default function LoginRoute() {
  const navigate = useNavigate();

  return (
    <>
      <LoginScreen onLoginSuccess={() => navigate("/", { replace: true })} />
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
