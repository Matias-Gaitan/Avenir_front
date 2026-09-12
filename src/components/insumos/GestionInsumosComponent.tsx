import React, { useState, useEffect } from "react";
import { Package, PackagePlus, Truck, AlertTriangle } from "lucide-react";
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

const CATEGORIAS = ["EPP", "SEÑALIZACION", "EMERGENCIA", "MEDICION", "HIGIENE"];

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const GestionInsumosComponent: React.FC = () => {
    const [vista, setVista] = useState<"catalogo" | "entregas">("catalogo");
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [entregas, setEntregas] = useState<EntregaInsumo[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([]);

    const puedeCrear = tienePermiso("CREAR_INSUMOS");

    // Formulario de alta de insumo
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
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

    useEffect(() => {
        cargarInsumos();
        cargarEntregas();
        cargarUsuarios();
    }, []);

    const handleCrearInsumo = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        try {
            await api.post("/insumos", {
                nombre,
                categoria,
                unidadMedida,
                stockActual: Number(stockActual),
                stockMinimo: Number(stockMinimo),
                costoUnitario: Number(costoUnitario)
            }, obtenerHeaders());

            setMensaje("Insumo cargado con éxito al catálogo.");
            setNombre(""); setStockActual(""); setStockMinimo(""); setCostoUnitario("");
            cargarInsumos();
        } catch (err: any) {
            setError(err.response?.data || "Error al cargar el insumo.");
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

    return (
        <div className="insumos-container">
            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Package size={24} color="#059669" /> GESTIÓN DE INSUMOS
                </h1>

                <div className="insumos-tabs">
                    <button className={`insumos-tab ${vista === "catalogo" ? "activo" : ""}`} onClick={() => setVista("catalogo")}>Catálogo</button>
                    <button className={`insumos-tab ${vista === "entregas" ? "activo" : ""}`} onClick={() => setVista("entregas")}>Entregas a Empleados</button>
                </div>

                {vista === "catalogo" && (
                    <>
                        {puedeCrear && (
                            <form onSubmit={handleCrearInsumo} className="insumos-form-grid" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "18px" }}>
                                <div className="form-section" style={{ gridColumn: "span 2" }}>
                                    <label>Nombre del insumo</label>
                                    <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Casco de seguridad" required />
                                </div>
                                <div className="form-section">
                                    <label>Categoría</label>
                                    <select className="form-input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                                        {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-section">
                                    <label>Unidad de medida</label>
                                    <input className="form-input" value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)} placeholder="Unidad, Par, Caja..." required />
                                </div>
                                <div className="form-section">
                                    <label>Stock inicial</label>
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
                                <div className="form-section" style={{ justifyContent: "flex-end" }}>
                                    <button type="submit" className="btn-primario"><PackagePlus size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Agregar al Catálogo</button>
                                </div>
                            </form>
                        )}

                        {error && <p className="msg-error">{error}</p>}
                        {mensaje && <p className="msg-exito">{mensaje}</p>}

                        <div className="tabla-simetrica-wrapper" style={{ marginTop: "18px" }}>
                            <table className="tabla-insumos">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Unidad</th>
                                        <th style={{ textAlign: "center" }}>Stock</th>
                                        <th style={{ textAlign: "center" }}>Stock Mín.</th>
                                        <th style={{ textAlign: "right" }}>Costo Unit.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {insumos.length > 0 ? insumos.map((ins) => (
                                        <tr key={ins.idInsumo}>
                                            <td>{ins.nombre}</td>
                                            <td><span className={`badge-categoria ${ins.categoria}`}>{ins.categoria}</span></td>
                                            <td>{ins.unidadMedida}</td>
                                            <td style={{ textAlign: "center" }} className={ins.stockActual <= ins.stockMinimo ? "stock-bajo" : ""}>
                                                {ins.stockActual} {ins.stockActual <= ins.stockMinimo && <AlertTriangle size={13} style={{ verticalAlign: "middle", marginLeft: "4px" }} />}
                                            </td>
                                            <td style={{ textAlign: "center" }}>{ins.stockMinimo}</td>
                                            <td style={{ textAlign: "right" }}>${ins.costoUnitario.toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={6} className="txt-vacio">No hay insumos cargados en el catálogo.</td></tr>
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
