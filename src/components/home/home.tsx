import React, { useState, useEffect } from "react";
import api from "../../service/api";
import GestorUsuarios from "../gestorUsuarios/gestorUsuarios";
import GestorRoles from "../gestorRoles/gestorRoles";
import EmpresaComponent from "../empresa/EmpresaComponent";
import RegistroHorarioComponent from "../Horarios/RegistroHorariosComponents";

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
    const [vistaActiva, setVistaActiva] = useState<"usuarios" | "roles" | "empresas" | "horarios">("usuarios");
    const [rolesDisponibles, setRolesDisponibles] = useState<RolBD[]>([]);
    const [rolActivoTesting, setRolActivoTesting] = useState<string>("");

    // CONTROL DE ADMIN REAL MEDIANTE ROL ORIGINAL
    const [esAdminReal, setEsAdminReal] = useState<boolean>(false);

    // DATOS DE SESIÓN Y RELOJ
    const [usuarioData, setUsuarioData] = useState({ nombre: "", apellido: "", email: "", rol: "" });
    const [horaActual, setHoraActual] = useState<string>("");
    const [horaInicioSesion, setHoraInicioSesion] = useState<string>("");

    // 🌟 ESTADO Y MANEJO DE MODO OSCURO (NEÓN)
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
        // 1. Reloj en tiempo real
        const actualizarHora = () => {
            const ahora = new Date();
            setHoraActual(ahora.toLocaleTimeString());
        };
        actualizarHora();
        const intervalId = setInterval(actualizarHora, 1000);

        // 2. Hora de inicio de sesión
        let horaLogin = localStorage.getItem("horaInicioSesion");
        if (!horaLogin) {
            horaLogin = new Date().toLocaleTimeString();
            localStorage.setItem("horaInicioSesion", horaLogin);
        }
        setHoraInicioSesion(horaLogin);

        // 3. Cargar sesión
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

        // Mantener simulador si la cuenta original es Admin
        if (rolOriginal === "ADMINISTRADOR" || rolSimuladoActual === "ADMINISTRADOR") {
            setEsAdminReal(true);
            if (!localStorage.getItem("rolOriginal")) {
                localStorage.setItem("rolOriginal", "ADMINISTRADOR");
            }
        }

        cargarListaRoles();

        // 🌟 ESCUCHADOR EN VIVO DE CAMBIOS EN LOS ROLES
        const handleEventoRolesActualizados = () => {
            cargarListaRoles();
        };

        window.addEventListener("rolesActualizados", handleEventoRolesActualizados);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("rolesActualizados", handleEventoRolesActualizados);
        };
    }, []);

    // 🌟 CAMBIO DE ROL CON CONSULTA EN TIEMPO REAL A BD DE LOS PERMISOS
    const handleCambiarRolTesting = async (nombreNuevoRol: string) => {
        const usuarioStorage = localStorage.getItem("usuario");
        if (!usuarioStorage) return;

        try {
            // Traemos los roles frescos directamente de la base de datos
            const res = await api.get("/roles");
            const rolesFrescos: RolBD[] = Array.isArray(res.data) ? res.data : rolesDisponibles;

            const rolEncontrado = rolesFrescos.find(
                (r) => r.nombre.toUpperCase() === nombreNuevoRol.toUpperCase()
            );

            const usuarioObj = JSON.parse(usuarioStorage);

            // Extraemos los nombres de permisos frescos
            let nuevosPermisos: string[] = [];
            if (rolEncontrado && Array.isArray(rolEncontrado.permisos)) {
                nuevosPermisos = rolEncontrado.permisos.map((p) => typeof p === 'string' ? p : p.nombre);
            }

            // Si es Admin, tiene acceso total siempre
            if (nombreNuevoRol.toUpperCase() === "ADMINISTRADOR") {
                nuevosPermisos = ["*"];
            }

            usuarioObj.rol = nombreNuevoRol.toUpperCase();
            usuarioObj.permisos = nuevosPermisos;

            // Actualizamos localStorage con los permisos actualizados de la BD
            localStorage.setItem("usuario", JSON.stringify(usuarioObj));
            setRolActivoTesting(nombreNuevoRol.toUpperCase());

            // Recargamos para que authHelper lea los nuevos permisos
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
                padding: "12px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: darkMode ? "0 0 15px rgba(16,185,129,0.2)" : "0 4px 6px rgba(0,0,0,0.1)",
                flexWrap: "wrap",
                gap: "15px",
                transition: "all 0.3s ease"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                    <h2 style={{
                        color: darkMode ? "#38BDF8" : "#FFFFFF",
                        margin: 0,
                        textShadow: darkMode ? "0 0 8px rgba(56,189,248,0.4)" : "none"
                    }}>
                        Panel de Control
                    </h2>

                    {/* INFORMACIÓN COMPLETA DE SESIÓN */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        backgroundColor: darkMode ? "#111827" : "#042F2E",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        border: darkMode ? "1px solid #38BDF8" : "1px solid #14B8A6"
                    }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.85rem" }}>
                            <span style={{ color: darkMode ? "#38BDF8" : "#A7F3D0", fontWeight: "600" }}>
                                👤 {usuarioData.nombre} {usuarioData.apellido}
                            </span>
                            <span style={{ color: "#6EE7B7" }}>|</span>
                            <span style={{ color: darkMode ? "#E2E8F0" : "#A7F3D0" }}>📧 {usuarioData.email}</span>
                            <span style={{ color: "#6EE7B7" }}>|</span>
                            <span style={{ color: "#FDE047", fontWeight: "bold" }}>🔑 Rol: {usuarioData.rol}</span>
                        </div>
                        <div style={{ display: "flex", gap: "15px", alignItems: "center", fontSize: "0.8rem", color: "#E2E8F0" }}>
                            <span>▶ Ingreso: <strong>{horaInicioSesion}</strong></span>
                            <span>🕒 Actual: <strong>{horaActual}</strong></span>
                        </div>
                    </div>

                    {/* 🧪 SIMULADOR (FIJO SI LA CUENTA ORIGINAL ES ADMIN) */}
                    {esAdminReal && (
                        <div className="simulador-card" style={{
                            backgroundColor: darkMode ? "#1F2937" : "#065F46",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            border: darkMode ? "1px solid #10B981" : "1px dashed #34D399"
                        }}>
                            <span style={{ color: darkMode ? "#10B981" : "#99F6E4", fontSize: "0.8rem", fontWeight: "bold" }}>
                                🧪 Simular Rol:
                            </span>
                            <select
                                value={rolActivoTesting}
                                onChange={(e) => handleCambiarRolTesting(e.target.value)}
                                style={{
                                    backgroundColor: darkMode ? "#111827" : "#047857",
                                    color: "#FFFFFF",
                                    border: darkMode ? "1px solid #10B981" : "1px solid #10B981",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
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

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button onClick={() => setVistaActiva("usuarios")} style={{ backgroundColor: vistaActiva === "usuarios" ? "#22C55E" : "transparent", color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Gestor de Usuarios</button>
                    <button onClick={() => setVistaActiva("roles")} style={{ backgroundColor: vistaActiva === "roles" ? "#22C55E" : "transparent", color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Gestor de Roles</button>
                    <button onClick={() => setVistaActiva("empresas")} style={{ backgroundColor: vistaActiva === "empresas" ? "#22C55E" : "transparent", color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Gestor de Empresas</button>
                    <button onClick={() => setVistaActiva("horarios")} style={{ backgroundColor: vistaActiva === "horarios" ? "#22C55E" : "transparent", color: "#FFFFFF", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Registro de Horarios</button>

                    {/* 🌙 SWITCH MODO NEÓN / MODO CLARO */}
                    <button type="button" className="theme-toggle-btn" onClick={toggleDarkMode}>
                        {darkMode ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
                    </button>

                    <button
                        onClick={handleCerrarSesion}
                        style={{
                            backgroundColor: "#EF4444",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            marginLeft: "10px"
                        }}
                    >
                        Cerrar Sesión 🚪
                    </button>
                </div>
            </nav>

            <div style={{ padding: "20px" }}>
                {vistaActiva === "usuarios" && <GestorUsuarios />}
                {vistaActiva === "roles" && <GestorRoles />}
                {vistaActiva === "empresas" && <EmpresaComponent />}
                {vistaActiva === "horarios" && <RegistroHorarioComponent />}
            </div>
        </div>
    );
};

export default Home;