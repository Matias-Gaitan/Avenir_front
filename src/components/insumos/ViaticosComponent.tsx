import React, { useState, useEffect } from "react";
import { Fuel, Check, X, Wallet } from "lucide-react";
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

    const email = localStorage.getItem("email") || "";
    const puedeAprobar = tienePermiso("APROBAR_VIATICOS");
    const puedeAdministrarTarifas = tienePermiso("EDITAR_USUARIOS");

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

    const buscarRegistros = async (f: string) => {
        try {
            const res = await api.get(`/viaticos/calendario?fecha=${f}`, obtenerHeaders());
            setRegistros(res.data);
        } catch (err) {
            setRegistros([]);
        }
    };

    useEffect(() => {
        cargarUsuarios();
        cargarEmpresas();
        buscarRegistros(fechaFiltro);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const tarifaEmpleadoActual = usuarios.find((u) => u.email === email)?.tarifaPorKm ?? 0;
    const montoEstimado = typeof kilometros === "number" ? Math.round(kilometros * tarifaEmpleadoActual * 100) / 100 : 0;

    const handleRegistrar = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        try {
            await api.post("/viaticos/registrar", {
                emailUsuario: email,
                idEmpresa: idEmpresa || null,
                fecha,
                kilometros: Number(kilometros),
                observaciones
            }, obtenerHeaders());

            setMensaje("Viático registrado con éxito. Queda pendiente de aprobación.");
            setKilometros(""); setObservaciones("");
            buscarRegistros(fechaFiltro);
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar el viático.");
        }
    };

    const handleCambiarEstado = async (id: number | undefined, nuevoEstado: "APROBADO" | "RECHAZADO" | "PAGADO") => {
        if (!id) return;
        try {
            await api.put(`/viaticos/${id}/estado`, { estado: nuevoEstado }, obtenerHeaders());
            buscarRegistros(fechaFiltro);
        } catch (err: any) {
            alert("No se pudo cambiar el estado: " + (err.response?.data || "Error desconocido"));
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

            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Fuel size={24} color="#059669" /> REGISTRAR KILÓMETROS RECORRIDOS
                </h1>

                <form onSubmit={handleRegistrar} className="insumos-form-grid">
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
                    <div className="form-section" style={{ gridColumn: "1 / -1", justifyContent: "flex-end", flexDirection: "row" }}>
                        <button type="submit" className="btn-primario">Registrar Viático</button>
                    </div>
                </form>

                {error && <p className="msg-error">{error}</p>}
                {mensaje && <p className="msg-exito">{mensaje}</p>}
            </div>

            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Fuel size={24} color="#059669" /> LIQUIDACIÓN DE VIÁTICOS
                </h1>

                <div className="insumos-tabs">
                    <input type="date" className="form-input" style={{ maxWidth: "200px" }} value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
                    <button className="insumos-tab" onClick={() => buscarRegistros(fechaFiltro)}>Buscar</button>
                </div>

                <div className="tabla-simetrica-wrapper">
                    <table className="tabla-insumos">
                        <thead>
                            <tr>
                                <th>Empleado</th>
                                <th>Empresa</th>
                                <th style={{ textAlign: "center" }}>Km</th>
                                <th style={{ textAlign: "center" }}>Tarifa</th>
                                <th style={{ textAlign: "right" }}>Monto</th>
                                <th style={{ textAlign: "center" }}>Estado</th>
                                {puedeAprobar && <th style={{ textAlign: "center" }}>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {registros.length > 0 ? registros.map((r) => (
                                <tr key={r.idViatico}>
                                    <td>{r.usuario?.nombre} {r.usuario?.apellido}</td>
                                    <td>{r.empresa?.nombre || "-"}</td>
                                    <td style={{ textAlign: "center" }}>{r.kilometros}</td>
                                    <td style={{ textAlign: "center" }}>${r.tarifaPorKmAplicada}</td>
                                    <td style={{ textAlign: "right" }}>${r.montoAPagar.toLocaleString()}</td>
                                    <td style={{ textAlign: "center" }}>{r.estado}</td>
                                    {puedeAprobar && (
                                        <td style={{ textAlign: "center", display: "flex", gap: "6px", justifyContent: "center" }}>
                                            {r.estado !== "APROBADO" && <button className="btn-primario" style={{ padding: "4px 8px" }} onClick={() => handleCambiarEstado(r.idViatico, "APROBADO")}><Check size={13} /></button>}
                                            {r.estado !== "RECHAZADO" && <button className="btn-primario" style={{ padding: "4px 8px", backgroundColor: "#dc2626" }} onClick={() => handleCambiarEstado(r.idViatico, "RECHAZADO")}><X size={13} /></button>}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan={puedeAprobar ? 7 : 6} className="txt-vacio">No hay viáticos registrados para esta fecha.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViaticosComponent;
