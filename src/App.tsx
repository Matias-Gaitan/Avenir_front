// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginComponent from "./components/login/login";
import Register from "./components/registrer/registrer";
import Home from "./components/home/home";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirige la raíz "/" hacia "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pantallas principales */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Ruta por defecto si no existe */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
