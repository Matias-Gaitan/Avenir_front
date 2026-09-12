import React, { useState, useEffect } from "react";
import { Fuel, Check, X, Wallet, Edit2, Ban, RotateCcw, Zap } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./insumos.css";
import type { RegistroViatico } from "../../interfaces/RegistroViatico";
import type { Empresa } from "../../interfaces/Empresa";

interface UsuarioOpcion {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    tarifaPorKm?: number;
}

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const ViaticosComponent: React.FC = () => {
    const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [registros, setRegistros] = useState<RegistroViatico[]>([]);
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split("T")[0]);
    const [filtroEstado, setFiltroEstado] = useState<"ACTIVOS" | "BAJAS" | "TODOS">("ACTIVOS");

    const email = localStorage.getItem("email") || "";
    const puedeAprobar = tienePermiso("APROBAR_VIATICOS");
    // La carga y edición manual de kilómetros queda reservada a quien aprueba viáticos:
    // el flujo normal de un empleado genera el viático solo, por geolocalización al
    // marcar ingreso a una empresa, para evitar que cargue kilómetros falsos.
    const puedeEditar = puedeAprobar;
    const puedeAdministrarTarifas = tienePermiso("EDITAR_USUARIOS");

    const [idEditando, setIdEditando] = useState<number | null>(null);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
    const [kilometros, setKilometros] = useState<number | "">("");
    const [observaciones, setObservaciones] = useState("");

    const [idUsuarioTarifa, setIdUsuarioTarifa] = useState<number | "">("");
    const [nuevaTarifa, setNuevaTarifa] = useState<number | "">("");

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarUsuarios = async () => {
        try {
            const res = await api.get("/usuarios", obtenerHeaders());
            setUsuarios(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Error al cargar usuarios", err); }
    };

    const cargarEmpresas = async () => {
        try {
            const res = await api.get("/empresas", obtenerHeaders());
            setEmpresas(Array.isArray(res.data) ? res.data.filter((e: Empresa) => e.activo) : []);
        } catch (err) { console.error("Error al cargar empresas", err); }
    };

    const buscarRegistros = async (f: string, filtro: "ACTIVOS" | "BAJAS" | "TODOS" = filtroEstado) => {
        try {
            const activoParam = filtro === "ACTIVOS" ? "true" : filtro === "BAJAS" ? "false" : "";
            const url = activoParam ? `/viaticos/calendario?fecha=${f}&activo=${activoParam}` : `/viaticos/calendario?fecha=${f}`;
            const res = await api.get(url, obtenerHeaders());
            setRegistros(res.data);
        } catch (err) {
            setRegistros([]);
        }
    };

    useEffect(() => {
        cargarUsuarios();
        cargarEmpresas();
        buscarRegistros(fechaFiltro, filtroEstado);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tarifaEmpleadoActual = usuarios.find((u) => u.email === email)?.tarifaPorKm ?? 0;
    const montoEstimado = typeof kilometros === "number" ? Math.round(kilometros * tarifaEmpleadoActual * 100) / 100 : 0;

    const limpiarFormulario = () => {
        setIdEditando(null);
        setIdEmpresa(""); setFecha(new Date().toISOString().split("T")[0]);
        setKilometros(""); setObservaciones("");
    };

    const handleEditarClick = (r: RegistroViatico) => {
        setIdEditando(r.idViatico!);
        setIdEmpresa(r.empresa?.idEmpresa || "");
        setFecha(r.fecha);
        setKilometros(r.kilometros);
        setObservaciones(r.observaciones || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        try {
            if (idEditando) {
                await api.put(`/viaticos/${idEditando}`, {
                    idEmpresa: idEmpresa || null,
                    fecha,
                    kilometros: Number(kilometros),
                    observaciones
                }, obtenerHeaders());
                setMensaje("Viático actualizado con éxito.");
            } else {
                await api.post("/viaticos/registrar", {
                    emailUsuario: email,
                    idEmpresa: idEmpresa || null,
                    fecha,
                    kilometros: Number(kilometros),
                    observaciones
                }, obtenerHeaders());
                setMensaje("Viático registrado con éxito. Queda pendiente de aprobación.");
            }

            limpiarFormulario();
            buscarRegistros(fechaFiltro, filtroEstado);
        } catch (err: any) {
            setError(err.response?.data || "Error al guardar el viático.");
        }
    };

    const handleCambiarEstado = async (id: number | undefined, nuevoEstado: "APROBADO" | "RECHAZADO" | "PAGADO") => {
        if (!id) return;
        try {
            await api.put(`/viaticos/${id}/estado`, { estado: nuevoEstado }, obtenerHeaders());
            buscarRegistros(fechaFiltro, filtroEstado);
        } catch (err: any) {
            alert("No se pudo cambiar el estado: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleDarDeBaja = async (id: number) => {
        if (!window.confirm("¿Dar de baja este registro de viático?")) return;
        try {
            await api.delete(`/viaticos/${id}`, obtenerHeaders());
            buscarRegistros(fechaFiltro, filtroEstado);
        } catch (err: any) {
            alert("Error al dar de baja: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleReactivar = async (id: number) => {
        try {
            await api.patch(`/viaticos/${id}/reactivar`, {}, obtenerHeaders());
            buscarRegistros(fechaFiltro, filtroEstado);
        } catch (err: any) {
            alert("Error al reactivar: " + (err.response?.data || "Error desconocido"));
        }
    };

    const handleGuardarTarifa = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        const usuario = usuarios.find((u) => u.idUsuario === Number(idUsuarioTarifa));
        if (!usuario) return;
        try {
            await api.put(`/usuarios/${idUsuarioTarifa}`, { ...usuario, tarifaPorKm: Number(nuevaTarifa) }, obtenerHeaders());
            setMensaje("Tarifa por kilómetro actualizada con éxito.");
            setNuevaTarifa("");
            cargarUsuarios();
        } catch (err: any) {
            setError(err.response?.data || "Error al actualizar la tarifa.");
        }
    };

    return (
        <div className="insumos-container">
            {puedeAdministrarTarifas && (
                <div className="insumos-card">
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <Wallet size={24} color="#059669" /> TARIFA POR KILÓMETRO
                    </h1>
                    <form onSubmit={handleGuardarTarifa} className="insumos-form-grid">
                        <div className="form-section">
                            <label>Empleado</label>
                            <select className="form-input" value={idUsuarioTarifa} onChange={(e) => setIdUsuarioTarifa(e.target.value as unknown as number)} required>
                                <option value="" disabled>Seleccione un empleado</option>
                                {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido} (actual: ${u.tarifaPorKm ?? 0}/km)</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Nueva tarifa ($/km)</label>
                            <input type="number" step="0.01" min={0} className="form-input" value={nuevaTarifa} onChange={(e) => setNuevaTarifa(e.target.value as unknown as number)} required />
                        </div>
                        <div className="form-section" style={{ justifyContent: "flex-end" }}>
                            <button type="submit" className="btn-primario">Guardar Tarifa</button>
                        </div>
                    </form>
                </div>
            )}

            {!puedeAprobar && (
                <div className="insumos-card">
                    <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                        <Zap size={16} color="#059669" />
                        Tus kilómetros recorridos se calculan automáticamente por geolocalización al marcar el ingreso a una empresa. Quedan pendientes hasta que un administrador los valide.
                    </p>
                </div>
            )}

            {puedeAprobar && (
            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Fuel size={24} color="#059669" /> {idEditando ? "EDITAR VIÁTICO" : "REGISTRAR KILÓMETROS (CARGA MANUAL)"}
                </h1>

                <form onSubmit={handleGuardar} className="insumos-form-grid">
                    <div className="form-section">
                        <label>Empresa / Sede visitada</label>
                        <select className="form-input" value={idEmpresa} onChange={(e) => setIdEmpresa(e.target.value as unknown as number)}>
                            <option value="">(Opcional) Seleccione una empresa</option>
                            {empresas.map((emp) => <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>)}
                        </select>
                    </div>
                    <div className="form-section">
                        <label>Fecha</label>
                        <input type="date" className="form-input" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                    </div>
                    <div className="form-section">
                        <label>Kilómetros recorridos</label>
                        <input type="number" step="0.1" min={0.1} className="form-input" value={kilometros} onChange={(e) => setKilometros(e.target.value as unknown as number)} required />
                    </div>
                    <div className="form-section" style={{ gridColumn: "span 2" }}>
                        <label>Observaciones</label>
                        <input className="form-input" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
                    </div>
                    <div className="form-section" style={{ justifyContent: "center" }}>
                        <label>Monto estimado</label>
                        <div style={{ fontWeight: 800, color: "#059669", fontSize: "1.1rem" }}>${montoEstimado.toLocaleString()}</div>
                    </div>
                    <div className="form-section" style={{ gridColumn: "1 / -1", justifyContent: "flex-end", flexDirection: "row", gap: "8px" }}>
                        {idEditando && (
                            <button type="button" className="btn-doc-accion" onClick={limpiarFormulario}><X size={14} /> Cancelar</button>
                        )}
                        <button type="submit" className="btn-primario">{idEditando ? "Guardar Cambios" : "Registrar Viático"}</button>
                    </div>
                </form>

                {error && <p className="msg-error">{error}</p>}
                {mensaje && <p className="msg-exito">{mensaje}</p>}
            </div>
            )}

            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Fuel size={24} color="#059669" /> LIQUIDACIÓN DE VIÁTICOS
                </h1>

                <div className="insumos-tabs">
                    <input type="date" className="form-input" style={{ maxWidth: "200px" }} value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
                    <button className="insumos-tab" onClick={() => buscarRegistros(fechaFiltro, filtroEstado)}>Buscar</button>
                </div>

                <div className="insumos-tabs" style={{ marginTop: "10px" }}>
                    <button className={`insumos-tab ${filtroEstado === "ACTIVOS" ? "activo" : ""}`} onClick={() => { setFiltroEstado("ACTIVOS"); buscarRegistros(fechaFiltro, "ACTIVOS"); }}>Activos</button>
                    <button className={`insumos-tab ${filtroEstado === "BAJAS" ? "activo" : ""}`} onClick={() => { setFiltroEstado("BAJAS"); buscarRegistros(fechaFiltro, "BAJAS"); }}>Dados de Baja</button>
                    <button className={`insumos-tab ${filtroEstado === "TODOS" ? "activo" : ""}`} onClick={() => { setFiltroEstado("TODOS"); buscarRegistros(fechaFiltro, "TODOS"); }}>Todos</button>
                </div>

                <div className="tabla-simetrica-wrapper" style={{ marginTop: "12px" }}>
                    <table className="tabla-insumos">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Empresa</th>
                                <th style={{ textAlign: "center" }}>Km</th>
                                <th style={{ textAlign: "center" }}>Tarifa</th>
                                <th style={{ textAlign: "right" }}>Monto</th>
                                <th style={{ textAlign: "center" }}>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.length > 0 ? registros.map((r) => (
                                <tr key={r.idViatico} style={{ opacity: r.activo === false ? 0.6 : 1 }}>
                                    <td>{r.usuario?.nombre} {r.usuario?.apellido}</td>
                                    <td>{r.empresa?.nombre || "-"}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {r.kilometros} {r.generadoAutomaticamente && <Zap size={12} color="#f59e0b" style={{ verticalAlign: "middle" }} aria-label="Generado automáticamente por geolocalización" />}
                                    </td>
                                    <td style={{ textAlign: "center" }}>${r.tarifaPorKmAplicada}</td>
                                    <td style={{ textAlign: "right" }}>${r.montoAPagar.toLocaleString()}</td>
                                    <td style={{ textAlign: "center" }}>{r.estado}</td>
                                    <td>
                                        <div className="acciones-doc">
                                            {puedeAprobar && r.activo !== false && r.estado !== "APROBADO" && <button className="btn-doc-accion descargar" onClick={() => handleCambiarEstado(r.idViatico, "APROBADO")}><Check size={12} /></button>}
                                            {puedeAprobar && r.activo !== false && r.estado !== "RECHAZADO" && <button className="btn-doc-accion" style={{ backgroundColor: "#dc2626" }} onClick={() => handleCambiarEstado(r.idViatico, "RECHAZADO")}><X size={12} /></button>}
                                            {puedeEditar && r.activo !== false && <button className="btn-doc-accion subir" onClick={() => handleEditarClick(r)}><Edit2 size={12} /></button>}
                                            {puedeAprobar && r.activo !== false && <button className="btn-doc-accion" style={{ backgroundColor: "#64748b" }} onClick={() => handleDarDeBaja(r.idViatico!)}><Ban size={12} /></button>}
                                            {puedeAprobar && r.activo === false && <button className="btn-doc-accion descargar" onClick={() => handleReactivar(r.idViatico!)}><RotateCcw size={12} /></button>}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="txt-vacio">No hay viáticos registrados para este filtro.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViaticosComponent;
