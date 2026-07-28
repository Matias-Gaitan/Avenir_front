import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorRoles.css";

interface Permiso {
    idPermiso?: number;
    id?: number;
    nombre: string;
    descripcion: string;
    activo?: boolean;
}

interface Rol {
    idTipoPersona?: number;
    id?: number;
    nombre: string;
    permisos?: Permiso[];
}

const GestorRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);

    // Estados del formulario
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [nombreRol, setNombreRol] = useState("");
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

    const cargarDatos = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [resRoles, resPermisos] = await Promise.all([
                api.get("/roles", { headers }),
                api.get("/permisos", { headers })
            ]);

            const rolesData = Array.isArray(resRoles.data) ? resRoles.data : [];
            rolesData.sort((a, b) => (a.idTipoPersona ?? a.id ?? 0) - (b.idTipoPersona ?? b.id ?? 0));
            setRoles(rolesData);

            const permisosData = Array.isArray(resPermisos.data) ? resPermisos.data : [];
            // Filtramos para mostrar solo los permisos activos en la cantera
            setPermisosDisponibles(permisosData.filter(p => p.activo ?? true));
        } catch (err) {
            console.error("Error al cargar datos de roles y permisos:", err);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const limpiarFormulario = () => {
        setNombreRol("");
        setPermisosSeleccionados([]);
        setIdEditar(null);
    };

    const handleTogglePermiso = (idPermiso: number) => {
        setPermisosSeleccionados(prev =>
            prev.includes(idPermiso)
                ? prev.filter(id => id !== idPermiso)
                : [...prev, idPermiso]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreRol.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                nombre: nombreRol.trim(),
                permisos: permisosSeleccionados.map(id => ({ idPermiso: id }))
            };

            if (idEditar) {
                await api.put(`/roles/${idEditar}`, payload, { headers });
            } else {
                await api.post("/roles", payload, { headers });
            }

            limpiarFormulario();
            cargarDatos();
        } catch (err: any) {
            alert(err.response?.data || "Error al procesar el rol.");
        }
    };

    const handleEditarClick = (rol: Rol) => {
        setIdEditar(rol.idTipoPersona || rol.id || null);
        setNombreRol(rol.nombre);
        setPermisosSeleccionados(
            rol.permisos ? rol.permisos.map(p => p.idPermiso || p.id!).filter(Boolean) : []
        );
    };

    return (
        <div className="roles-card">
            <h2>{idEditar ? "EDITAR ROL Y PERMISOS" : "GESTOR DE ROLES"}</h2>

            <form onSubmit={handleSubmit} className="form-rol">
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Nombre del Rol</label>
                    <input
                        type="text"
                        placeholder="Ej: Administrador, Operario"
                        value={nombreRol}
                        onChange={(e) => setNombreRol(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                </div>

                <div className="permisos-container" style={{ marginBottom: "15px", background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#064e3b" }}>
                        Asignar Permisos Disponibles:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                        {permisosDisponibles.map((p) => {
                            const idp = p.idPermiso || p.id!;
                            return (
                                <label key={idp} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem" }}>
                                    <input
                                        type="checkbox"
                                        checked={permisosSeleccionados.includes(idp)}
                                        onChange={() => handleTogglePermiso(idp)}
                                    />
                                    <span><strong>{p.nombre}</strong></span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="btn-agregar-rol">
                        {idEditar ? "ACTUALIZAR ROL" : "CREAR ROL"}
                    </button>
                    {idEditar && (
                        <button type="button" onClick={limpiarFormulario} className="btn-eliminar" style={{ backgroundColor: "#94a3b8", color: "white", border: "none", padding: "8px 12px", borderRadius: "4px", cursor: "pointer" }}>
                            CANCELAR
                        </button>
                    )}
                </div>
            </form>

            <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #cbd5e1" }} />

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
                        {roles.map((rol) => {
                            const idRol = rol.idTipoPersona || rol.id;
                            return (
                                <tr key={idRol}>
                                    <td>{idRol}</td>
                                    <td><strong>{rol.nombre}</strong></td>
                                    <td>
                                        {rol.permisos && rol.permisos.length > 0
                                            ? rol.permisos.map(p => p.nombre).join(", ")
                                            : <span style={{ color: "#94a3b8" }}>Sin permisos asignados</span>}
                                    </td>
                                    <td>
                                        <div className="acciones-group">
                                            <button onClick={() => handleEditarClick(rol)} className="btn-editar">
                                                Editar
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

export default GestorRoles;