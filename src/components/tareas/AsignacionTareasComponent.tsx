import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, X, Check, Ban, RotateCcw, MapPin, Package, ListChecks } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "../insumos/insumos.css";
import type { Insumo } from "../../interfaces/Insumo";
import type { TareaAsignada } from "../../interfaces/TareaAsignada";

interface Empresa {
    idEmpresa: number;
    nombre: string;
    activo: boolean;
    direccion?: string;
    barrio?: string;
}

interface UsuarioOpcion {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
}

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const AsignacionTareasComponent: React.FC = () => {
    const puedeCrear = tienePermiso("CREAR_TAREAS");
    const puedeVer = tienePermiso("VER_TAREAS");
    const puedeEliminar = tienePermiso("ELIMINAR_TAREAS");
    const email = localStorage.getItem("email") || "";

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([]);
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [tareas, setTareas] = useState<TareaAsignada[]>([]);
    const [misTareas, setMisTareas] = useState<TareaAsignada[]>([]);

    // Formulario de asignación
    const [idUsuario, setIdUsuario] = useState<number | "">("");
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [descripcionTarea, setDescripcionTarea] = useState("");
    const [direccionExacta, setDireccionExacta] = useState("");
    const [barrioZona, setBarrioZona] = useState("");
    const [insumosSeleccionados, setInsumosSeleccionados] = useState<string[]>([]);
    const [pasosGenericos, setPasosGenericos] = useState<string[]>([]);
    const [nuevoPaso, setNuevoPaso] = useState("");

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarEmpresas = async () => {
        try {
            const res = await api.get("/empresas", obtenerHeaders());
            setEmpresas(Array.isArray(res.data) ? res.data.filter((e: Empresa) => e.activo) : []);
        } catch (err) { console.error("Error al cargar empresas", err); }
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get("/usuarios", obtenerHeaders());
            setUsuarios(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error al cargar usuarios", err); }
    };

    const cargarInsumos = async () => {
        try {
            const res = await api.get("/insumos?activo=true", obtenerHeaders());
            setInsumos(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error al cargar insumos", err); }
    };

    const cargarTareas = async () => {
        try {
            const res = await api.get("/tareas", obtenerHeaders());
            setTareas(Array.isArray(res.data) ? res.data : []);
        } catch (err) { setTareas([]); }
    };

    const cargarMisTareas = async () => {
        if (!email) return;
        try {
            const res = await api.get(`/tareas/mias?email=${encodeURIComponent(email)}`, obtenerHeaders());
            setMisTareas(Array.isArray(res.data) ? res.data : []);
        } catch (err) { setMisTareas([]); }
    };

    useEffect(() => {
        cargarEmpresas();
        cargarUsuarios();
        cargarInsumos();
        if (puedeVer) cargarTareas();
        cargarMisTareas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Autocompleta direccion/barrio desde la empresa elegida (igual que en ATS)
    useEffect(() => {
        if (!idEmpresa) return;
        const emp = empresas.find((e) => e.idEmpresa === idEmpresa);
        if (emp) {
            setDireccionExacta(emp.direccion || "");
            setBarrioZona(emp.barrio || "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idEmpresa, empresas]);

    const toggleInsumo = (nombre: string) => {
        setInsumosSeleccionados((prev) =>
            prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre]
        );
    };

    const agregarPaso = () => {
        if (!nuevoPaso.trim()) return;
        setPasosGenericos((prev) => [...prev, nuevoPaso.trim()]);
        setNuevoPaso("");
    };

    const quitarPaso = (idx: number) => {
        setPasosGenericos((prev) => prev.filter((_, i) => i !== idx));
    };

    const limpiarFormulario = () => {
        setIdUsuario(""); setIdEmpresa(""); setFecha(new Date().toISOString().split("T")[0]);
        setDescripcionTarea(""); setDireccionExacta(""); setBarrioZona("");
        setInsumosSeleccionados([]); setPasosGenericos([]); setNuevoPaso("");
    };

    const handleAsignar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        try {
            await api.post("/tareas", {
                idEmpresa: Number(idEmpresa),
                idUsuario: Number(idUsuario),
                descripcionTarea,
                fecha,
                direccionExacta,
                barrioZona,
                insumosRequeridos: insumosSeleccionados,
                pasosGenericos
            }, obtenerHeaders());

            setMensaje("Tarea asignada con éxito.");
            limpiarFormulario();
            if (puedeVer) cargarTareas();
            cargarMisTareas();
        } catch (err: any) {
            setError(err.response?.data || "Error al asignar la tarea.");
        }
    };

    const handleToggleItem = async (idItem: number, completadoActual: boolean, esPropia: boolean) => {
        try {
            await api.patch(`/tareas/items/${idItem}`, { completado: !completadoActual }, obtenerHeaders());
            if (esPropia) cargarMisTareas(); else cargarTareas();
        } catch (err: any) {
            alert("No se pudo actualizar el ítem: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleDarDeBaja = async (id: number) => {
        if (!window.confirm("¿Dar de baja esta tarea asignada?")) return;
        try {
            await api.delete(`/tareas/${id}`, obtenerHeaders());
            cargarTareas();
        } catch (err: any) {
            alert("Error al dar de baja: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleReactivar = async (id: number) => {
        try {
            await api.patch(`/tareas/${id}/reactivar`, {}, obtenerHeaders());
            cargarTareas();
        } catch (err: any) {
            alert("Error al reactivar: " + (err.response?.data || "Error desconocido"));
        }
    };

    const badgeEstado = (estado: string) => {
        const colores: Record<string, string> = {
            PENDIENTE: "#f59e0b", EN_PROGRESO: "#2563eb", COMPLETADA: "#059669"
        };
        return (
            <span style={{ backgroundColor: `${colores[estado] || "#64748b"}22`, color: colores[estado] || "#64748b", padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                {estado.replace("_", " ")}
            </span>
        );
    };

    const renderChecklist = (tarea: TareaAsignada, esPropia: boolean) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            {tarea.checklist.length === 0 && <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Sin checklist cargado.</span>}
            {tarea.checklist.map((item) => (
                <label key={item.idItem} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", backgroundColor: item.completado ? "#ECFDF5" : "#F8FAFC" }}>
                    <input type="checkbox" checked={item.completado} onChange={() => handleToggleItem(item.idItem, item.completado, esPropia)} />
                    {item.tipo === "INSUMO" ? <Package size={13} color="#7C3AED" /> : <ListChecks size={13} color="#059669" />}
                    <span style={{ textDecoration: item.completado ? "line-through" : "none", color: item.completado ? "#059669" : "#334155" }}>{item.descripcion}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="insumos-container">
            {puedeCrear && (
                <div className="insumos-card">
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <ClipboardList size={24} color="#059669" /> ASIGNAR TAREA CON CHECKLIST
                    </h1>

                    <form onSubmit={handleAsignar} className="insumos-form-grid">
                        <div className="form-section">
                            <label>Empleado</label>
                            <select className="form-input" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value as unknown as number)} required>
                                <option value="" disabled>Seleccione un empleado</option>
                                {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Empresa</label>
                            <select className="form-input" value={idEmpresa} onChange={(e) => setIdEmpresa(e.target.value as unknown as number)} required>
                                <option value="" disabled>Seleccione una empresa</option>
                                {empresas.map((emp) => <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Fecha</label>
                            <input type="date" className="form-input" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                        </div>
                        <div className="form-section" style={{ gridColumn: "span 2" }}>
                            <label>Descripción de la tarea</label>
                            <input className="form-input" value={descripcionTarea} onChange={(e) => setDescripcionTarea(e.target.value)} placeholder="Ej. Inspección LOTO de Tablero" required />
                        </div>
                        <div className="form-section">
                            <label><MapPin size={12} style={{ verticalAlign: "middle" }} /> Dirección (autocompletada)</label>
                            <input className="form-input" value={direccionExacta} onChange={(e) => setDireccionExacta(e.target.value)} placeholder="Se completa al elegir la empresa" />
                        </div>
                        <div className="form-section">
                            <label>Barrio / Zona (autocompletado)</label>
                            <input className="form-input" value={barrioZona} onChange={(e) => setBarrioZona(e.target.value)} placeholder="Se completa al elegir la empresa" />
                        </div>

                        <div className="form-section" style={{ gridColumn: "1 / -1" }}>
                            <label>Insumos requeridos para la visita</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                                {insumos.map((ins) => (
                                    <label key={ins.idInsumo} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "16px", border: "1px solid", borderColor: insumosSeleccionados.includes(ins.nombre) ? "#6EE7B7" : "#E2E8F0", backgroundColor: insumosSeleccionados.includes(ins.nombre) ? "#ECFDF5" : "#FFFFFF", fontSize: "0.8rem", cursor: "pointer" }}>
                                        <input type="checkbox" checked={insumosSeleccionados.includes(ins.nombre)} onChange={() => toggleInsumo(ins.nombre)} />
                                        {ins.nombre}
                                    </label>
                                ))}
                                {insumos.length === 0 && <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>No hay insumos cargados en el catálogo.</span>}
                            </div>
                        </div>

                        <div className="form-section" style={{ gridColumn: "1 / -1" }}>
                            <label>Pasos genéricos de preparación</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input className="form-input" value={nuevoPaso} onChange={(e) => setNuevoPaso(e.target.value)} placeholder="Ej. Verificar EPP completo antes de salir" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarPaso(); } }} />
                                <button type="button" className="btn-doc-accion subir" onClick={agregarPaso}><Plus size={14} /> Agregar</button>
                            </div>
                            {pasosGenericos.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" }}>
                                    {pasosGenericos.map((paso, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", backgroundColor: "#F8FAFC", borderRadius: "6px", fontSize: "0.85rem" }}>
                                            <span>{idx + 1}. {paso}</span>
                                            <button type="button" onClick={() => quitarPaso(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", display: "flex" }}><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-section" style={{ gridColumn: "1 / -1", justifyContent: "flex-end" }}>
                            <button type="submit" className="btn-primario">Asignar Tarea</button>
                        </div>
                    </form>

                    {error && <p className="msg-error">{error}</p>}
                    {mensaje && <p className="msg-exito">{mensaje}</p>}
                </div>
            )}

            {puedeVer && (
                <div className="insumos-card">
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <ClipboardList size={24} color="#059669" /> TODAS LAS TAREAS ASIGNADAS
                    </h1>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                        {tareas.length === 0 && <p className="txt-vacio">No hay tareas asignadas todavía.</p>}
                        {tareas.map((t) => (
                            <div key={t.idTarea} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px", opacity: t.activo === false ? 0.6 : 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                                    <div>
                                        <strong>{t.descripcionTarea}</strong>
                                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                                            {t.usuario?.nombre} {t.usuario?.apellido} · {t.empresa?.nombre} · {t.fecha}
                                        </div>
                                        {(t.direccionExacta || t.barrioZona) && (
                                            <div style={{ fontSize: "0.78rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <MapPin size={12} /> {[t.direccionExacta, t.barrioZona].filter(Boolean).join(" — ")}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {badgeEstado(t.estado)}
                                        {puedeEliminar && t.activo !== false && (
                                            <button className="btn-doc-accion" style={{ backgroundColor: "#64748b" }} onClick={() => handleDarDeBaja(t.idTarea)}><Ban size={12} /></button>
                                        )}
                                        {puedeEliminar && t.activo === false && (
                                            <button className="btn-doc-accion descargar" onClick={() => handleReactivar(t.idTarea)}><RotateCcw size={12} /></button>
                                        )}
                                    </div>
                                </div>
                                {renderChecklist(t, false)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Check size={24} color="#059669" /> MIS TAREAS ASIGNADAS
                </h1>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                    {misTareas.length === 0 && <p className="txt-vacio">No tenés tareas asignadas por el momento.</p>}
                    {misTareas.map((t) => (
                        <div key={t.idTarea} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                                <div>
                                    <strong>{t.descripcionTarea}</strong>
                                    <div style={{ fontSize: "0.8rem", color: "#64748B" }}>{t.empresa?.nombre} · {t.fecha}</div>
                                    {(t.direccionExacta || t.barrioZona) && (
                                        <div style={{ fontSize: "0.78rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <MapPin size={12} /> {[t.direccionExacta, t.barrioZona].filter(Boolean).join(" — ")}
                                        </div>
                                    )}
                                </div>
                                {badgeEstado(t.estado)}
                            </div>
                            {renderChecklist(t, true)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AsignacionTareasComponent;
