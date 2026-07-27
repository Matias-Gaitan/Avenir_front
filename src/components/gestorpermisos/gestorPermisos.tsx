import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorRoles.css"; // Podés reusar el CSS del gestor de roles

interface Permiso {
    idPermiso?: number;
    id?: number;
    nombre: string;
    descripcion: string;
    activo?: boolean;
}

const GestorPermisos: React.FC = () => {
    const [permisos, setPermisos] = useState<Permiso[]>([]);

    // Estados del formulario
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const obtenerEstadoBoolean = (p: Permiso): boolean => {
        return p.activo ?? true;
    };

    const cargarPermisos = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/permisos", { headers });

            const data = Array.isArray(res.data) ? res.data : [];
            // Ordenamos por ID para evitar saltos en la tabla
            data.sort((a, b) => {
                const idA = a.idPermiso ?? a.id ?? 0;
                const idB = b.idPermiso ?? b.id ?? 0;
                return idA - idB;
            });

            setPermisos(data);
        } catch (err) {
            console.error("Error al cargar permisos:", err);
        }
    };

    useEffect(() => {
        cargarPermisos();
    }, []);

    const limpiarFormulario = () => {
        setNombre("");
        setDescripcion("");
        setIdEditar(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                // Forzamos mayúsculas y sin espacios para mantener un estándar
                nombre: nombre.toUpperCase().trim().replace(/\s+/g, '_'),
                descripcion
            };

            if (idEditar) {
                await api.put(`/permisos/${idEditar}`, payload, { headers });
            } else {
                await api.post("/permisos", payload, { headers });
            }

            limpiarFormulario();
            cargarPermisos();
        } catch (err: any) {
            alert(err.response?.data || "Error al procesar el permiso.");
        }
    };

    const handleEditarClick = (p: Permiso) => {
        setIdEditar(p.idPermiso || p.id || null);
        setNombre(p.nombre);
        setDescripcion(p.descripcion);
    };

    const handleCambiarEstado = async (p: Permiso, estadoActual: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const idSeguro = p.idPermiso || p.id;

            if (estadoActual) {
                await api.patch(`/permisos/${idSeguro}/baja`, {}, { headers });
            } else {
                await api.patch(`/permisos/${idSeguro}/alta`, {}, { headers });
            }

            cargarPermisos();
        } catch (err) {
            console.error("Error al cambiar estado:", err);
        }
    };

    return (
        <div className="roles-card">
            <h2>{idEditar ? "EDITAR PERMISO" : "GESTOR DE PERMISOS"}</h2>

            <form onSubmit={handleSubmit} className="form-rol">
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Código del Permiso</label>
                        <input
                            type="text"
                            placeholder="Ej: VER_USUARIOS"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Descripción</label>
                        <input
                            type="text"
                            placeholder="Ej: Permite visualizar la lista de usuarios"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" className="btn-agregar-rol">
                        {idEditar ? "ACTUALIZAR PERMISO" : "CREAR PERMISO"}
                    </button>
                    {idEditar && (
                        <button type="button" onClick={limpiarFormulario} className="btn-eliminar">
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
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permisos.map((p) => {
                            const esActivo = obtenerEstadoBoolean(p);
                            return (
                                <tr key={p.idPermiso || p.id}>
                                    <td><strong>{p.nombre}</strong></td>
                                    <td>{p.descripcion}</td>
                                    <td>
                                        <span className={`badge ${esActivo ? "badge-activo" : "badge-inactivo"}`}>
                                            {esActivo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-group">
                                            <button onClick={() => handleEditarClick(p)} className="btn-editar">
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleCambiarEstado(p, esActivo)}
                                                className={`btn-accion ${esActivo ? "btn-baja" : "btn-alta"}`}
                                                style={{ backgroundColor: esActivo ? "#94a3b8" : "#16a34a", color: "white", padding: "6px 10px", borderRadius: "4px", border: "none", cursor: "pointer" }}
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

export default GestorPermisos;