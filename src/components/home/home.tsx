import React, { useState, useEffect } from "react";
import {
  Users,
  Key,
  Building2,
  Clock,
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  FlaskConical,
  User,
  Mail,
  ShieldCheck,
  FileCheck,
  ClipboardList,
  MapPin,
  UserCheck
} from "lucide-react";
import api from "../../service/api";
import GestorUsuarios from "../gestorUsuarios/gestorUsuarios";
import GestorRoles from "../gestorRoles/gestorRoles";
import EmpresaComponent from "../empresa/EmpresaComponent";
import RegistroHorarioComponent from "../Horarios/RegistroHorariosComponents";
import { AdminCatalogosPage } from "../AdminCatalogosPage";
import { GestionAtsComponent } from "../ats/GestionAtsComponent";
import { IperFormularioWizard } from "../IperFormularioWizard";
import GestorPermisosUsuarios from "../gestorUsuarios/GestorPermisosUsuarios";
import { MapaGeolocalizacion } from "../mapa/MapaGeolocalizacion";

interface PermisoBD {
    idPermiso?: number;
    nombre: string;
}

interface RolBD {
    idTipoPersona: number;
    nombre: string;
    permisos?: PermisoBD[];
}

const Home: React.FC = () => {
    const [vistaActiva, setVistaActiva] = useState<"usuarios" | "roles" | "empresas" | "horarios" | "iper" | "iper-form" | "ats" | "permisos-usuario" | "mapa">("usuarios");
    const [rolesDisponibles, setRolesDisponibles] = useState<RolBD[]>([]);
    const [rolActivoTesting, setRolActivoTesting] = useState<string>("");

    const [esAdminReal, setEsAdminReal] = useState<boolean>(false);

    const [usuarioData, setUsuarioData] = useState({ nombre: "", apellido: "", email: "", rol: "" });
    const [horaActual, setHoraActual] = useState<string>("");
    const [horaInicioSesion, setHoraInicioSesion] = useState<string>("");

    const [darkMode, setDarkMode] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    const cargarListaRoles = async () => {
        try {
            const res = await api.get("/roles");
            if (Array.isArray(res.data)) {
                setRolesDisponibles(res.data);
            }
        } catch (err) {
            console.error("Error al cargar roles para testing:", err);
        }
    };

    useEffect(() => {
        const actualizarHora = () => {
            const ahora = new Date();
            setHoraActual(ahora.toLocaleTimeString());
        };
        actualizarHora();
        const intervalId = setInterval(actualizarHora, 1000);

        let horaLogin = localStorage.getItem("horaInicioSesion");
        if (!horaLogin) {
            horaLogin = new Date().toLocaleTimeString();
            localStorage.setItem("horaInicioSesion", horaLogin);
        }
        setHoraInicioSesion(horaLogin);

        const email = localStorage.getItem("email") || "";
        const rolOriginal = (localStorage.getItem("rolOriginal") || "").toUpperCase();

        let rolSimuladoActual = "PENDIENTE";
        let nombre = "";
        let apellido = "";

        const usuarioStorage = localStorage.getItem("usuario");
        if (usuarioStorage) {
            try {
                const u = JSON.parse(usuarioStorage);
                rolSimuladoActual = u.rol ? String(u.rol).toUpperCase() : "PENDIENTE";
                nombre = u.nombre || "";
                apellido = u.apellido || "";
            } catch (e) {
                console.error("Error al parsear usuario:", e);
            }
        }

        setUsuarioData({ nombre, apellido, email, rol: rolSimuladoActual });
        setRolActivoTesting(rolSimuladoActual);

        if (rolOriginal === "ADMINISTRADOR" || rolSimuladoActual === "ADMINISTRADOR") {
            setEsAdminReal(true);
            if (!localStorage.getItem("rolOriginal")) {
                localStorage.setItem("rolOriginal", "ADMINISTRADOR");
            }
        }

        cargarListaRoles();

        const handleEventoRolesActualizados = () => {
            cargarListaRoles();
        };

        window.addEventListener("rolesActualizados", handleEventoRolesActualizados);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("rolesActualizados", handleEventoRolesActualizados);
        };
    }, []);

    const handleCambiarRolTesting = async (nombreNuevoRol: string) => {
        const usuarioStorage = localStorage.getItem("usuario");
        if (!usuarioStorage) return;

        try {
            const res = await api.get("/roles");
            const rolesFrescos: RolBD[] = Array.isArray(res.data) ? res.data : rolesDisponibles;

            const rolEncontrado = rolesFrescos.find(
                (r) => r.nombre.toUpperCase() === nombreNuevoRol.toUpperCase()
            );

            const usuarioObj = JSON.parse(usuarioStorage);

            let nuevosPermisos: string[] = [];
            if (rolEncontrado && Array.isArray(rolEncontrado.permisos)) {
                nuevosPermisos = rolEncontrado.permisos.map((p) => typeof p === 'string' ? p : p.nombre);
            }

            if (nombreNuevoRol.toUpperCase() === "ADMINISTRADOR") {
                nuevosPermisos = ["*"];
            }

            usuarioObj.rol = nombreNuevoRol.toUpperCase();
            usuarioObj.permisos = nuevosPermisos;

            localStorage.setItem("usuario", JSON.stringify(usuarioObj));
            setRolActivoTesting(nombreNuevoRol.toUpperCase());

            window.location.reload();
        } catch (err) {
            console.error("Error al cambiar rol para testing:", err);
            window.location.reload();
        }
    };

    const handleCerrarSesion = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div style={{ minHeight: "100vh" }}>
            <nav style={{
                backgroundColor: darkMode ? "#0B132B" : "#064E3B",
                borderBottom: darkMode ? "1px solid #10B981" : "none",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: darkMode ? "0 0 15px rgba(16,185,129,0.2)" : "0 4px 6px rgba(0,0,0,0.1)",
                flexWrap: "wrap",
                gap: "12px",
                transition: "all 0.3s ease"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                    <h2 style={{
                        color: darkMode ? "#38BDF8" : "#FFFFFF",
                        margin: 0,
                        fontSize: "1.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <ShieldCheck size={24} color={darkMode ? "#38BDF8" : "#34D399"} />
                        Panel de Control
                    </h2>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        backgroundColor: darkMode ? "#111827" : "#042F2E",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: darkMode ? "1px solid #38BDF8" : "1px solid #14B8A6"
                    }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem" }}>
                            <span style={{ color: darkMode ? "#38BDF8" : "#A7F3D0", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                                <User size={13} /> {usuarioData.nombre} {usuarioData.apellido}
                            </span>
                            <span style={{ color: "#6EE7B7" }}>|</span>
                            <span style={{ color: darkMode ? "#E2E8F0" : "#A7F3D0", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Mail size={13} /> {usuarioData.email}
                            </span>
                            <span style={{ color: "#6EE7B7" }}>|</span>
                            <span style={{ color: "#FDE047", fontWeight: "bold" }}>Rol: {usuarioData.rol}</span>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.75rem", color: "#E2E8F0" }}>
                            <span>Ingreso: <strong>{horaInicioSesion}</strong></span>
                            <span>Actual: <strong>{horaActual}</strong></span>
                        </div>
                    </div>

                    {esAdminReal && (
                        <div className="simulador-card" style={{
                            backgroundColor: darkMode ? "#1F2937" : "#065F46",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            border: darkMode ? "1px solid #10B981" : "1px dashed #34D399"
                        }}>
                            <span style={{ color: darkMode ? "#10B981" : "#99F6E4", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FlaskConical size={13} /> Simular Rol:
                            </span>
                            <select
                                value={rolActivoTesting}
                                onChange={(e) => handleCambiarRolTesting(e.target.value)}
                                style={{
                                    backgroundColor: darkMode ? "#111827" : "#047857",
                                    color: "#FFFFFF",
                                    border: "1px solid #10B981",
                                    padding: "3px 6px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "0.75rem",
                                    outline: "none"
                                }}
                            >
                                <option value="ADMINISTRADOR">ADMINISTRADOR (Todo Habilitado)</option>
                                {rolesDisponibles
                                    .filter((r) => r.nombre.toUpperCase() !== "ADMINISTRADOR")
                                    .map((r) => (
                                        <option key={r.idTipoPersona} value={r.nombre.toUpperCase()}>
                                            {r.nombre.toUpperCase()}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* BOTONES DE NAVEGACIÓN SUPERIOR INTEGRADOS */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setVistaActiva("usuarios")} style={{ backgroundColor: vistaActiva === "usuarios" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><Users size={15} /> Usuarios</button>
                    <button onClick={() => setVistaActiva("permisos-usuario")} style={{ backgroundColor: vistaActiva === "permisos-usuario" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><UserCheck size={15} /> Permisos Empleado</button>
                    <button onClick={() => setVistaActiva("roles")} style={{ backgroundColor: vistaActiva === "roles" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><Key size={15} /> Roles</button>
                    <button onClick={() => setVistaActiva("empresas")} style={{ backgroundColor: vistaActiva === "empresas" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><Building2 size={15} /> Empresas</button>
                    <button onClick={() => setVistaActiva("horarios")} style={{ backgroundColor: vistaActiva === "horarios" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><Clock size={15} /> Horarios</button>
                    <button onClick={() => setVistaActiva("iper")} style={{ backgroundColor: vistaActiva === "iper" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><ShieldAlert size={15} className="icon-pulse" /> Parámetros IPER</button>
                    <button onClick={() => setVistaActiva("iper-form")} style={{ backgroundColor: vistaActiva === "iper-form" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><ClipboardList size={15} /> Formulario IPER</button>
                    <button onClick={() => setVistaActiva("ats")} style={{ backgroundColor: vistaActiva === "ats" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><FileCheck size={15} /> ATS Campo</button>
                    <button onClick={() => setVistaActiva("mapa")} style={{ backgroundColor: vistaActiva === "mapa" ? "#059669" : "transparent", color: "#FFFFFF", border: "none", padding: "6px 10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "5px" }} className="btn-interactive"><MapPin size={15} /> Mapa 2D</button>

                    <button type="button" className="theme-toggle-btn btn-interactive" onClick={toggleDarkMode} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px", fontSize: "0.8rem" }}>
                        {darkMode ? <Moon size={15} /> : <Sun size={15} />}
                        {darkMode ? "Oscuro" : "Claro"}
                    </button>

                    <button
                        onClick={handleCerrarSesion}
                        className="btn-interactive"
                        style={{
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <LogOut size={15} /> Salir
                    </button>
                </div>
            </nav>

            <div style={{ padding: "20px" }}>
                {vistaActiva === "usuarios" && <GestorUsuarios />}
                {vistaActiva === "permisos-usuario" && <GestorPermisosUsuarios />}
                {vistaActiva === "roles" && <GestorRoles />}
                {vistaActiva === "empresas" && <EmpresaComponent />}
                {vistaActiva === "horarios" && <RegistroHorarioComponent />}
                {vistaActiva === "iper" && <AdminCatalogosPage darkMode={darkMode} />}
                {vistaActiva === "iper-form" && <IperFormularioWizard />}
                {vistaActiva === "ats" && <GestionAtsComponent />}
                {vistaActiva === "mapa" && <MapaGeolocalizacion darkMode={darkMode} />}
            </div>
        </div>
    );
};

export default Home;