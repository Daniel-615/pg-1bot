import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
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
import { queryClient } from "./lib/queryClient";
import { OfflineIndicator } from "./screens/components/OfflineIndicator";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import VerifyAccountScreen from "./screens/VerifyAccountScreen";
import { CookieConsent } from "./screens/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/verify-account" element={<VerifyAccountScreen />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/extensions"
            element={
                <ProtectedRoute requiredPermissions={["leer_extension"]}>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bloques"
            element={
                <ProtectedRoute requiredPermissions={["leer_bloque"]}>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/placas"
            element={
                <ProtectedRoute requiredPermissions={["leer_placa"]}>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
                <ProtectedRoute>
                {(user) => <DashboardScreen user={user} />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
                <ProtectedRoute requiredPermissions={["ver_usuarios"]}>
                <UsuariosScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rol"
            element={
                <ProtectedRoute requiredPermissions={["ver_roles"]}>
                <RolScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permisos"
            element={
                <ProtectedRoute requiredPermissions={["ver_permisos"]}>
                <PermisoScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rol-permiso"
            element={
                <ProtectedRoute requiredPermissions={["ver_roles", "ver_permisos"]}>
                <RolPermisoScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuario-rol"
            element={
                <ProtectedRoute requiredPermissions={["ver_usuarios"]}>
                <UsuarioRolScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundScreen />} />
        </Routes>
        <CookieConsent />
        <ToastContainer
          position="bottom-right"
          autoClose={4200}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
        <OfflineIndicator />
      </BrowserRouter>
      <Analytics />
    </QueryClientProvider>
  </React.StrictMode>
);
