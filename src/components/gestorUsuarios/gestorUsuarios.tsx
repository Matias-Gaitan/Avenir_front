// src/components/gestorUsuarios/GestorUsuarios.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import type { Usuario } from "../../interfaces/Usuario";
import "./gestorUsuarios.css";

const GestorUsuarios: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [filtro, setFiltro] = useState<string>("todos");

    // NUEVO: Estado para saber a quién estamos editando
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const cargarUsuarios = async () => {
        try {
            let url = "http://localhost:8080/api/usuarios";
            if (filtro === "activos") url += "?activo=true";
            if (filtro === "inactivos") url += "?activo=false";

            const response = await axios.get(url);
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, [filtro]);

    // Lógica para Dar de Baja
    const handleBaja = async (id: number | undefined) => {
        if (!id) {
            alert("Error: No se encontró el ID del usuario.");
            return;
        }

        const confirmar = window.confirm("¿Estás seguro de que deseas dar de baja a este usuario?");
        if (confirmar) {
            try {
                await axios.delete(`http://localhost:8080/api/usuarios/${id}`);
                alert("Usuario dado de baja exitosamente.");
                cargarUsuarios(); // Recarga la tabla
            } catch (error) {
                console.error("Error al dar de baja:", error);
                alert("Hubo un error al intentar dar de baja al usuario.");
            }
        }
    };

    // NUEVO: Lógica para Guardar la Edición
        const handleGuardarEdicion = async (e: React.FormEvent) => {
            e.preventDefault();

            // ¡ACÁ ESTABA EL DETALLE! Ahora busca idUsuario
            if (!usuarioEditando || !usuarioEditando.idUsuario) {
                console.error("No se encontró el ID para editar");
                return;
            }

            try {
                // Le pegamos a nuestro método PUT con el ID correcto
                await axios.put(`http://localhost:8080/api/usuarios/${usuarioEditando.idUsuario}`, usuarioEditando);

                alert("Usuario actualizado correctamente.");
                setUsuarioEditando(null); // Cerramos el cuadrito de edición
                cargarUsuarios(); // Recargamos la tabla para ver los cambios

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
                            setUsuarioEditando(null); // Si cambia el filtro, cerramos la edición
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
                            <th>Rol</th> {/* COLUMNA NUEVA */}
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
                                {/* Mostramos el Rol (Asumiendo que ID 1 es Admin y 2 es Común) */}
                                <td>
                                    {usuario.tipoPersona?.idTipoPersona === 1 ? "Administrador" : "Usuario Base"}
                                </td>
                                <td>
                                    <span className={usuario.activo ? "badge-activo" : "badge-inactivo"}>
                                        {usuario.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
                                <td>
                                    {/* Botón Editar que abre el formulario */}
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

                {/* --- SECCIÓN DE EDICIÓN FLOTANTE --- */}
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