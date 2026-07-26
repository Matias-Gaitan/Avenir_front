import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorUsuarios.css";

interface Rol {
    idTipoPersona: number;
    nombre: string;
}

interface Usuario {
    idUsuario?: number;
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

    // Estados para el Formulario de Crear / Editar
    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [idRolSeleccionado, setIdRolSeleccionado] = useState<number | "">("");

    // Helper para determinar si un usuario está activo (soporta 'estado', 'activo' o true por defecto)
    const obtenerEstadoBoolean = (u: Usuario): boolean => {
        return u.estado ?? u.activo ?? true;
    };

    // 1. Cargar Usuarios y Roles
    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [resUsers, resRoles] = await Promise.all([
                api.get("/usuarios", { headers }),
                api.get("/roles", { headers })
            ]);

            setUsuarios(Array.isArray(resUsers.data) ? resUsers.data : []);
            setRoles(Array.isArray(resRoles.data) ? resRoles.data : []);
        } catch (err) {
            console.error("Error al cargar datos:", err);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    // 2. Limpiar Formulario
    const limpiarFormulario = () => {
        setNombre("");
        setApellido("");
        setEmail("");
        setContrasena("");
        setIdRolSeleccionado("");
        setModoEdicion(false);
        setIdEditar(null);
    };

    // 3. CREATE / UPDATE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (modoEdicion && idEditar) {
                // UPDATE: Envía el objeto Usuario directamente al PUT /usuarios/{id}
                const payloadUpdate: Usuario = {
                    nombre,
                    apellido,
                    email,
                    ...(contrasena && { contrasena }), // Envía la contraseña solo si se escribió una nueva
                    tipoPersona: { idTipoPersona: Number(idRolSeleccionado), nombre: "" }
                };

                await api.put(`/usuarios/${idEditar}`, payloadUpdate, { headers });
            } else {
                // CREATE: Envía el wrapper UsuarioRequest que espera Spring Boot
                const payloadCreate = {
                    claveAcceso: "000010001", // Clave requerida por tu Controller
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

    // 4. Preparar Edición
    const handleEditarClick = (u: Usuario) => {
        setModoEdicion(true);
        setIdEditar(u.idUsuario || null);
        setNombre(u.nombre);
        setApellido(u.apellido);
        setEmail(u.email);
        setContrasena(""); // Dejar vacío en edición por seguridad
        setIdRolSeleccionado(u.tipoPersona?.idTipoPersona || "");
    };

    // 5. DAR DE BAJA LÓGICA (DELETE) / REACTIVAR (PUT)
    // ¡OJO ACÁ! Recibe el objeto entero 'u' para que Java no tire error 500 por datos nulos
    const handleCambiarEstado = async (u: Usuario, estadoActual: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (estadoActual) {
                // Si está activo -> Manda DELETE /{id} para dar de baja lógica
                await api.delete(`/usuarios/${u.idUsuario}`, { headers });
            } else {
                // Si está inactivo -> Clona el usuario completo, lo pone activo y lo envía por PUT
                const payloadReactivar = {
                    ...u,
                    estado: true,
                    activo: true
                };
                await api.put(`/usuarios/${u.idUsuario}`, payloadReactivar, { headers });
            }

            cargarDatos();
        } catch (err) {
            console.error("Error al cambiar estado del usuario:", err);
            alert("No se pudo cambiar el estado. Verifica la consola.");
        }
    };

    // Filtro de usuarios en el Front
    const usuariosFiltrados = usuarios.filter((u) => {
        const estaActivo = obtenerEstadoBoolean(u);
        if (filtroEstado === "ACTIVOS") return estaActivo === true;
        if (filtroEstado === "INACTIVOS") return estaActivo === false;
        return true;
    });

    return (
        <div className="gestor-card">
            <h2>{modoEdicion ? "EDITAR USUARIO" : "REGISTRAR NUEVO USUARIO"}</h2>

            {/* FORMULARIO CRUD */}
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

            {/* LISTADO DE USUARIOS */}
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

            {/* TABLA RESPONSIVE */}
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
                                <tr key={u.idUsuario}>
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
                                            {/* AQUÍ ESTÁ LA MAGIA: Se pasa el objeto 'u' completo */}
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