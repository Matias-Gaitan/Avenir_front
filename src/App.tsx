// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importaciones del Sprint 1
import LoginComponent from "./components/login/Login";
import Register from "./components/registrer/registrer";
import Home from "./components/home/home";

// Importaciones nuevas del Sprint 2
import EmpresaComponent from "./components/empresa/EmpresaComponent";
import RegistroHorarioComponent from "./components/Horarios/RegistroHorariosComponents";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirige la raíz "/" hacia "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pantallas principales - Sprint 1 */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Nuevas rutas - Sprint 2 */}
        <Route path="/empresas" element={<EmpresaComponent />} />
        <Route path="/horarios" element={<RegistroHorarioComponent />} />

        {/* Ruta por defecto si no existe */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default App;