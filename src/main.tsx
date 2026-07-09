import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App";
import "./i18n";
import "react-toastify/dist/ReactToastify.css";
import LoginScreen from "./screens/loginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import RolScreen from "./screens/rol/rol";
import UsuariosScreen from "./screens/usuarios/UsuariosScreen";
import PermisoScreen from "./screens/permiso/permiso";
import RolPermisoScreen from "./screens/rolPermiso/rolPermiso";
import UsuarioRolScreen from "./screens/usuarioRol/usuarioRol";
import NotFoundScreen from "./screens/NotFoundScreen";
import ProtectedRoute from "./routes/ProtectedRoute";

const DASHBOARD_ROLES = ["admin", "1botpersonal"];
const ADMIN_ROLES = ["admin"];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/" element={<App />} />
        <Route
          path="/extensions"
          element={
            <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bloques"
          element={
            <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/placas"
          element={
            <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              <App />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={DASHBOARD_ROLES}>
              {(user) => <DashboardScreen user={user} />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <UsuariosScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rol"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <RolScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/permisos"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <PermisoScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rol-permiso"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <RolPermisoScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario-rol"
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <UsuarioRolScreen />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={4200}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </BrowserRouter>
  </React.StrictMode>
);
