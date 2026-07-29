import React, { useState, useEffect } from "react";
import api from "../../service/api";
import GestorUsuarios from "../gestorUsuarios/gestorUsuarios";
import GestorRoles from "../gestorRoles/gestorRoles";
import EmpresaComponent from "../empresa/EmpresaComponent";
import RegistroHorarioComponent from "../Horarios/RegistroHorariosComponents";

interface RolBD {
    idTipoPersona: number;
    nombre: string;
    permisos?: { idPermiso: number; nombre: string }[];
}

const Home: React.FC = () => {
    const [vistaActiva, setVistaActiva] = useState<"usuarios" | "roles" | "empresas" | "horarios">("usuarios");
    const [rolesDisponibles, setRolesDisponibles] = useState<RolBD[]>([]);
    const [rolActivoTesting, setRolActivoTesting] = useState<string>("");

    useEffect(() => {
        // Cargar el rol actual almacenado
        const usuarioStorage = localStorage.getItem("usuario");
        if (usuarioStorage) {
            try {
                const u = JSON.parse(usuarioStorage);
                setRolActivoTesting(u.rol || "ADMINISTRADOR");
            } catch (e) {
                console.error("Error al parsear usuario:", e);
            }
        }

        // Cargar lista de roles para el selector de testing
        cargarListaRoles();
    }, []);

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

    // 🧪 Cambiar Rol en Vivo sin Cerrar Sesión
    const handleCambiarRolTesting = (nombreNuevoRol: string) => {
        const usuarioStorage = localStorage.getItem("usuario");
        if (!usuarioStorage) return;

        try {
            const usuarioObj = JSON.parse(usuarioStorage);
            const rolEncontrado = rolesDisponibles.find(
                (r) => r.nombre.toUpperCase() === nombreNuevoRol.toUpperCase()
            );

            // Extraemos los permisos asociados al rol seleccionado
            const nuevosPermisos = rolEncontrado?.permisos
                ? rolEncontrado.permisos.map((p) => p.nombre)
                : usuarioObj.permisos || [];

            usuarioObj.rol = nombreNuevoRol.toUpperCase();
            usuarioObj.permisos = nuevosPermisos;

            localStorage.setItem("usuario", JSON.stringify(usuarioObj));
            setRolActivoTesting(nombreNuevoRol.toUpperCase());

            // Refrescamos pantalla para aplicar los nuevos permisos inmediatamente
            window.location.reload();
        } catch (err) {
            console.error("Error al cambiar rol para testing:", err);
        }
    };

    // 🚪 Función para Cerrar Sesión
    const handleCerrarSesion = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F4FBF7" }}>
            <nav style={{
                backgroundColor: "#064E3B",
                padding: "15px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                flexWrap: "wrap",
                gap: "15px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <h2 style={{ color: "#FFFFFF", margin: 0 }}>Panel de Control</h2>

                    {/* 🧪 SELECTOR DE ROLES EN VIVO PARA TESTEAR PERMISOS */}
                    <div style={{
                        backgroundColor: "#042F2E",
                        padding: "5px 12px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "1px solid #14B8A6"
                    }}>
                        <span style={{ color: "#99F6E4", fontSize: "0.85rem", fontWeight: "bold" }}>
                            🧪 Probando Rol:
                        </span>
                        <select
                            value={rolActivoTesting}
                            onChange={(e) => handleCambiarRolTesting(e.target.value)}
                            style={{
                                backgroundColor: "#065F46",
                                color: "#FFFFFF",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "0.85rem"
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
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setVistaActiva("usuarios")}
                        style={{
                            backgroundColor: vistaActiva === "usuarios" ? "#22C55E" : "transparent",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "0.3s"
                        }}
                    >
                        Gestor de Usuarios
                    </button>
                    <button
                        onClick={() => setVistaActiva("roles")}
                        style={{
                            backgroundColor: vistaActiva === "roles" ? "#22C55E" : "transparent",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "0.3s"
                        }}
                    >
                        Gestor de Roles
                    </button>
                    <button
                        onClick={() => setVistaActiva("empresas")}
                        style={{
                            backgroundColor: vistaActiva === "empresas" ? "#22C55E" : "transparent",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "0.3s"
                        }}
                    >
                        Gestor de Empresas
                    </button>
                    <button
                        onClick={() => setVistaActiva("horarios")}
                        style={{
                            backgroundColor: vistaActiva === "horarios" ? "#22C55E" : "transparent",
                            color: "#FFFFFF",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            transition: "0.3s"
                        }}
                    >
                        Registro de Horarios
                    </button>

                    {/* 🚪 BOTÓN CERRAR SESIÓN */}
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
                            marginLeft: "15px",
                            transition: "0.3s"
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