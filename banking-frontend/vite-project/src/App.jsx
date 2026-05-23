import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState("login");

  if (user) return <Dashboard />;

  return view === "login"
    ? <LoginPage onSwitch={() => setView("register")} />
    : <RegisterPage onSwitch={() => setView("login")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}