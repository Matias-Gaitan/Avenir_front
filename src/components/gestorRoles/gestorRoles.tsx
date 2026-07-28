import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorRoles.css";

interface Permiso {
    idPermiso: number;
    nombre: string;
}

interface Rol {
    idTipoPersona?: number;
    nombre: string;
    permisos?: Permiso[];
}

const GestorRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [nuevoRol, setNuevoRol] = useState("");

    // Estados para permisos
    const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);
    const [nombreNuevoPermiso, setNombreNuevoPermiso] = useState(""); // Estado para el input del nuevo permiso

    const [idRolEditando, setIdRolEditando] = useState<number | null>(null);

    useEffect(() => {
        cargarRoles();
        cargarPermisosDisponibles();
    }, []);

    const cargarRoles = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/roles", { headers });
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar roles:", err);
        }
    };

    const cargarPermisosDisponibles = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/roles/permisos", { headers });
            setPermisosDisponibles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar permisos:", err);
        }
    };

    // 👇 NUEVO: Función para crear un permiso en caliente
    const handleCrearNuevoPermiso = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!nombreNuevoPermiso.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await api.post("/roles/permisos", { nombre: nombreNuevoPermiso }, { headers });

            setNombreNuevoPermiso(""); // Limpiamos el input
            cargarPermisosDisponibles(); // Recargamos los checkboxes
            alert("¡Permiso creado con éxito!");
        } catch (err) {
            console.error("Error al crear permiso:", err);
            alert("Error al crear el permiso. Puede que ya exista.");
        }
    };

    const handleCheckboxChange = (idPermiso: number) => {
        setPermisosSeleccionados((prev) =>
            prev.includes(idPermiso)
                ? prev.filter((id) => id !== idPermiso)
                : [...prev, idPermiso]
        );
    };

    const handleGuardarRol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoRol.trim()) {
            alert("El nombre del rol no puede estar vacío.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (idRolEditando) {
                await api.put(`/roles/${idRolEditando}`, {
                    nombre: nuevoRol,
                    permisosIds: permisosSeleccionados
                }, { headers });
                alert("¡Rol actualizado con éxito!");
            } else {
                await api.post("/roles", {
                    nombre: nuevoRol,
                    permisosIds: permisosSeleccionados
                }, { headers });
                alert("¡Rol creado con éxito!");
            }

            limpiarFormulario();
            cargarRoles();
        } catch (err: any) {
            console.error("Error al guardar rol:", err);
            const mensaje = err.response?.data?.mensaje || err.response?.data || "Error al guardar el rol.";
            alert("Error: " + mensaje);
        }
    };

    const handleEliminarRol = async (id?: number) => {
        if (!id) return;
        if (!window.confirm("¿Seguro que querés eliminar este rol?")) return;

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await api.delete(`/roles/${id}`, { headers });

            alert("Rol eliminado correctamente.");
            cargarRoles();
        } catch (err: any) {
            console.error("Error al eliminar:", err);
            const mensaje = err.response?.data?.mensaje || err.response?.data || "No se puede eliminar el rol porque está en uso.";
            alert("Error: " + mensaje);
        }
    };

    const handleEditarClick = (rol: Rol) => {
        if (!rol.idTipoPersona) return;
        setIdRolEditando(rol.idTipoPersona);
        setNuevoRol(rol.nombre);

        const idsPermisosActuales = rol.permisos ? rol.permisos.map((p) => p.idPermiso) : [];
        setPermisosSeleccionados(idsPermisosActuales);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const limpiarFormulario = () => {
        setNuevoRol("");
        setPermisosSeleccionados([]);
        setIdRolEditando(null);
    };

    return (
        <div className="roles-card">
            <h2>Gestor de Roles y Permisos</h2>

            <form onSubmit={handleGuardarRol} className="form-rol-container">
                <div className="form-row-top">
                    <input
                        type="text"
                        className="input-rol"
                        placeholder="Nombre del rol (ej: Gerente)"
                        value={nuevoRol}
                        onChange={(e) => setNuevoRol(e.target.value)}
                    />
                </div>

                <div className="permisos-section">
                    <div className="header-permisos">
                        <h4>Asignar Permisos:</h4>

                        {/* 👇 NUEVO: Input para crear permiso en caliente */}
                        <div className="crear-permiso-inline">
                            <input
                                type="text"
                                placeholder="Nuevo permiso (ej: VER REPORTES)"
                                value={nombreNuevoPermiso}
                                onChange={(e) => setNombreNuevoPermiso(e.target.value)}
                                className="input-mini"
                            />
                            <button type="button" onClick={handleCrearNuevoPermiso} className="btn-mini">
                                + Agregar
                            </button>
                        </div>
                    </div>

                    <div className="permisos-grid">
                        {permisosDisponibles.map((permiso) => (
                            <label key={permiso.idPermiso} className="permiso-checkbox">
                                <input
                                    type="checkbox"
                                    checked={permisosSeleccionados.includes(permiso.idPermiso)}
                                    onChange={() => handleCheckboxChange(permiso.idPermiso)}
                                />
                                {permiso.nombre}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    {idRolEditando && (
                        <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
                            Cancelar
                        </button>
                    )}
                    <button type="submit" className="btn-agregar-rol">
                        {idRolEditando ? "Actualizar Rol" : "Crear Rol con Permisos"}
                    </button>
                </div>
            </form>

            <div className="table-responsive">
                <table className="gestor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Rol</th>
                            <th>Permisos Asignados</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((rol) => (
                            <tr key={rol.idTipoPersona}>
                                <td>{rol.idTipoPersona}</td>
                                <td><strong>{rol.nombre}</strong></td>
                                <td>
                                    {rol.permisos && rol.permisos.length > 0 ? (
                                        rol.permisos.map((p) => (
                                            <span key={p.idPermiso} className="badge-permiso">
                                                {p.nombre}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontStyle: "italic" }}>
                                            Sin permisos
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="acciones-group">
                                        <button type="button" className="btn-editar" onClick={() => handleEditarClick(rol)}>Editar</button>
                                        <button type="button" className="btn-eliminar" onClick={() => handleEliminarRol(rol.idTipoPersona)}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestorRoles;