import React, { useState, useEffect } from "react";
import api from "../../service/api";
import type { Usuario } from "../../interfaces/Usuario";
import "./gestorUsuarios.css";

const GestorUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [filtro, setFiltro] = useState<string>("todos");
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const cargarUsuarios = async () => {
        try {
            let url = "/usuarios";
            if (filtro === "activos") url += "?activo=true";
            if (filtro === "inactivos") url += "?activo=false";

            const response = await api.get(url);
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, [filtro]);

    const handleBaja = async (id: number | undefined) => {
        if (!id) {
            alert("Error: No se encontró el ID del usuario.");
            return;
        }

        const confirmar = window.confirm("¿Estás seguro de que deseas dar de baja a este usuario?");
        if (confirmar) {
            try {
                await api.delete(`/usuarios/${id}`);
                alert("Usuario dado de baja exitosamente.");
                cargarUsuarios();
            } catch (error) {
                console.error("Error al dar de baja:", error);
                alert("Hubo un error al intentar dar de baja al usuario.");
            }
        }
    };

    const handleGuardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!usuarioEditando || !usuarioEditando.idUsuario) {
            console.error("No se encontró el ID para editar");
            return;
        }

        try {
            await api.put(`/usuarios/${usuarioEditando.idUsuario}`, usuarioEditando);
            alert("Usuario actualizado correctamente.");
            setUsuarioEditando(null);
            cargarUsuarios();
        } catch (error) {
            console.error("Error al editar:", error);
            alert("Hubo un error al guardar los cambios. Fijate en la consola.");
        }
    };

    return (
        <div className="gestor-container">
            <div className="gestor-card">
                <h1 className="gestor-title">Gestor de Usuarios</h1>

                <div className="gestor-controls">
                    <select
                        className="filter-select"
                        value={filtro}
                        onChange={(e) => {
                            setFiltro(e.target.value);
                            setUsuarioEditando(null);
                        }}
                    >
                        <option value="todos">Todos los usuarios</option>
                        <option value="activos">Solo Activos</option>
                        <option value="inactivos">Solo Inactivos</option>
                    </select>
                </div>

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
                        {usuarios.map((usuario) => (
                            <tr key={usuario.idUsuario}>
                                <td>{usuario.nombre}</td>
                                <td>{usuario.apellido}</td>
                                <td>{usuario.email}</td>
                                <td>
                                    {usuario.tipoPersona?.idTipoPersona === 1 ? "Administrador" : "Usuario Base"}
                                </td>
                                <td>
                                    <span className={usuario.activo ? "badge-activo" : "badge-inactivo"}>
                                        {usuario.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-action"
                                        onClick={() => setUsuarioEditando(usuario)}
                                    >
                                        Editar
                                    </button>

                                    {usuario.activo && (
                                        <button
                                            className="btn-action btn-danger"
                                            onClick={() => handleBaja(usuario.idUsuario)}
                                        >
                                            Dar de baja
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {usuarios.length === 0 && (
                    <p style={{ textAlign: "center", marginTop: "20px" }}>No se encontraron usuarios.</p>
                )}

                {usuarioEditando && (
                    <div className="edit-container">
                        <h2 className="gestor-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                            Editando a: {usuarioEditando.nombre} {usuarioEditando.apellido}
                        </h2>

                        <form className="edit-form" onSubmit={handleGuardarEdicion}>
                            <input
                                className="filter-select"
                                type="text"
                                placeholder="Nombre"
                                value={usuarioEditando.nombre}
                                onChange={(e) => setUsuarioEditando({...usuarioEditando, nombre: e.target.value})}
                                required
                            />
                            <input
                                className="filter-select"
                                type="text"
                                placeholder="Apellido"
                                value={usuarioEditando.apellido}
                                onChange={(e) => setUsuarioEditando({...usuarioEditando, apellido: e.target.value})}
                                required
                            />

                            <label style={{ fontSize: '0.9rem', color: '#4B5563' }}>Rol del usuario:</label>
                            <select
                                className="filter-select"
                                value={usuarioEditando.tipoPersona?.idTipoPersona || 1}
                                onChange={(e) => setUsuarioEditando({
                                    ...usuarioEditando,
                                    tipoPersona: { idTipoPersona: Number(e.target.value) }
                                })}
                            >
                                <option value={1}>Administrador</option>
                                <option value={2}>Usuario Base</option>
                            </select>

                            <div className="edit-buttons">
                                <button className="btn-action" type="submit">Guardar Cambios</button>
                                <button
                                    className="btn-action btn-danger"
                                    type="button"
                                    onClick={() => setUsuarioEditando(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestorUsuarios;