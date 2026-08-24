import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit2, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import { AddressAutocomplete, type UbicacionSeleccionada } from "../common/AddressAutocomplete";
import "./empresa.css";

interface Empresa {
    idEmpresa?: number;
    id?: number;
    cuit: string;
    nombre: string;
    direccion: string;
    pais?: string;
    provincia?: string;
    ciudad?: string;
    barrio?: string;
    calle?: string;
    numero?: string;
    latitud?: number;
    longitud?: number;
    activo?: boolean;
}

const EmpresaComponent: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [cuit, setCuit] = useState("");
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [geoData, setGeoData] = useState<Partial<UbicacionSeleccionada>>({});
    const [estadoEdicion, setEstadoEdicion] = useState<boolean>(true);

    const obtenerEstadoBoolean = (emp: Empresa): boolean => emp.activo ?? true;

    const cargarEmpresas = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/empresas", { headers });
            const data = Array.isArray(res.data) ? res.data : [];
            data.sort((a, b) => (a.idEmpresa ?? a.id ?? 0) - (b.idEmpresa ?? b.id ?? 0));
            setEmpresas(data);
        } catch (err) {
            console.error("Error al cargar empresas:", err);
        }
    };

    useEffect(() => { cargarEmpresas(); }, []);

    const limpiarFormulario = () => {
        setCuit("");
        setNombre("");
        setDireccion("");
        setGeoData({});
        setEstadoEdicion(true);
        setModoEdicion(false);
        setIdEditar(null);
    };

    const handleSelectAddress = (data: UbicacionSeleccionada) => {
        setDireccion(data.direccionCompleta);
        setGeoData(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                cuit,
                nombre,
                direccion,
                ...geoData,
                activo: modoEdicion ? estadoEdicion : true
            };

            if (modoEdicion && idEditar) {
                await api.put(`/empresas/${idEditar}`, payload, { headers });
            } else {
                await api.post("/empresas", payload, { headers });
            }

            limpiarFormulario();
            cargarEmpresas();
        } catch (err: any) {
            console.error("Error al guardar empresa:", err);
            alert(err.response?.data || "Error al procesar la empresa.");
        }
    };

    const handleEditarClick = (emp: Empresa) => {
        setModoEdicion(true);
        setIdEditar(emp.idEmpresa || emp.id || null);
        setCuit(emp.cuit);
        setNombre(emp.nombre);
        setDireccion(emp.direccion);
        setGeoData({
            pais: emp.pais,
            provincia: emp.provincia,
            ciudad: emp.ciudad,
            barrio: emp.barrio,
            calle: emp.calle,
            numero: emp.numero,
            latitud: emp.latitud,
            longitud: emp.longitud
        });
        setEstadoEdicion(obtenerEstadoBoolean(emp));
    };

    const handleCambiarEstado = async (emp: Empresa, estadoActual: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const idSeguro = emp.idEmpresa || emp.id;

            if (estadoActual) {
                await api.patch(`/empresas/${idSeguro}/baja`, {}, { headers });
            } else {
                await api.patch(`/empresas/${idSeguro}/alta`, {}, { headers });
            }
            cargarEmpresas();
        } catch (err: any) {
            console.error("Error al cambiar estado:", err);
            alert(err.response?.data || "No se pudo cambiar el estado de la empresa.");
        }
    };

    const empresasFiltradas = empresas.filter((emp) => {
        const estaActiva = obtenerEstadoBoolean(emp);
        if (filtroEstado === "ACTIVOS") return estaActiva;
        if (filtroEstado === "INACTIVOS") return !estaActiva;
        return true;
    });

    return (
        <div className="empresa-card">
            {((!modoEdicion && tienePermiso("CREAR_EMPRESAS")) || (modoEdicion && tienePermiso("EDITAR_EMPRESAS"))) && (
                <form onSubmit={handleSubmit} className="form-empresa">
                    <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Building2 size={20} className="icon-pulse" color="#059669" />
                        {modoEdicion ? "EDITAR EMPRESA" : "GESTIÓN DE EMPRESAS"}
                    </h2>
                    <div className="form-group">
                        <label>CUIT</label>
                        <input type="text" value={cuit} onChange={(e) => setCuit(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Razón Social / Nombre</label>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label>Buscar Dirección (Autocompletado)</label>
                        <AddressAutocomplete value={direccion} onSelectAddress={handleSelectAddress} />
                    </div>

                    {modoEdicion && (
                        <div className="form-group">
                            <label>Estado de la Empresa</label>
                            <select
                                value={estadoEdicion ? "true" : "false"}
                                onChange={(e) => setEstadoEdicion(e.target.value === "true")}
                                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                            >
                                <option value="true">Activa</option>
                                <option value="false">Inactiva</option>
                            </select>
                        </div>
                    )}

                    <div className="btn-group-form" style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button type="submit" className="btn-registrar btn-interactive" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            {modoEdicion ? <Edit2 size={16} /> : <Plus size={16} />}
                            {modoEdicion ? "ACTUALIZAR EMPRESA" : "REGISTRAR EMPRESA"}
                        </button>
                        {modoEdicion && (
                            <button type="button" onClick={limpiarFormulario} style={{ backgroundColor: "#94a3b8", color: "white", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
                                CANCELAR
                            </button>
                        )}
                    </div>
                </form>
            )}

            <hr className="divider" style={{ border: "0", height: "1px", background: "#e2e8f0", margin: "20px 0" }} />

            {tienePermiso("VER_EMPRESAS") ? (
                <>
                    <div className="listado-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                        <h3 style={{ margin: 0, color: "#064e3b", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Building2 size={18} /> LISTADO DE EMPRESAS
                        </h3>
                        <div className="filtro-container">
                            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="select-filtro" style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}>
                                <option value="TODOS">Todas las empresas</option>
                                <option value="ACTIVOS">Solo Activas</option>
                                <option value="INACTIVOS">Solo Inactivas</option>
                            </select>
                        </div>
                    </div>

                    <div className="tabla-simetrica-wrapper" style={{ width: "100%", marginTop: "15px", border: "1px solid #E2E8F0", borderRadius: "8px", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#F1F5F9", color: "#0F172A", fontSize: "0.85rem", borderBottom: "1px solid #CBD5E1" }}>
                                    <th style={{ width: "20%", padding: "12px 16px", textAlign: "left" }}>CUIT</th>
                                    <th style={{ width: "25%", padding: "12px 16px", textAlign: "left" }}>Nombre / Razón Social</th>
                                    <th style={{ width: "30%", padding: "12px 16px", textAlign: "left" }}>Dirección</th>
                                    <th style={{ width: "12%", padding: "12px 16px", textAlign: "center" }}>Estado</th>
                                    <th style={{ width: "13%", padding: "12px 16px", textAlign: "center" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empresasFiltradas.map((emp) => {
                                    const esActivo = obtenerEstadoBoolean(emp);
                                    return (
                                        <tr key={emp.idEmpresa || emp.id} style={{ borderBottom: "1px solid #F1F5F9", fontSize: "0.9rem", color: "#334155" }}>
                                            <td style={{ padding: "12px 16px", fontWeight: "bold", textAlign: "left" }}>{emp.cuit}</td>
                                            <td style={{ padding: "12px 16px", textAlign: "left" }}>{emp.nombre}</td>
                                            <td style={{ padding: "12px 16px", textAlign: "left" }}>{emp.direccion}</td>
                                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                <span className={`badge ${esActivo ? "badge-activo" : "badge-inactivo"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                    {esActivo ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {esActivo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                <div className="acciones-group" style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                    {tienePermiso("EDITAR_EMPRESAS") && (
                                                        <button onClick={() => handleEditarClick(emp)} className="btn-editar btn-interactive" style={{ backgroundColor: "#059669", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold" }}>
                                                            Editar
                                                        </button>
                                                    )}
                                                    {tienePermiso("DAR_DE_BAJA_EMPRESAS") && (
                                                        <button onClick={() => handleCambiarEstado(emp, esActivo)} className={`btn-accion ${esActivo ? "btn-baja" : "btn-alta"} btn-interactive`} style={{ padding: "6px 10px", borderRadius: "4px", border: "none", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold", color: "white", backgroundColor: esActivo ? "#64748b" : "#16a34a" }}>
                                                            {esActivo ? "Dar de baja" : "Dar de alta"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <p style={{ color: "#ef4444", textAlign: "center", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <ShieldAlert size={18} /> No tenés permisos para visualizar la lista de empresas.
                </p>
            )}
        </div>
    );
};

export default EmpresaComponent;