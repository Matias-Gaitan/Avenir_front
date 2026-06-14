// src/components/gestorRoles/GestorRoles.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import type { TipoPersona } from "../../interfaces/TipoPersona";
// ¡Magia! Importamos el CSS del gestor de usuarios para mantener el mismo diseño
import "../gestorUsuarios/gestorUsuarios.css";

const GestorRoles: React.FC = () => {
    const [roles, setRoles] = useState<TipoPersona[]>([]);
    const [nombreNuevoRol, setNombreNuevoRol] = useState<string>("");
    const [rolEditando, setRolEditando] = useState<TipoPersona | null>(null);

    const cargarRoles = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/roles");
            setRoles(response.data);
        } catch (error) {
            console.error("Error al cargar roles:", error);
        }
    };

    useEffect(() => {
        cargarRoles();
    }, []);

    // Crear un nuevo rol
    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreNuevoRol.trim()) return;

        try {
            await axios.post("http://localhost:8080/api/roles", { nombre: nombreNuevoRol });
            alert("Rol creado exitosamente.");
            setNombreNuevoRol(""); // Limpiamos el input
            cargarRoles(); // Recargamos la tabla
        } catch (error) {
            console.error("Error al crear:", error);
            alert("Hubo un error al crear el rol.");
        }
    };

    // Eliminar rol
    const handleEliminar = async (id: number | undefined) => {
        if (!id) return;
        const confirmar = window.confirm("¿Estás seguro de eliminar este rol?");
        if (confirmar) {
            try {
                await axios.delete(`http://localhost:8080/api/roles/${id}`);
                alert("Rol eliminado exitosamente.");
                cargarRoles();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert("No se puede eliminar. Es probable que haya usuarios usando este rol.");
            }
        }
    };

    // Guardar edición
    const handleGuardarEdicion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rolEditando || !rolEditando.idTipoPersona) return;

        try {
            await axios.put(`http://localhost:8080/api/roles/${rolEditando.idTipoPersona}`, rolEditando);
            alert("Rol actualizado correctamente.");
            setRolEditando(null); // Cerramos el cuadro de edición
            cargarRoles();
        } catch (error) {
            console.error("Error al editar:", error);
            alert("Hubo un error al actualizar el rol.");
        }
    };

    return (
        <div className="gestor-container" style={{ minHeight: 'auto', padding: '0' }}>
            <div className="gestor-card">
                <h1 className="gestor-title">Gestor de Roles</h1>

                {/* --- FORMULARIO PARA CREAR NUEVO ROL --- */}
                <form className="edit-form" style={{ flexDirection: 'row', marginBottom: '20px' }} onSubmit={handleCrear}>
                    <input
                        className="filter-select"
                        type="text"
                        placeholder="Nombre del nuevo rol (ej: Gerente)"
                        value={nombreNuevoRol}
                        onChange={(e) => setNombreNuevoRol(e.target.value)}
                        required
                        style={{ flex: 1 }}
                    />
                    <button className="btn-action" type="submit">Agregar Rol</button>
                </form>

                <table className="gestor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((rol) => (
                            <tr key={rol.idTipoPersona}>
                                <td>{rol.idTipoPersona}</td>
                                <td>{rol.nombre}</td>
                                <td>
                                    <button
                                        className="btn-action"
                                        onClick={() => setRolEditando(rol)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn-action btn-danger"
                                        onClick={() => handleEliminar(rol.idTipoPersona)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- SECCIÓN DE EDICIÓN FLOTANTE --- */}
                {rolEditando && (
                    <div className="edit-container">
                        <h2 className="gestor-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                            Editando Rol ID: {rolEditando.idTipoPersona}
                        </h2>

                        <form className="edit-form" onSubmit={handleGuardarEdicion}>
                            <input
                                className="filter-select"
                                type="text"
                                value={rolEditando.nombre}
                                onChange={(e) => setRolEditando({...rolEditando, nombre: e.target.value})}
                                required
                            />
                            <div className="edit-buttons">
                                <button className="btn-action" type="submit">Guardar Cambios</button>
                                <button
                                    className="btn-action btn-danger"
                                    type="button"
                                    onClick={() => setRolEditando(null)}
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

export default GestorRoles;