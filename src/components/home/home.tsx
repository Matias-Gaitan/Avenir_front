// src/components/home/home.tsx
import React, { useState } from "react";
import GestorUsuarios from "../gestorUsuarios/GestorUsuarios";
import GestorRoles from "../gestorRoles/GestorRoles";
// Importamos los nuevos componentes del Sprint 2
import EmpresaComponent from "../empresa/EmpresaComponent";
import RegistroHorarioComponent from "../Horarios/RegistroHorariosComponents";

const Home: React.FC = () => {
    // Ampliamos el estado para incluir las nuevas vistas
    const [vistaActiva, setVistaActiva] = useState<"usuarios" | "roles" | "empresas" | "horarios">("usuarios");

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F4FBF7" }}>
            {/* Barra de Navegación del Dashboard */}
            <nav style={{
                backgroundColor: "#064E3B",
                padding: "15px 30px",
                display: "flex",
                alignItems: "center",
                gap: "30px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                flexWrap: "wrap" // Para que no se rompa si la pantalla es chica
            }}>
                <h2 style={{ color: "#FFFFFF", margin: 0 }}>Panel de Control</h2>

                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
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
                    {/* Nuevos botones del Sprint 2 */}
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
                </div>
            </nav>

            {/* Contenido Dinámico (Acá renderizamos el gestor que elija) */}
            <div style={{ padding: "20px" }}>
                {vistaActiva === "usuarios" && <GestorUsuarios />}
                {vistaActiva === "roles" && <GestorRoles />}

                {/* Nuevas Vistas del Sprint 2 */}
                {vistaActiva === "empresas" && <EmpresaComponent />}
                {vistaActiva === "horarios" && <RegistroHorarioComponent />}
            </div>
        </div>
    );
};

export default Home;