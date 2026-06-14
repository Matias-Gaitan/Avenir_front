// src/components/home/home.tsx
import React, { useState } from "react";
import GestorUsuarios from "../gestorUsuarios/GestorUsuarios";
import GestorRoles from "../gestorRoles/GestorRoles"; // <-- Importación habilitada

const Home: React.FC = () => {
    // Estado para saber qué pestaña está viendo el usuario
    const [vistaActiva, setVistaActiva] = useState<"usuarios" | "roles">("usuarios");

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F4FBF7" }}>
            {/* Barra de Navegación del Dashboard */}
            <nav style={{
                backgroundColor: "#064E3B",
                padding: "15px 30px",
                display: "flex",
                alignItems: "center",
                gap: "30px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ color: "#FFFFFF", margin: 0 }}>Panel de Control</h2>

                <div style={{ display: "flex", gap: "15px" }}>
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
                </div>
            </nav>

            {/* Contenido Dinámico (Acá renderizamos el gestor que elija) */}
            <div style={{ padding: "20px" }}>
                {vistaActiva === "usuarios" && <GestorUsuarios />}

                {/* Llamamos al componente oficial del Gestor de Roles */}
                {vistaActiva === "roles" && <GestorRoles />}
            </div>
        </div>
    );
};

export default Home;