import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, Users, Building2, Clock, ShieldAlert, Settings, FileCheck, CheckSquare, Square, Trash2, Edit2 } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
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

interface ModuloPermisos {
    titulo: string;
    icono: React.ReactNode;
    permisos: Permiso[];
}

const GestorRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [nuevoRol, setNuevoRol] = useState("");

    const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);
    const [idRolEditando, setIdRolEditando] = useState<number | null>(null);

    useEffect(() => {
        cargarRoles();
        cargarPermisosDisponibles();
    }, []);

    const cargarRoles = async () => {
        try {
            const res = await api.get("/roles");
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar roles:", err);
        }
    };

    const cargarPermisosDisponibles = async () => {
        try {
            const res = await api.get("/roles/permisos");
            setPermisosDisponibles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar permisos:", err);
        }
    };

    const agruparPermisosPorModulo = (): ModuloPermisos[] => {
        const modulosMap: { [key: string]: { icono: React.ReactNode; permisos: Permiso[] } } = {
            "USUARIOS": { icono: <Users size={18} />, permisos: [] },
            "ROLES": { icono: <Key size={18} />, permisos: [] },
            "EMPRESAS": { icono: <Building2 size={18} />, permisos: [] },
            "HORARIOS": { icono: <Clock size={18} />, permisos: [] },
            "IPER": { icono: <ShieldAlert size={18} className="icon-pulse" color="#059669" />, permisos: [] },
            "ATS": { icono: <FileCheck size={18} color="#10B981" />, permisos: [] },
            "OTROS": { icono: <Settings size={18} className="icon-spin-hover" />, permisos: [] }
        };

        permisosDisponibles.forEach((p) => {
            const nombre = p.nombre.toUpperCase();
            if (nombre.includes("USUARIO")) {
                modulosMap["USUARIOS"].permisos.push(p);
            } else if (nombre.includes("ROL")) {
                modulosMap["ROLES"].permisos.push(p);
            } else if (nombre.includes("EMPRESA")) {
                modulosMap["EMPRESAS"].permisos.push(p);
            } else if (nombre.includes("HORARIO")) {
                modulosMap["HORARIOS"].permisos.push(p);
            } else if (nombre.includes("IPER") || nombre.includes("RIESGO") || nombre.includes("CATALOGO")) {
                modulosMap["IPER"].permisos.push(p);
            } else if (nombre.includes("ATS")) {
                modulosMap["ATS"].permisos.push(p);
            } else {
                modulosMap["OTROS"].permisos.push(p);
            }
        });

        // Aseguramos valores por defecto si la base de datos no retornó los módulos nuevos aún
        if (modulosMap["IPER"].permisos.length === 0) {
            modulosMap["IPER"].permisos = [
                { idPermiso: 901, nombre: "VER_CATALOGOS_IPER" },
                { idPermiso: 902, nombre: "CREAR_CATALOGOS_IPER" },
                { idPermiso: 903, nombre: "EDITAR_CATALOGOS_IPER" },
                { idPermiso: 904, nombre: "ELIMINAR_CATALOGOS_IPER" }
            ];
        }

        if (modulosMap["ATS"].permisos.length === 0) {
            modulosMap["ATS"].permisos = [
                { idPermiso: 905, nombre: "CREAR_ATS" },
                { idPermiso: 906, nombre: "APROBAR_ATS" }
            ];
        }

        return Object.keys(modulosMap)
            .filter((key) => modulosMap[key].permisos.length > 0)
            .map((key) => ({
                titulo: key,
                icono: modulosMap[key].icono,
                permisos: modulosMap[key].permisos
            }));
    };

    const handleSeleccionarTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const todosIds = permisosDisponibles.length > 0
                ? permisosDisponibles.map((p) => p.idPermiso)
                : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,901,902,903,904,905,906];
            setPermisosSeleccionados(todosIds);
        } else {
            setPermisosSeleccionados([]);
        }
    };

    const handleToggleModulo = (permisosModulo: Permiso[]) => {
        const idsModulo = permisosModulo.map((p) => p.idPermiso);
        const estanTodosModulo = idsModulo.every((id) => permisosSeleccionados.includes(id));

        if (estanTodosModulo) {
            setPermisosSeleccionados((prev) => prev.filter((id) => !idsModulo.includes(id)));
        } else {
            setPermisosSeleccionados((prev) => Array.from(new Set([...prev, ...idsModulo])));
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
            if (idRolEditando) {
                await api.put(`/roles/${idRolEditando}`, {
                    nombre: nuevoRol,
                    permisosIds: permisosSeleccionados
                });
                alert("¡Rol actualizado con éxito!");
            } else {
                await api.post("/roles", {
                    nombre: nuevoRol,
                    permisosIds: permisosSeleccionados
                });
                alert("¡Rol creado con éxito!");
            }

            window.dispatchEvent(new Event("rolesActualizados"));

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
            await api.delete(`/roles/${id}`);
            alert("Rol eliminado correctamente.");

            window.dispatchEvent(new Event("rolesActualizados"));

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

    const todosSeleccionados = permisosDisponibles.length > 0 && permisosSeleccionados.length === permisosDisponibles.length;
    const modulosAgrupados = agruparPermisosPorModulo();

    return (
        <div className="roles-card">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Key size={22} className="icon-pulse" color="#059669" />
                Gestor de Roles y Permisos
            </h2>

            {((!idRolEditando && tienePermiso("CREAR_ROLES")) || (idRolEditando && tienePermiso("EDITAR_ROLES"))) && (
                <form onSubmit={handleGuardarRol} className="form-rol-container">
                    <div className="form-row-top" style={{ marginBottom: "20px" }}>
                        <label style={{ fontWeight: "bold", color: "#0F172A", display: "block", marginBottom: "6px" }}>
                            Nombre del Rol:
                        </label>
                        <input
                            type="text"
                            className="input-rol"
                            placeholder="Ej: Gerente, Supervisor, Contador..."
                            value={nuevoRol}
                            onChange={(e) => setNuevoRol(e.target.value)}
                            required
                        />
                    </div>

                    <div className="permisos-section">
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: "#F1F5F9",
                            padding: "12px 20px",
                            borderRadius: "8px",
                            marginBottom: "15px"
                        }}>
                            <h4 style={{ margin: 0, color: "#0F172A", fontSize: "1.05rem" }}>
                                Asignar Permisos por Módulo:
                            </h4>

                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                color: "#047857"
                            }}>
                                <input
                                    type="checkbox"
                                    checked={todosSeleccionados}
                                    onChange={handleSeleccionarTodos}
                                />
                                Marcar Todo el Sistema ({permisosSeleccionados.length}/{permisosDisponibles.length || 15})
                            </label>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" }}>
                            {modulosAgrupados.map((mod) => {
                                const idsMod = mod.permisos.map((p) => p.idPermiso);
                                const estanTodosMod = idsMod.every((id) => permisosSeleccionados.includes(id));
                                const algunoMod = idsMod.some((id) => permisosSeleccionados.includes(id));

                                return (
                                    <div key={mod.titulo} style={{
                                        backgroundColor: "#FFFFFF",
                                        border: "1px solid",
                                        borderColor: algunoMod ? "#A7F3D0" : "#E2E8F0",
                                        borderRadius: "10px",
                                        padding: "15px",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            borderBottom: "1px solid #F1F5F9",
                                            paddingBottom: "8px",
                                            marginBottom: "12px"
                                        }}>
                                            <span style={{ fontWeight: "bold", color: "#1E293B", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                                {mod.icono} Módulo {mod.titulo}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleToggleModulo(mod.permisos)}
                                                style={{
                                                    backgroundColor: "transparent",
                                                    border: "none",
                                                    color: "#059669",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "bold",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                {estanTodosMod ? "Desmarcar Módulo" : "Marcar Módulo"}
                                            </button>
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {mod.permisos.map((p) => {
                                                const seleccionado = permisosSeleccionados.includes(p.idPermiso);
                                                return (
                                                    <label key={p.idPermiso} style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px",
                                                        padding: "6px 10px",
                                                        borderRadius: "6px",
                                                        backgroundColor: seleccionado ? "#ECFDF5" : "#F8FAFC",
                                                        border: "1px solid",
                                                        borderColor: seleccionado ? "#6EE7B7" : "#E2E8F0",
                                                        cursor: "pointer",
                                                        fontSize: "0.85rem",
                                                        transition: "0.2s"
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={seleccionado}
                                                            onChange={() => handleCheckboxChange(p.idPermiso)}
                                                        />
                                                        <span style={{
                                                            fontWeight: seleccionado ? "bold" : "normal",
                                                            color: seleccionado ? "#065F46" : "#475569"
                                                        }}>
                                                            {p.nombre}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        {idRolEditando && (
                            <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="btn-agregar-rol btn-interactive">
                            {idRolEditando ? "Actualizar Rol" : "Crear Rol con Permisos"}
                        </button>
                    </div>
                </form>
            )}

            <hr style={{ margin: "25px 0", border: "none", borderTop: "1px solid #E2E8F0" }} />

            {tienePermiso("VER_ROLES") ? (
                <div className="table-responsive">
                    <table className="gestor-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>ID</th>
                                <th style={{ width: "180px" }}>Nombre del Rol</th>
                                <th>Permisos Asignados</th>
                                <th style={{ width: "140px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((rol) => {
                                const totalPermisosRol = rol.permisos ? rol.permisos.length : 0;
                                const esTotal = totalPermisosRol > 0 && totalPermisosRol >= (permisosDisponibles.length || 15);

                                return (
                                    <tr key={rol.idTipoPersona}>
                                        <td>#{rol.idTipoPersona}</td>
                                        <td><strong>{rol.nombre}</strong></td>
                                        <td>
                                            {esTotal ? (
                                                <span style={{
                                                    backgroundColor: "#DCFCE7",
                                                    color: "#166534",
                                                    padding: "4px 12px",
                                                    borderRadius: "15px",
                                                    fontWeight: "bold",
                                                    fontSize: "0.8rem",
                                                    border: "1px solid #86EFAC",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px"
                                                }}>
                                                    <ShieldCheck size={14} /> Todos los Permisos ({totalPermisosRol})
                                                </span>
                                            ) : totalPermisosRol > 0 ? (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {rol.permisos?.map((p) => (
                                                        <span key={p.idPermiso} className="badge-permiso" style={{
                                                            backgroundColor: "#E0F2FE",
                                                            color: "#0369A1",
                                                            padding: "3px 8px",
                                                            borderRadius: "4px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600"
                                                        }}>
                                                            {p.nombre}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontStyle: "italic" }}>
                                                    Sin permisos asignados
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="acciones-group">
                                                {tienePermiso("EDITAR_ROLES") && (
                                                    <button type="button" className="btn-editar btn-interactive" onClick={() => handleEditarClick(rol)}>Editar</button>
                                                )}
                                                {(tienePermiso("DAR_DE_BAJA_ROLES") || tienePermiso("ELIMINAR_ROLES")) && (
                                                    <button type="button" className="btn-eliminar btn-interactive" onClick={() => handleEliminarRol(rol.idTipoPersona)}>Eliminar</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: "#ef4444", textAlign: "center", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <ShieldAlert size={18} /> No tenés permisos para visualizar la lista de roles.
                </p>
            )}
        </div>
    );
};

export default GestorRoles;