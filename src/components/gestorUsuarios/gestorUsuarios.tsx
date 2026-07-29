import React, { useState, useEffect } from "react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./gestorUsuarios.css";

interface Rol {
    idTipoPersona: number;
    nombre: string;
}

interface Usuario {
    idUsuario?: number;
    id?: number;
    nombre: string;
    apellido: string;
    email: string;
    contrasena?: string;
    estado?: boolean;
    activo?: boolean;
    tipoPersona?: Rol;
}

const GestorUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>("PENDIENTES");

    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [idRolSeleccionado, setIdRolSeleccionado] = useState<number | "">("");

    const obtenerEstadoBoolean = (u: Usuario): boolean => {
        if (u.activo !== undefined && u.activo !== null) return Boolean(u.activo);
        if (u.estado !== undefined && u.estado !== null) return Boolean(u.estado);
        return false;
    };

    const esUsuarioPendiente = (u: Usuario): boolean => {
        const esInactivo = !obtenerEstadoBoolean(u);
        const nombreRol = u.tipoPersona?.nombre?.toUpperCase() || "";
        const tieneRolPendiente = nombreRol === "PENDIENTE" || nombreRol === "SIN_ROL" || nombreRol === "";

        return esInactivo || tieneRolPendiente;
    };

    // 🌟 CARGA DE DATOS LIMPIA (Dejamos que api.ts adjunte el token solo)
    const cargarDatos = async () => {
        try {
            const [resUsers, resRoles] = await Promise.all([
                api.get("/usuarios"),
                api.get("/roles")
            ]);

            const usersData = Array.isArray(resUsers.data) ? resUsers.data : [];

            usersData.sort((a, b) => {
                const idA = a.idUsuario ?? a.id ?? 0;
                const idB = b.idUsuario ?? b.id ?? 0;
                return idA - idB;
            });

            setUsuarios(usersData);
            setRoles(Array.isArray(resRoles.data) ? resRoles.data : []);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const limpiarFormulario = () => {
        setNombre("");
        setApellido("");
        setEmail("");
        setContrasena("");
        setIdRolSeleccionado("");
        setModoEdicion(false);
        setIdEditar(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modoEdicion && idEditar) {
                const payloadUpdate: Usuario = {
                    nombre,
                    apellido,
                    email,
                    activo: true,
                    ...(contrasena && { contrasena }),
                    tipoPersona: { idTipoPersona: Number(idRolSeleccionado), nombre: "" }
                };

                await api.put(`/usuarios/${idEditar}`, payloadUpdate);
                alert("¡Usuario actualizado y activado con éxito!");
            } else {
                const payloadCreate = {
                    claveAcceso: "000010001",
                    usuario: {
                        nombre,
                        apellido,
                        email,
                        contrasena,
                        activo: true,
                        tipoPersona: { idTipoPersona: Number(idRolSeleccionado) }
                    }
                };

                await api.post("/usuarios", payloadCreate);
            }

            limpiarFormulario();
            cargarDatos();
        } catch (err: any) {
            console.error("Error al guardar usuario:", err);
            alert(err.response?.data || "Error al procesar la solicitud.");
        }
    };

    const handleEditarClick = (u: Usuario) => {
        setModoEdicion(true);
        setIdEditar(u.idUsuario || u.id || null);
        setNombre(u.nombre);
        setApellido(u.apellido);
        setEmail(u.email);
        setContrasena("");
        setIdRolSeleccionado(u.tipoPersona?.idTipoPersona || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCambiarEstado = async (u: Usuario, estadoActual: boolean) => {
        try {
            const idSeguro = u.idUsuario || u.id;

            if (estadoActual) {
                await api.delete(`/usuarios/${idSeguro}`);
            } else {
                const payloadReactivar = {
                    ...u,
                    estado: true,
                    activo: true
                };
                await api.put(`/usuarios/${idSeguro}`, payloadReactivar);
            }

            cargarDatos();
        } catch (err) {
            console.error("Error al cambiar estado del usuario:", err);
            alert("No se pudo cambiar el estado. Verifica la consola.");
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const estaActivo = obtenerEstadoBoolean(u);
        const esPendiente = esUsuarioPendiente(u);

        if (filtroEstado === "PENDIENTES") return esPendiente;
        if (filtroEstado === "ACTIVOS") return estaActivo === true && !esPendiente;
        if (filtroEstado === "INACTIVOS") return estaActivo === false;
        return true;
    });

    return (
        <div className="gestor-card">
            {((!modoEdicion && tienePermiso("CREAR_USUARIOS")) || (modoEdicion && tienePermiso("EDITAR_USUARIOS"))) && (
                <form onSubmit={handleSubmit} className="form-crud">
                    <h2>{modoEdicion ? "APROBAR / EDITAR USUARIO" : "REGISTRAR NUEVO USUARIO"}</h2>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Apellido</label>
                        <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>{modoEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña (mínimo 6 chars)"}</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required={!modoEdicion}
                        />
                    </div>
                    <div className="form-group">
                        <label>Asignar Rol (Aprobación)</label>
                        <select
                            value={idRolSeleccionado}
                            onChange={(e) => setIdRolSeleccionado(Number(e.target.value))}
                            required
                        >
                            <option value="">Seleccione un Rol para Activar</option>
                            {roles.map((r) => (
                                <option key={r.idTipoPersona} value={r.idTipoPersona}>
                                    {r.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="btn-group-form">
                        <button type="submit" className="btn-guardar">
                            {modoEdicion ? "APROBAR Y ACTIVAR USUARIO" : "CREAR USUARIO"}
                        </button>
                        {modoEdicion && (
                            <button type="button" onClick={limpiarFormulario} className="btn-cancelar">
                                CANCELAR
                            </button>
                        )}
                    </div>
                </form>
            )}

            <hr className="divider" />

            {tienePermiso("VER_USUARIOS") ? (
                <>
                    <div className="listado-header">
                        <h3>LISTADO DE USUARIOS</h3>
                        <div className="filtro-container">
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="select-filtro"
                            >
                                <option value="PENDIENTES">⏳ Pendientes de Aprobación</option>
                                <option value="ACTIVOS">✅ Solo Activos</option>
                                <option value="INACTIVOS">⛔ Solo Inactivos</option>
                                <option value="TODOS">🌐 Todos los usuarios</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="gestor-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.map((u) => {
                                    const esActivo = obtenerEstadoBoolean(u);
                                    const esPendiente = esUsuarioPendiente(u);

                                    return (
                                        <tr key={u.idUsuario || u.id}>
                                            <td>{u.nombre}</td>
                                            <td>{u.apellido}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={esPendiente ? "badge-pendiente-texto" : ""}>
                                                    {u.tipoPersona?.nombre || "Sin Rol"}
                                                </span>
                                            </td>
                                            <td>
                                                {esPendiente ? (
                                                    <span className="badge badge-inactivo" style={{ backgroundColor: "#f59e0b" }}>
                                                        Pendiente
                                                    </span>
                                                ) : (
                                                    <span className={`badge ${esActivo ? "badge-activo" : "badge-inactivo"}`}>
                                                        {esActivo ? "Activo" : "Inactivo"}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="acciones-group">
                                                    {tienePermiso("EDITAR_USUARIOS") && (
                                                        <button
                                                            onClick={() => handleEditarClick(u)}
                                                            className="btn-editar"
                                                        >
                                                            {esPendiente ? "Aprobar y Asignar Rol" : "Editar"}
                                                        </button>
                                                    )}
                                                    {(tienePermiso("DAR_DE_BAJA_USUARIOS") || tienePermiso("ELIMINAR_USUARIOS")) && (
                                                        <button
                                                            onClick={() => handleCambiarEstado(u, esActivo)}
                                                            className={`btn-accion ${esActivo ? "btn-baja" : "btn-alta"}`}
                                                        >
                                                            {esActivo ? "Dar de baja" : "Dar de alta"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>
                    ⚠️ No tenés permisos para visualizar la lista de usuarios.
                </p>
            )}
        </div>
    );
};

export default GestorUsuarios;