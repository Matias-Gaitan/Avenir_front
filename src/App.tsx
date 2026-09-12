import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Importaciones del Sprint 1
import LoginComponent from "./components/login/login";
import Register from "./components/registrer/registrer";
import Home from "./components/home/home";

// Importaciones del Sprint 2
import EmpresaComponent from "./components/empresa/EmpresaComponent";
import RegistroHorarioComponent from "./components/Horarios/RegistroHorariosComponents";

// 🌟 Importación IPER
import { AdminCatalogosPage } from "./components/AdminCatalogosPage";

// 🌟 Importación ATS (Gestión de Análisis de Trabajo Seguro)
import { GestionAtsComponent } from "./components/ats/GestionAtsComponent";

// 🌟 Importación Gestor de Permisos Unitarios de Usuario
import GestorPermisosUsuarios from "./components/gestorUsuarios/GestorPermisosUsuarios";

// 🌟 Landing page pública del cliente (Avenir - Consultora de H&S)
import LandingPageComponent from "./components/landing/LandingPageComponent";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing page pública de presentación de la consultora */}
        <Route path="/" element={<LandingPageComponent />} />

        {/* Pantallas principales - Sprint 1 */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Nuevas rutas - Sprint 2 */}
        <Route path="/empresas" element={<EmpresaComponent />} />
        <Route path="/horarios" element={<RegistroHorarioComponent />} />

        {/* 🌟 Nueva Ruta: Administración de Catálogos IPER */}
        <Route path="/admin/catalogos" element={<AdminCatalogosPage darkMode={true} />} />

        {/* 🌟 Nueva Ruta: Análisis de Trabajo Seguro (ATS) */}
        <Route path="/ats" element={<GestionAtsComponent />} />

        {/* 🌟 Nueva Ruta: Permisos Unitarios por Usuario */}
        <Route path="/admin/permisos-usuario" element={<GestorPermisosUsuarios />} />

        {/* Ruta por defecto si no existe */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default App;