import React, { useEffect, useState } from "react";
import { UserCircle2, ShieldCheck, KeyRound } from "lucide-react";
import "./estado.css";

interface UsuarioSesion {
    nombre?: string;
    apellido?: string;
    username?: string;
    rol?: string;
    permisos?: string[];
}

// US: Como usuario quiero visualizar el rol que tengo y los permisos asociados (UH-36)
const MiPerfilComponent: React.FC = () => {
    const [usuario, setUsuario] = useState<UsuarioSesion>({});
    const email = localStorage.getItem("email") || "";

    useEffect(() => {
        const guardado = localStorage.getItem("usuario");
        if (guardado) {
            try {
                setUsuario(JSON.parse(guardado));
            } catch (err) {
                console.error("Error al leer los datos de sesión", err);
            }
        }
    }, []);

    const esAdmin = (usuario.rol || "").toUpperCase() === "ADMINISTRADOR";
    const inicial = (usuario.nombre || email || "?").charAt(0).toUpperCase();

    return (
        <div className="estado-container">
            <div className="estado-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <UserCircle2 size={24} color="#059669" /> MI PERFIL
                </h1>

                <div className="perfil-header">
                    <div className="perfil-avatar">{inicial}</div>
                    <div>
                        <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>
                            {usuario.nombre || "Usuario"} {usuario.apellido || ""}
                        </strong>
                        <p style={{ margin: "2px 0", color: "#64748b", fontSize: "0.85rem" }}>{email}</p>
                        <span className="perfil-rol-badge">
                            <ShieldCheck size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                            {usuario.rol || "SIN ROL"}
                        </span>
                    </div>
                </div>

                <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#064e3b", marginBottom: "10px" }}>
                    <KeyRound size={16} /> Permisos Asociados
                </strong>

                {esAdmin ? (
                    <p className="txt-vacio">El rol ADMINISTRADOR tiene acceso total a todos los módulos del sistema.</p>
                ) : usuario.permisos && usuario.permisos.length > 0 ? (
                    <div className="permisos-grid">
                        {usuario.permisos.map((p) => (
                            <div key={p} className="permiso-chip">{p}</div>
                        ))}
                    </div>
                ) : (
                    <p className="txt-vacio">Todavía no tenés permisos asignados. Contactá a un administrador.</p>
                )}
            </div>
        </div>
    );
};

export default MiPerfilComponent;
