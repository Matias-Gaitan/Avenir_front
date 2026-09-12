import React, { useState, useEffect } from "react";
import { Package, PackagePlus, Truck, AlertTriangle, Edit2, Ban, RotateCcw, X, Tags } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./insumos.css";
import type { Insumo, EntregaInsumo } from "../../interfaces/Insumo";

interface UsuarioOpcion {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
}

interface CategoriaInsumo {
    id: number;
    nombre: string;
    activo: boolean;
}

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const GestionInsumosComponent: React.FC = () => {
    const [vista, setVista] = useState<"catalogo" | "entregas">("catalogo");
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [entregas, setEntregas] = useState<EntregaInsumo[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<"ACTIVOS" | "BAJAS" | "TODOS">("ACTIVOS");

    const puedeCrear = tienePermiso("CREAR_INSUMOS");
    const puedeEditar = tienePermiso("EDITAR_INSUMOS");
    const puedeEliminar = tienePermiso("ELIMINAR_INSUMOS");

    // Categorías del catálogo (CRUD propio en /api/categoria-insumo)
    const [categorias, setCategorias] = useState<CategoriaInsumo[]>([]);
    const [mostrarCategorias, setMostrarCategorias] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState("");

    // Formulario de alta / edición de insumo
    const [idEditando, setIdEditando] = useState<number | null>(null);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [unidadMedida, setUnidadMedida] = useState("Unidad");
    const [stockActual, setStockActual] = useState<number | "">("");
    const [stockMinimo, setStockMinimo] = useState<number | "">("");
    const [costoUnitario, setCostoUnitario] = useState<number | "">("");

    // Formulario de entrega
    const [idUsuarioEntrega, setIdUsuarioEntrega] = useState<number | "">("");
    const [idInsumoEntrega, setIdInsumoEntrega] = useState<number | "">("");
    const [cantidadEntrega, setCantidadEntrega] = useState<number | "">("");
    const [observacionesEntrega, setObservacionesEntrega] = useState("");

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarInsumos = async () => {
        try {
            const res = await api.get("/insumos", obtenerHeaders());
            setInsumos(res.data);
        } catch (err) {
            console.error("Error al cargar insumos", err);
        }
    };

    const cargarEntregas = async () => {
        try {
            const res = await api.get("/insumos/entregas", obtenerHeaders());
            setEntregas(res.data);
        } catch (err) {
            console.error("Error al cargar entregas", err);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get("/usuarios", obtenerHeaders());
            setUsuarios(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar usuarios", err);
        }
    };

    const cargarCategorias = async () => {
        try {
            const res = await api.get("/categoria-insumo/activos", obtenerHeaders());
            const lista: CategoriaInsumo[] = res.data;
            setCategorias(lista);
            setCategoria((actual) => actual || lista[0]?.nombre || "");
        } catch (err) {
            console.error("Error al cargar categorías de insumo", err);
        }
    };

    useEffect(() => {
        cargarInsumos();
        cargarEntregas();
        cargarUsuarios();
        cargarCategorias();
    }, []);

    const limpiarFormulario = () => {
        setIdEditando(null);
        setNombre(""); setCategoria(categorias[0]?.nombre || ""); setUnidadMedida("Unidad");
        setStockActual(""); setStockMinimo(""); setCostoUnitario("");
    };

    const handleAgregarCategoria = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevaCategoria.trim()) return;
        try {
            await api.post("/categoria-insumo", { nombre: nuevaCategoria.trim().toUpperCase() }, obtenerHeaders());
            setNuevaCategoria("");
            cargarCategorias();
        } catch (err: any) {
            alert("Error al crear la categoría: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleDarDeBajaCategoria = async (id: number) => {
        if (!window.confirm("¿Dar de baja esta categoría? Dejará de estar disponible para nuevos insumos.")) return;
        try {
            await api.patch(`/categoria-insumo/${id}/desactivar`, {}, obtenerHeaders());
            cargarCategorias();
        } catch (err: any) {
            alert("Error al dar de baja la categoría: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleEditarClick = (ins: Insumo) => {
        setIdEditando(ins.idInsumo!);
        setNombre(ins.nombre);
        setCategoria(ins.categoria);
        setUnidadMedida(ins.unidadMedida);
        setStockActual(ins.stockActual);
        setStockMinimo(ins.stockMinimo);
        setCostoUnitario(ins.costoUnitario);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGuardarInsumo = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        try {
            const payload = {
                nombre, categoria, unidadMedida,
                stockActual: Number(stockActual),
                stockMinimo: Number(stockMinimo),
                costoUnitario: Number(costoUnitario)
            };

            if (idEditando) {
                await api.put(`/insumos/${idEditando}`, payload, obtenerHeaders());
                setMensaje("Insumo actualizado con éxito.");
            } else {
                await api.post("/insumos", payload, obtenerHeaders());
                setMensaje("Insumo cargado con éxito al catálogo.");
            }

            limpiarFormulario();
            cargarInsumos();
        } catch (err: any) {
            setError(err.response?.data || "Error al guardar el insumo.");
        }
    };

    const handleDarDeBaja = async (id: number) => {
        if (!window.confirm("¿Dar de baja este insumo? Dejará de estar disponible para nuevas entregas.")) return;
        try {
            await api.delete(`/insumos/${id}`, obtenerHeaders());
            cargarInsumos();
        } catch (err: any) {
            alert("Error al dar de baja: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleReactivar = async (id: number) => {
        try {
            await api.patch(`/insumos/${id}/reactivar`, {}, obtenerHeaders());
            cargarInsumos();
        } catch (err: any) {
            alert("Error al reactivar: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleEntregar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        try {
            await api.post("/insumos/entregas", {
                idUsuario: Number(idUsuarioEntrega),
                idInsumo: Number(idInsumoEntrega),
                cantidad: Number(cantidadEntrega),
                observaciones: observacionesEntrega
            }, obtenerHeaders());

            setMensaje("Entrega registrada y stock descontado con éxito.");
            setCantidadEntrega(""); setObservacionesEntrega("");
            cargarInsumos();
            cargarEntregas();
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar la entrega.");
        }
    };

    const insumosFiltrados = insumos.filter((ins) => {
        if (filtroEstado === "ACTIVOS") return ins.activo !== false;
        if (filtroEstado === "BAJAS") return ins.activo === false;
        return true;
    });

    return (
        <div className="insumos-container">
            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Package size={24} color="#059669" /> GESTIÓN DE INSUMOS
                </h1>

                <div className="insumos-tabs">
                    <button className={`insumos-tab ${vista === "catalogo" ? "activo" : ""}`} onClick={() => setVista("catalogo")}>Catálogo</button>
                    <button className={`insumos-tab ${vista === "entregas" ? "activo" : ""}`} onClick={() => setVista("entregas")}>Entregas a Empleados</button>
                    {(puedeCrear || puedeEliminar) && (
                        <button type="button" className="insumos-tab" onClick={() => setMostrarCategorias((v) => !v)} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <Tags size={14} /> Categorías
                        </button>
                    )}
                </div>

                {mostrarCategorias && (puedeCrear || puedeEliminar) && (
                    <div className="insumos-form-grid" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "18px", marginBottom: "12px" }}>
                        {puedeCrear && (
                            <form onSubmit={handleAgregarCategoria} style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>Nueva categoría</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input className="form-input" style={{ flex: 1 }} value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Ej. VESTIMENTA" />
                                    <button type="submit" className="btn-doc-accion subir" style={{ flexShrink: 0, padding: "0 16px" }}><Tags size={12} /> Agregar</button>
                                </div>
                            </form>
                        )}
                        <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                            {categorias.map((c) => (
                                <span key={c.id} className="badge-categoria" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                    {c.nombre}
                                    {puedeEliminar && (
                                        <button type="button" onClick={() => handleDarDeBajaCategoria(c.id)} title="Dar de baja categoría" style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}>
                                            <X size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {categorias.length === 0 && <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>No hay categorías activas.</span>}
                        </div>
                    </div>
                )}

                {vista === "catalogo" && (
                    <>
                        {(puedeCrear || puedeEditar) && (
                            <form onSubmit={handleGuardarInsumo} className="insumos-form-grid" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "18px" }}>
                                {idEditando && (
                                    <div className="form-section" style={{ gridColumn: "1 / -1" }}>
                                        <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.85rem" }}>✏️ Editando insumo #{idEditando}</span>
                                    </div>
                                )}
                                <div className="form-section" style={{ gridColumn: "span 2" }}>
                                    <label>Nombre del insumo</label>
                                    <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Casco de seguridad" required />
                                </div>
                                <div className="form-section">
                                    <label>Categoría</label>
                                    <select className="form-input" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
                                        <option value="" disabled>Seleccione una categoría</option>
                                        {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-section">
                                    <label>Unidad de medida</label>
                                    <input className="form-input" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} placeholder="Unidad, Par, Caja..." required />
                                </div>
                                <div className="form-section">
                                    <label>{idEditando ? "Stock actual" : "Stock inicial"}</label>
                                    <input type="number" className="form-input" value={stockActual} onChange={(e) => setStockActual(e.target.value as unknown as number)} required />
                                </div>
                                <div className="form-section">
                                    <label>Stock mínimo</label>
                                    <input type="number" className="form-input" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value as unknown as number)} required />
                                </div>
                                <div className="form-section">
                                    <label>Costo unitario ($)</label>
                                    <input type="number" step="0.01" className="form-input" value={costoUnitario} onChange={(e) => setCostoUnitario(e.target.value as unknown as number)} required />
                                </div>
                                <div className="form-section" style={{ justifyContent: "flex-end", flexDirection: "row", gap: "8px" }}>
                                    {idEditando && (
                                        <button type="button" className="btn-doc-accion" onClick={limpiarFormulario}><X size={14} /> Cancelar</button>
                                    )}
                                    <button type="submit" className="btn-primario">
                                        {idEditando ? <><Edit2 size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Guardar Cambios</> : <><PackagePlus size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Agregar al Catálogo</>}
                                    </button>
                                </div>
                            </form>
                        )}

                        {error && <p className="msg-error">{error}</p>}
                        {mensaje && <p className="msg-exito">{mensaje}</p>}

                        <div className="insumos-tabs" style={{ marginTop: "16px" }}>
                            <button className={`insumos-tab ${filtroEstado === "ACTIVOS" ? "activo" : ""}`} onClick={() => setFiltroEstado("ACTIVOS")}>Activos</button>
                            <button className={`insumos-tab ${filtroEstado === "BAJAS" ? "activo" : ""}`} onClick={() => setFiltroEstado("BAJAS")}>Dados de Baja</button>
                            <button className={`insumos-tab ${filtroEstado === "TODOS" ? "activo" : ""}`} onClick={() => setFiltroEstado("TODOS")}>Todos</button>
                        </div>

                        <div className="tabla-simetrica-wrapper" style={{ marginTop: "12px" }}>
                            <table className="tabla-insumos">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Unidad</th>
                                        <th style={{ textAlign: "center" }}>Stock</th>
                                        <th style={{ textAlign: "center" }}>Stock Mín.</th>
                                        <th style={{ textAlign: "right" }}>Costo Unit.</th>
                                        {(puedeEditar || puedeEliminar) && <th>Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {insumosFiltrados.length > 0 ? insumosFiltrados.map((ins) => (
                                        <tr key={ins.idInsumo} style={{ opacity: ins.activo === false ? 0.6 : 1 }}>
                                            <td>{ins.nombre}</td>
                                            <td><span className={`badge-categoria ${ins.categoria}`}>{ins.categoria}</span></td>
                                            <td>{ins.unidadMedida}</td>
                                            <td style={{ textAlign: "center" }} className={ins.stockActual <= ins.stockMinimo ? "stock-bajo" : ""}>
                                                {ins.stockActual} {ins.stockActual <= ins.stockMinimo && <AlertTriangle size={13} style={{ verticalAlign: "middle", marginLeft: "4px" }} />}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{ins.stockMinimo}</td>
                                            <td style={{ textAlign: "right" }}>${ins.costoUnitario.toLocaleString()}</td>
                                            {(puedeEditar || puedeEliminar) && (
                                                <td>
                                                    <div className="acciones-doc">
                                                        {puedeEditar && (
                                                            <button type="button" className="btn-doc-accion subir" onClick={() => handleEditarClick(ins)}><Edit2 size={12} /> Editar</button>
                                                        )}
                                                        {puedeEliminar && ins.activo !== false && (
                                                            <button type="button" className="btn-doc-accion" style={{ backgroundColor: "#dc2626" }} onClick={() => handleDarDeBaja(ins.idInsumo!)}><Ban size={12} /> Dar de Baja</button>
                                                        )}
                                                        {puedeEliminar && ins.activo === false && (
                                                            <button type="button" className="btn-doc-accion descargar" onClick={() => handleReactivar(ins.idInsumo!)}><RotateCcw size={12} /> Reactivar</button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="txt-vacio">No hay insumos para este filtro.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {vista === "entregas" && (
                    <>
                        {puedeCrear && (
                            <form onSubmit={handleEntregar} className="insumos-form-grid" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "18px" }}>
                                <div className="form-section">
                                    <label>Empleado</label>
                                    <select className="form-input" value={idUsuarioEntrega} onChange={(e) => setIdUsuarioEntrega(e.target.value as unknown as number)} required>
                                        <option value="" disabled>Seleccione un empleado</option>
                                        {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido}</option>)}
                                    </select>
                                </div>
                                <div className="form-section">
                                    <label>Insumo</label>
                                    <select className="form-input" value={idInsumoEntrega} onChange={(e) => setIdInsumoEntrega(e.target.value as unknown as number)} required>
                                        <option value="" disabled>Seleccione un insumo</option>
                                        {insumos.filter((i) => i.activo !== false).map((i) => <option key={i.idInsumo} value={i.idInsumo}>{i.nombre} (stock: {i.stockActual})</option>)}
                                    </select>
                                </div>
                                <div className="form-section">
                                    <label>Cantidad</label>
                                    <input type="number" min={1} className="form-input" value={cantidadEntrega} onChange={(e) => setCantidadEntrega(e.target.value as unknown as number)} required />
                                </div>
                                <div className="form-section" style={{ gridColumn: "span 2" }}>
                                    <label>Observaciones</label>
                                    <input className="form-input" value={observacionesEntrega} onChange={(e) => setObservacionesEntrega(e.target.value)} placeholder="Opcional" />
                                </div>
                                <div className="form-section" style={{ justifyContent: "flex-end" }}>
                                    <button type="submit" className="btn-primario"><Truck size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Registrar Entrega</button>
                                </div>
                            </form>
                        )}

                        {error && <p className="msg-error">{error}</p>}
                        {mensaje && <p className="msg-exito">{mensaje}</p>}

                        <div className="tabla-simetrica-wrapper" style={{ marginTop: "18px" }}>
                            <table className="tabla-insumos">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Empleado</th>
                                        <th>Insumo</th>
                                        <th style={{ textAlign: "center" }}>Cantidad</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entregas.length > 0 ? entregas.map((e) => (
                                        <tr key={e.idEntrega}>
                                            <td>{e.fechaEntrega}</td>
                                            <td>{e.usuario?.nombre} {e.usuario?.apellido}</td>
                                            <td>{e.insumo?.nombre}</td>
                                            <td style={{ textAlign: "center" }}>{e.cantidad}</td>
                                            <td>{e.observaciones || "-"}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="txt-vacio">No hay entregas registradas todavía.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GestionInsumosComponent;
