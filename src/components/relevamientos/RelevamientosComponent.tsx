import React, { useEffect, useState } from "react";
import { ClipboardList, Upload, Trash2, CheckCircle2, FileText, Image as ImageIcon, X } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "../insumos/insumos.css";
import type { Empresa } from "../../interfaces/Empresa";
import type { Relevamiento, TipoRiesgo } from "../../interfaces/Relevamiento";
import { usePaginacion } from "../common/usePaginacion";
import { Paginador } from "../common/Paginador";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const RelevamientosComponent: React.FC = () => {
    const [relevamientos, setRelevamientos] = useState<Relevamiento[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [tiposRiesgo, setTiposRiesgo] = useState<TipoRiesgo[]>([]);
    const [seleccionado, setSeleccionado] = useState<Relevamiento | null>(null);

    const puedeCrear = tienePermiso("CREAR_RELEVAMIENTOS");
    const puedeEditar = tienePermiso("EDITAR_RELEVAMIENTOS");
    const puedeVer = tienePermiso("VER_RELEVAMIENTOS");

    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [observaciones, setObservaciones] = useState("");

    const [descripcionHallazgo, setDescripcionHallazgo] = useState("");
    const [idTipoRiesgoHallazgo, setIdTipoRiesgoHallazgo] = useState<number | "">("");

    const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarRelevamientos = async () => {
        try {
            const res = await api.get("/relevamientos", obtenerHeaders());
            setRelevamientos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setRelevamientos([]);
        }
    };

    const cargarEmpresas = async () => {
        try {
            const res = await api.get("/empresas", obtenerHeaders());
            setEmpresas(Array.isArray(res.data) ? res.data.filter((e: Empresa) => e.activo) : []);
        } catch (err) { console.error("Error al cargar empresas", err); }
    };

    const cargarTiposRiesgo = async () => {
        try {
            const res = await api.get("/tipo-riesgo/activos", obtenerHeaders());
            setTiposRiesgo(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error al cargar tipos de riesgo", err); }
    };

    useEffect(() => {
        if (!puedeVer) return;
        cargarRelevamientos();
        cargarEmpresas();
        cargarTiposRiesgo();

    }, []);

    const refrescarSeleccionado = async (id: number) => {
        try {
            const res = await api.get(`/relevamientos/${id}`, obtenerHeaders());
            setSeleccionado(res.data);
        } catch (err) { console.error("Error al refrescar el relevamiento", err); }
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        try {
            await api.post("/relevamientos", {
                idEmpresa: idEmpresa || null,
                fecha,
                observaciones,
            }, obtenerHeaders());
            setMensaje("Relevamiento creado con éxito.");
            setIdEmpresa(""); setObservaciones(""); setFecha(new Date().toISOString().split("T")[0]);
            cargarRelevamientos();
        } catch (err: any) {
            setError(err.response?.data || "Error al crear el relevamiento.");
        }
    };

    const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
        try {
            await api.put(`/relevamientos/${id}/estado`, { estado: nuevoEstado }, obtenerHeaders());
            cargarRelevamientos();
            if (seleccionado?.idRelevamiento === id) refrescarSeleccionado(id);
        } catch (err: any) {
            alert("No se pudo cambiar el estado: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleAgregarHallazgo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado?.idRelevamiento) return;
        setError(""); setMensaje("");
        try {
            await api.post(`/relevamientos/${seleccionado.idRelevamiento}/hallazgos`, {
                idTipoRiesgo: idTipoRiesgoHallazgo || null,
                descripcion: descripcionHallazgo,
            }, obtenerHeaders());
            setDescripcionHallazgo(""); setIdTipoRiesgoHallazgo("");
            refrescarSeleccionado(seleccionado.idRelevamiento);
        } catch (err: any) {
            setError(err.response?.data || "Error al agregar el hallazgo.");
        }
    };

    const handleResolverHallazgo = async (idHallazgo: number) => {
        if (!seleccionado?.idRelevamiento) return;
        try {
            await api.put(`/relevamientos/hallazgos/${idHallazgo}/resolver`, {}, obtenerHeaders());
            refrescarSeleccionado(seleccionado.idRelevamiento);
        } catch (err: any) {
            alert("No se pudo resolver el hallazgo: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleSubirArchivo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seleccionado?.idRelevamiento || !archivoSeleccionado) return;
        setError(""); setMensaje("");
        setSubiendoArchivo(true);
        try {
            const formData = new FormData();
            formData.append("archivo", archivoSeleccionado);
            formData.append("emailUsuario", localStorage.getItem("email") || "");
            await api.post(`/relevamientos/${seleccionado.idRelevamiento}/archivos`, formData, {
                ...obtenerHeaders(),
                headers: { ...obtenerHeaders().headers, "Content-Type": "multipart/form-data" },
            });
            setArchivoSeleccionado(null);
            setMensaje("Archivo subido con éxito.");
            refrescarSeleccionado(seleccionado.idRelevamiento);
        } catch (err: any) {
            setError(err.response?.data || "Error al subir el archivo.");
        } finally {
            setSubiendoArchivo(false);
        }
    };

    const handleEliminarArchivo = async (idArchivo: number) => {
        if (!seleccionado?.idRelevamiento) return;
        if (!window.confirm("¿Eliminar este archivo?")) return;
        try {
            await api.delete(`/relevamientos/archivos/${idArchivo}`, obtenerHeaders());
            refrescarSeleccionado(seleccionado.idRelevamiento);
        } catch (err: any) {
            alert("No se pudo eliminar el archivo: " + (err.response?.data || "Error desconocido"));
        }
    };

    if (!puedeVer) {
        return (
            <div className="insumos-container">
                <div className="insumos-card">
                    <p className="txt-vacio">No tenés permiso para ver los relevamientos.</p>
                </div>
            </div>
        );
    }

    const { itemsPagina: relevamientosPagina, pagina, totalPaginas, setPagina, totalItems, porPagina } = usePaginacion(relevamientos, 8);

    return (
        <div className="insumos-container">
            {puedeCrear && (
                <div className="insumos-card">
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <ClipboardList size={24} color="#059669" /> NUEVO RELEVAMIENTO
                    </h1>
                    <form onSubmit={handleCrear} className="insumos-form-grid">
                        <div className="form-section">
                            <label>Empresa / Sede</label>
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
                            <label>Observaciones</label>
                            <input className="form-input" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
                        </div>
                        <div className="form-section" style={{ gridColumn: "1 / -1", justifyContent: "flex-end", flexDirection: "row" }}>
                            <button type="submit" className="btn-primario">Crear Relevamiento</button>
                        </div>
                    </form>
                    {error && <p className="msg-error">{error}</p>}
                    {mensaje && <p className="msg-exito">{mensaje}</p>}
                </div>
            )}

            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <ClipboardList size={24} color="#059669" /> RELEVAMIENTOS
                </h1>
                <div className="tabla-simetrica-wrapper">
                    <table className="tabla-insumos">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Fecha</th>
                                <th>Técnico</th>
                                <th style={{ textAlign: "center" }}>Hallazgos</th>
                                <th style={{ textAlign: "center" }}>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relevamientosPagina.length > 0 ? relevamientosPagina.map((r) => {
                                const resueltos = r.hallazgos.filter((h) => h.estado === "RESUELTO").length;
                                return (
                                    <tr key={r.idRelevamiento}>
                                        <td>{r.empresa?.nombre}</td>
                                        <td>{r.fecha}</td>
                                        <td>{r.tecnico ? `${r.tecnico.nombre} ${r.tecnico.apellido}` : "-"}</td>
                                        <td style={{ textAlign: "center" }}>{resueltos}/{r.hallazgos.length} resueltos</td>
                                        <td style={{ textAlign: "center" }}>{r.estado}</td>
                                        <td>
                                            <div className="acciones-doc">
                                                <button className="btn-doc-accion subir" onClick={() => setSeleccionado(r)}>Ver Detalle</button>
                                                {puedeEditar && r.estado !== "CERRADO" && (
                                                    <button className="btn-doc-accion descargar" onClick={() => handleCambiarEstado(r.idRelevamiento!, "CERRADO")}>Cerrar</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={6} className="txt-vacio">No hay relevamientos cargados todavía.</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Paginador pagina={pagina} totalPaginas={totalPaginas} totalItems={totalItems} porPagina={porPagina} onCambiarPagina={setPagina} />
                </div>
            </div>

            {seleccionado && (
                <div className="insumos-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h1 style={{ margin: 0, borderBottom: "none", textAlign: "left" }}>
                            {seleccionado.empresa?.nombre} — {seleccionado.fecha}
                        </h1>
                        <button className="btn-doc-accion" onClick={() => setSeleccionado(null)}><X size={14} /></button>
                    </div>
                    {seleccionado.observaciones && <p style={{ color: "#475569", marginTop: 0 }}>{seleccionado.observaciones}</p>}

                    <h2 style={{ fontSize: "1rem", color: "#064e3b" }}>Hallazgos</h2>
                    {puedeCrear && (
                        <form onSubmit={handleAgregarHallazgo} className="insumos-form-grid">
                            <div className="form-section" style={{ gridColumn: "span 2" }}>
                                <label>Descripción del hallazgo</label>
                                <input className="form-input" value={descripcionHallazgo} onChange={(e) => setDescripcionHallazgo(e.target.value)} placeholder="Ej: Extintor vencido en sector depósito" required />
                            </div>
                            <div className="form-section">
                                <label>Tipo de riesgo</label>
                                <select className="form-input" value={idTipoRiesgoHallazgo} onChange={(e) => setIdTipoRiesgoHallazgo(e.target.value as unknown as number)}>
                                    <option value="">(Opcional) Sin categorizar</option>
                                    {tiposRiesgo.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-section" style={{ justifyContent: "flex-end" }}>
                                <button type="submit" className="btn-primario">Agregar Hallazgo</button>
                            </div>
                        </form>
                    )}

                    <div className="tabla-simetrica-wrapper" style={{ marginBottom: "20px" }}>
                        <table className="tabla-insumos">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Tipo de riesgo</th>
                                    <th style={{ textAlign: "center" }}>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seleccionado.hallazgos.length > 0 ? seleccionado.hallazgos.map((h) => (
                                    <tr key={h.idHallazgo}>
                                        <td>{h.descripcion}</td>
                                        <td>{h.tipoRiesgo?.nombre || "Sin categorizar"}</td>
                                        <td style={{ textAlign: "center" }}>{h.estado}</td>
                                        <td>
                                            {puedeEditar && h.estado === "ENCONTRADO" && (
                                                <button className="btn-doc-accion descargar" onClick={() => handleResolverHallazgo(h.idHallazgo!)}>
                                                    <CheckCircle2 size={12} /> Resolver
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="txt-vacio">Todavía no se cargaron hallazgos.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <h2 style={{ fontSize: "1rem", color: "#064e3b" }}>Documentación (fotos / PDFs)</h2>
                    {puedeCrear && (
                        <form onSubmit={handleSubirArchivo} className="insumos-form-grid">
                            <div className="form-section" style={{ gridColumn: "span 2" }}>
                                <label>Archivo</label>
                                <input type="file" className="form-input" accept="image/*,.pdf"
                                    onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] || null)} />
                            </div>
                            <div className="form-section" style={{ justifyContent: "flex-end" }}>
                                <button type="submit" className="btn-primario" disabled={!archivoSeleccionado || subiendoArchivo}>
                                    <Upload size={14} /> {subiendoArchivo ? "Subiendo..." : "Subir Archivo"}
                                </button>
                            </div>
                        </form>
                    )}
                    {error && <p className="msg-error">{error}</p>}
                    {mensaje && <p className="msg-exito">{mensaje}</p>}

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                        {seleccionado.archivos.length > 0 ? seleccionado.archivos.map((a) => (
                            <div key={a.idArchivo} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px", width: "180px" }}>
                                <a href={a.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: 700, fontSize: "0.8rem", textDecoration: "none" }}>
                                    {a.tipoContenido?.startsWith("image/") ? <ImageIcon size={14} /> : <FileText size={14} />}
                                    {a.nombreArchivo.length > 18 ? a.nombreArchivo.slice(0, 15) + "..." : a.nombreArchivo}
                                </a>
                                {puedeEditar && (
                                    <button className="btn-doc-accion" style={{ marginTop: "8px", backgroundColor: "#dc2626" }} onClick={() => handleEliminarArchivo(a.idArchivo!)}>
                                        <Trash2 size={12} /> Eliminar
                                    </button>
                                )}
                            </div>
                        )) : (
                            <p className="txt-vacio" style={{ width: "100%" }}>No hay archivos cargados todavía.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RelevamientosComponent;
