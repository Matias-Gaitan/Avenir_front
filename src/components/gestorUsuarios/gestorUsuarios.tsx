import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorUsuarios.css";

interface Rol {
    idTipoPersona: number;
    nombre: string;
}

interface Usuario {
    idUsuario?: number;
    id?: number; // 🔹 Seguro anti-fallos
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
    const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [idRolSeleccionado, setIdRolSeleccionado] = useState<number | "">("");

    const obtenerEstadoBoolean = (u: Usuario): boolean => {
        return u.estado ?? u.activo ?? true;
    };

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [resUsers, resRoles] = await Promise.all([
                api.get("/usuarios", { headers }),
                api.get("/roles", { headers })
            ]);

            const usersData = Array.isArray(resUsers.data) ? resUsers.data : [];

            // 🔹 MAGIA: Ordenamos la lista por ID para que las filas no salten
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
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (modoEdicion && idEditar) {
                const payloadUpdate: Usuario = {
                    nombre,
                    apellido,
                    email,
                    ...(contrasena && { contrasena }),
                    tipoPersona: { idTipoPersona: Number(idRolSeleccionado), nombre: "" }
                };

                await api.put(`/usuarios/${idEditar}`, payloadUpdate, { headers });
            } else {
                const payloadCreate = {
                    claveAcceso: "000010001",
                    usuario: {
                        nombre,
                        apellido,
                        email,
                        contrasena,
                        tipoPersona: { idTipoPersona: Number(idRolSeleccionado) }
                    }
                };

                await api.post("/usuarios", payloadCreate, { headers });
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
        // 🔹 Usamos el seguro anti-fallos
        setIdEditar(u.idUsuario || u.id || null);
        setNombre(u.nombre);
        setApellido(u.apellido);
        setEmail(u.email);
        setContrasena("");
        setIdRolSeleccionado(u.tipoPersona?.idTipoPersona || "");
    };

    const handleCambiarEstado = async (u: Usuario, estadoActual: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const idSeguro = u.idUsuario || u.id; // 🔹 Seguro anti-fallos

            if (estadoActual) {
                await api.delete(`/usuarios/${idSeguro}`, { headers });
            } else {
                const payloadReactivar = {
                    ...u,
                    estado: true,
                    activo: true
                };
                await api.put(`/usuarios/${idSeguro}`, payloadReactivar, { headers });
            }

            cargarDatos();
        } catch (err) {
            console.error("Error al cambiar estado del usuario:", err);
            alert("No se pudo cambiar el estado. Verifica la consola.");
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const estaActivo = obtenerEstadoBoolean(u);
        if (filtroEstado === "ACTIVOS") return estaActivo === true;
        if (filtroEstado === "INACTIVOS") return estaActivo === false;
        return true;
    });

    return (
        <div className="gestor-card">
            <h2>{modoEdicion ? "EDITAR USUARIO" : "REGISTRAR NUEVO USUARIO"}</h2>

            <form onSubmit={handleSubmit} className="form-crud">
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
                    <label>Rol de Usuario</label>
                    <select
                        value={idRolSeleccionado}
                        onChange={(e) => setIdRolSeleccionado(Number(e.target.value))}
                        required
                    >
                        <option value="">Seleccione un Rol</option>
                        {roles.map((r) => (
                            <option key={r.idTipoPersona} value={r.idTipoPersona}>
                                {r.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="btn-group-form">
                    <button type="submit" className="btn-guardar">
                        {modoEdicion ? "ACTUALIZAR" : "CREAR USUARIO"}
                    </button>
                    {modoEdicion && (
                        <button type="button" onClick={limpiarFormulario} className="btn-cancelar">
                            CANCELAR
                        </button>
                    )}
                </div>
            </form>

            <hr className="divider" />

            <div className="listado-header">
                <h3>LISTADO DE USUARIOS</h3>
                <div className="filtro-container">
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="select-filtro"
                    >
                        <option value="TODOS">Todos los usuarios</option>
                        <option value="ACTIVOS">Solo Activos</option>
                        <option value="INACTIVOS">Solo Inactivos</option>
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
                            return (
                                <tr key={u.idUsuario || u.id}> {/* 🔹 Seguro anti-fallos */}
                                    <td>{u.nombre}</td>
                                    <td>{u.apellido}</td>
                                    <td>{u.email}</td>
                                    <td>{u.tipoPersona?.nombre || "Sin Rol"}</td>
                                    <td>
                                        <span className={`badge ${esActivo ? "badge-activo" : "badge-inactivo"}`}>
                                            {esActivo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-group">
                                            <button
                                                onClick={() => handleEditarClick(u)}
                                                className="btn-editar"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleCambiarEstado(u, esActivo)}
                                                className={`btn-accion ${esActivo ? "btn-baja" : "btn-alta"}`}
                                            >
                                                {esActivo ? "Dar de baja" : "Dar de alta"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestorUsuarios;