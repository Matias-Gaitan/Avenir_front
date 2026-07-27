import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./empresa.css";

interface Empresa {
    idEmpresa?: number;
    cuit: string;
    nombre: string;
    direccion: string;
    activo?: boolean; // Única propiedad de estado
}

const EmpresaComponent: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

    // Estados del Formulario CRUD
    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [idEditar, setIdEditar] = useState<number | null>(null);
    const [cuit, setCuit] = useState("");
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [estadoEdicion, setEstadoEdicion] = useState<boolean>(true);

    // Simplificado ya que no existe más "estado" en la interfaz
    const obtenerEstadoBoolean = (emp: Empresa): boolean => {
        return emp.activo ?? true;
    };

    const cargarEmpresas = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/empresas", { headers });
            setEmpresas(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar empresas:", err);
        }
    };

    useEffect(() => {
        cargarEmpresas();
    }, []);

    const limpiarFormulario = () => {
        setCuit("");
        setNombre("");
        setDireccion("");
        setEstadoEdicion(true);
        setModoEdicion(false);
        setIdEditar(null);
    };

    // CREATE & UPDATE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Payload limpio solo con 'activo'
            const payload = {
                cuit,
                nombre,
                direccion,
                activo: modoEdicion ? estadoEdicion : true
            };

            if (modoEdicion && idEditar) {
                // UPDATE
                await api.put(`/empresas/${idEditar}`, payload, { headers });
            } else {
                // CREATE
                await api.post("/empresas", payload, { headers });
            }

            limpiarFormulario();
            cargarEmpresas();
        } catch (err: any) {
            console.error("Error al guardar empresa:", err);
            alert(err.response?.data || "Error al procesar la empresa.");
        }
    };

    // Cargar datos al formulario para editar
    const handleEditarClick = (emp: Empresa) => {
        setModoEdicion(true);
        setIdEditar(emp.idEmpresa || null);
        setCuit(emp.cuit);
        setNombre(emp.nombre);
        setDireccion(emp.direccion);
        setEstadoEdicion(obtenerEstadoBoolean(emp));
    };

    // Cambiar estado directo desde la tabla
    const handleCambiarEstado = async (emp: Empresa, estadoActual: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            if (estadoActual) {
                // Si está activa -> Dar de baja
                await api.patch(`/empresas/${emp.idEmpresa}/baja`, {}, { headers });
            } else {
                // Si está inactiva -> Dar de alta (Usando tu NUEVO endpoint PATCH)
                await api.patch(`/empresas/${emp.idEmpresa}/alta`, {}, { headers });
            }

            cargarEmpresas();
        } catch (err: any) {
            console.error("Error al cambiar estado:", err);
            alert(err.response?.data || "No se pudo cambiar el estado de la empresa.");
        }
    };

    const empresasFiltradas = empresas.filter((emp) => {
        const estaActiva = obtenerEstadoBoolean(emp);
        if (filtroEstado === "ACTIVOS") return estaActiva === true;
        if (filtroEstado === "INACTIVOS") return estaActiva === false;
        return true;
    });

    return (
        <div className="empresa-card">
            <h2>{modoEdicion ? "EDITAR EMPRESA" : "GESTIÓN DE EMPRESAS"}</h2>

            {/* FORMULARIO CRUD */}
            <form onSubmit={handleSubmit} className="form-empresa">
                <div className="form-group">
                    <label>CUIT</label>
                    <input type="text" value={cuit} onChange={(e) => setCuit(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Razón Social / Nombre</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Dirección</label>
                    <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                </div>

                {/* CAMPO DE ESTADO SOLO EN MODO EDICIÓN */}
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
                    <button type="submit" className="btn-registrar" style={{ flex: 1 }}>
                        {modoEdicion ? "ACTUALIZAR EMPRESA" : "REGISTRAR EMPRESA"}
                    </button>
                    {modoEdicion && (
                        <button
                            type="button"
                            onClick={limpiarFormulario}
                            style={{
                                backgroundColor: "#94a3b8",
                                color: "white",
                                padding: "10px",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            CANCELAR
                        </button>
                    )}
                </div>
            </form>

            <hr className="divider" style={{ border: "0", height: "1px", background: "#e2e8f0", margin: "20px 0" }} />

            {/* LISTADO + FILTRO */}
            <div className="listado-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ margin: 0, color: "#064e3b" }}>LISTADO DE EMPRESAS</h3>
                <div className="filtro-container">
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="select-filtro"
                        style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none" }}
                    >
                        <option value="TODOS">Todas las empresas</option>
                        <option value="ACTIVOS">Solo Activas</option>
                        <option value="INACTIVOS">Solo Inactivas</option>
                    </select>
                </div>
            </div>

            {/* TABLA RESPONSIVA */}
            <div className="table-responsive">
                <table className="gestor-table">
                    <thead>
                        <tr>
                            <th>CUIT</th>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {empresasFiltradas.map((emp) => {
                            const esActivo = obtenerEstadoBoolean(emp);
                            return (
                                <tr key={emp.idEmpresa}>
                                    <td>{emp.cuit}</td>
                                    <td>{emp.nombre}</td>
                                    <td>{emp.direccion}</td>
                                    <td>
                                        <span className={`badge ${esActivo ? "badge-activo" : "badge-inactivo"}`}>
                                            {esActivo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones-group" style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                onClick={() => handleEditarClick(emp)}
                                                className="btn-editar"
                                                style={{ backgroundColor: "#22c55e", color: "white", border: "none", padding: "6px 10px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold" }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleCambiarEstado(emp, esActivo)}
                                                className={`btn-accion ${esActivo ? "btn-baja" : "btn-alta"}`}
                                                style={{ padding: "6px 10px", borderRadius: "4px", border: "none", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold", color: "white", backgroundColor: esActivo ? "#94a3b8" : "#16a34a" }}
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

export default EmpresaComponent;