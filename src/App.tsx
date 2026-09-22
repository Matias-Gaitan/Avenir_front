import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginComponent from "./components/login/login";
import Register from "./components/registrer/registrer";
import Home from "./components/home/home";

import EmpresaComponent from "./components/empresa/EmpresaComponent";
import RegistroHorarioComponent from "./components/Horarios/RegistroHorariosComponents";

import { AdminCatalogosPage } from "./components/AdminCatalogosPage";

import { GestionAtsComponent } from "./components/ats/GestionAtsComponent";

import GestorPermisosUsuarios from "./components/gestorUsuarios/GestorPermisosUsuarios";

import LandingPageComponent from "./components/landing/LandingPageComponent";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/" element={<LandingPageComponent />} />

        {}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {}
        <Route path="/empresas" element={<EmpresaComponent />} />
        <Route path="/horarios" element={<RegistroHorarioComponent />} />

        {}
        <Route path="/admin/catalogos" element={<AdminCatalogosPage darkMode={true} />} />

        {}
        <Route path="/ats" element={<GestionAtsComponent />} />

        {}
        <Route path="/admin/permisos-usuario" element={<GestorPermisosUsuarios />} />

        {}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
