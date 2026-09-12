import React, { useEffect, useState } from "react";
import { UserCircle2, ShieldCheck, KeyRound, Save, Eye, EyeOff } from "lucide-react";
import api from "../../service/api";
import { AddressAutocomplete, type UbicacionSeleccionada } from "../common/AddressAutocomplete";
import "./estado.css";

interface UsuarioSesion {
    nombre?: string;
    apellido?: string;
    username?: string;
    rol?: string;
    permisos?: string[];
}

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// US: Como usuario quiero editar mis propios datos (mail, contraseña, telefono, direccion)
// y visualizar el rol que tengo y los permisos asociados (UH-36)
const MiPerfilComponent: React.FC = () => {
    const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion>({});
    const emailActual = localStorage.getItem("email") || "";

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [geoData, setGeoData] = useState<Partial<UbicacionSeleccionada>>({});
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const guardado = localStorage.getItem("usuario");
        if (guardado) {
            try {
                setUsuarioSesion(JSON.parse(guardado));
            } catch (err) {
                console.error("Error al leer los datos de sesión", err);
            }
        }

        // Traemos los datos completos y actualizados desde el backend (telefono, direccion, etc.)
        api.get("/usuarios", obtenerHeaders())
            .then((res) => {
                const propio = Array.isArray(res.data) ? res.data.find((u: any) => u.email === emailActual) : null;
                if (propio) {
                    setNombre(propio.nombre || "");
                    setApellido(propio.apellido || "");
                    setEmail(propio.email || "");
                    setTelefono(propio.telefono || "");
                    setDireccion(propio.direccion || "");
                }
            })
            .catch((err) => console.error("Error al cargar mis datos", err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const esAdmin = (usuarioSesion.rol || "").toUpperCase() === "ADMINISTRADOR";
    const inicial = (nombre || emailActual || "?").charAt(0).toUpperCase();

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        setGuardando(true);
        try {
            const payload: Record<string, unknown> = {
                nombre, apellido, email, telefono, direccion,
                ...geoData
            };
            if (nuevaContrasena.trim()) {
                payload.contrasena = nuevaContrasena;
            }

            await api.put("/usuarios/mi-perfil", payload, obtenerHeaders());

            // Si cambio el email, hay que actualizar lo que usamos como identificador de sesion
            if (email && email !== emailActual) {
                localStorage.setItem("email", email);
            }
            const sesionActualizada = { ...usuarioSesion, nombre, apellido };
            localStorage.setItem("usuario", JSON.stringify(sesionActualizada));
            setUsuarioSesion(sesionActualizada);

            setMensaje("Perfil actualizado con éxito.");
            setNuevaContrasena("");
        } catch (err: any) {
            setError(err.response?.data || "Error al actualizar el perfil.");
        } finally {
            setGuardando(false);
        }
    };

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
                            {nombre || "Usuario"} {apellido || ""}
                        </strong>
                        <p style={{ margin: "2px 0", color: "#64748b", fontSize: "0.85rem" }}>{emailActual}</p>
                        <span className="perfil-rol-badge">
                            <ShieldCheck size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                            {usuarioSesion.rol || "SIN ROL"}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleGuardar} className="documentos-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    <div className="form-section">
                        <label>Nombre</label>
                        <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="form-section">
                        <label>Apellido</label>
                        <input className="form-input" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                    </div>
                    <div className="form-section">
                        <label>Email</label>
                        <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-section">
                        <label>Teléfono</label>
                        <input className="form-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 351 555-1234" />
                    </div>
                    <div className="form-section" style={{ gridColumn: "span 2" }}>
                        <label>Dirección</label>
                        <AddressAutocomplete
                            value={direccion}
                            placeholder="Escribí tu dirección..."
                            onSelectAddress={(data) => {
                                setDireccion(data.direccionCompleta);
                                setGeoData(data);
                            }}
                        />
                    </div>
                    <div className="form-section" style={{ gridColumn: "span 2" }}>
                        <label>Nueva contraseña (dejar en blanco para no cambiarla)</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                className="form-input"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                style={{ paddingRight: "40px" }}
                            />
                            <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                                {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="form-section" style={{ justifyContent: "flex-end" }}>
                        <button type="submit" className="btn-primario" disabled={guardando}>
                            <Save size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                            {guardando ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>

                {error && <p className="msg-error">{error}</p>}
                {mensaje && <p className="msg-exito">{mensaje}</p>}
            </div>

            <div className="estado-card">
                <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#064e3b", marginBottom: "10px" }}>
                    <KeyRound size={16} /> Permisos Asociados
                </strong>

                {esAdmin ? (
                    <p className="txt-vacio">El rol ADMINISTRADOR tiene acceso total a todos los módulos del sistema.</p>
                ) : usuarioSesion.permisos && usuarioSesion.permisos.length > 0 ? (
                    <div className="permisos-grid">
                        {usuarioSesion.permisos.map((p) => (
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
