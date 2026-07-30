import React, { useState, useEffect } from "react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./horarios.css";
import type { Empresa } from "../../interfaces/Empresa";
import type { RegistroHora } from "../../interfaces/RegistroHora";

interface RegistroHoraConEstado extends RegistroHora {
    id?: number;
    idRegistro?: number;
    estado?: "PENDIENTE" | "APROBADO" | "RECHAZADO" | string;
}

const RegistroHorarioComponent: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [horasDedicadas, setHorasDedicadas] = useState<number | "">("");
    const [tareasRealizadas, setTareasRealizadas] = useState("");

    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [registros, setRegistros] = useState<RegistroHoraConEstado[]>([]);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const obtenerHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await api.get("/empresas", obtenerHeaders());
                setEmpresas(response.data.filter((e: Empresa) => e.activo));
            } catch (err) {
                console.error("Error al cargar empresas", err);
            }
        };
        fetchEmpresas();
        buscarRegistros(fechaFiltro);
    }, []);

    const buscarRegistros = async (fecha: string) => {
        try {
            const response = await api.get(`/horas/calendario?fecha=${fecha}`, obtenerHeaders());
            setRegistros(response.data);
            setError("");
        } catch (err: any) {
            setError("Error al obtener los registros del día.");
        }
    };

    const handleFiltrar = () => {
        buscarRegistros(fechaFiltro);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        const emailUsuario = localStorage.getItem("email");

        if (!emailUsuario) {
            setError("Error de sesión: vuelva a iniciar sesión.");
            return;
        }

        const payload = {
            idEmpresa: Number(idEmpresa),
            emailUsuario: emailUsuario,
            fecha: fechaRegistro,
            horasDedicadas: Number(horasDedicadas),
            tareasRealizadas: tareasRealizadas,
            estado: "PENDIENTE"
        };

        try {
            await api.post("/horas/registrar", payload, obtenerHeaders());
            setMensaje("Horas registradas con éxito. Quedan pendientes de aprobación.");
            setHorasDedicadas("");
            setTareasRealizadas("");

            if (fechaRegistro === fechaFiltro) {
                buscarRegistros(fechaFiltro);
            }
        } catch (err: any) {
            setError("Error al guardar: " + (err.response?.data || "Verifique los datos"));
        }
    };

    // 🌟 MANEJADOR CON AUTENTICACIÓN JWT Y MULTI-ENDPOINT FALLBACK
    const handleCambiarEstadoHoras = async (reg: RegistroHoraConEstado, nuevoEstado: "APROBADO" | "RECHAZADO") => {
        const idSeguro = reg.idRegistro || reg.id;
        if (!idSeguro) {
            alert("No se encontró el ID del registro.");
            return;
        }

        const config = obtenerHeaders();

        // 🚀 1. Actualización optimista inmediata en la UI para respuesta visual rápida
        setRegistros((prev) =>
            prev.map((r) =>
                (r.idRegistro === idSeguro || r.id === idSeguro) ? { ...r, estado: nuevoEstado } : r
            )
        );

        try {
            // Variante 1: PUT /horas/{id}/estado con body JSON
            await api.put(`/horas/${idSeguro}/estado`, { estado: nuevoEstado }, config);
            buscarRegistros(fechaFiltro);
            return;
        } catch (e1) {
            try {
                // Variante 2: PATCH /horas/{id}/estado?estado=APROBADO
                await api.patch(`/horas/${idSeguro}/estado?estado=${nuevoEstado}`, {}, config);
                buscarRegistros(fechaFiltro);
                return;
            } catch (e2) {
                try {
                    // Variante 3: PUT /horas/{id} (Objeto de entidad completo)
                    const payloadActualizar = {
                        ...reg,
                        estado: nuevoEstado
                    };
                    await api.put(`/horas/${idSeguro}`, payloadActualizar, config);
                    buscarRegistros(fechaFiltro);
                    return;
                } catch (errFinal: any) {
                    console.error("Error al actualizar horas en el backend:", errFinal?.response || errFinal);
                    const detalle = errFinal?.response?.data?.mensaje || errFinal?.response?.data || `Error HTTP ${errFinal?.response?.status || ''}`;

                    // Revertimos cambios visuales si rebota en el servidor
                    buscarRegistros(fechaFiltro);
                    alert(`No se pudo cambiar el estado: ${detalle}`);
                }
            }
        }
    };

    return (
        <div className="horario-container">
            {/* 1. Formulario de Carga */}
            <div className="horario-card">
                <div className="horario-tittle">
                    <h1>REGISTRAR HORAS DE TRABAJO</h1>
                </div>

                <form className="horario-form" onSubmit={handleSubmit}>
                    <div className="form-grid-3">
                        <div className="form-section">
                            <label htmlFor="idEmpresa">Empresa Auditada</label>
                            <select
                                className="form-input"
                                id="idEmpresa"
                                value={idEmpresa}
                                onChange={(e) => setIdEmpresa(e.target.value as unknown as number)}
                                required
                            >
                                <option value="" disabled>Seleccione una empresa</option>
                                {empresas.map(emp => (
                                    <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-section">
                            <label htmlFor="fechaRegistro">Fecha</label>
                            <input
                                type="date"
                                className="form-input"
                                id="fechaRegistro"
                                value={fechaRegistro}
                                onChange={(e) => setFechaRegistro(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-section">
                            <label htmlFor="horas">Cantidad de Horas</label>
                            <input
                                type="number"
                                step="0.5"
                                className="form-input"
                                id="horas"
                                placeholder="Ej: 4.5"
                                value={horasDedicadas}
                                onChange={(e) => setHorasDedicadas(e.target.value as unknown as number)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section" style={{ marginTop: "15px" }}>
                        <label htmlFor="tareas">Tareas Realizadas</label>
                        <textarea
                            className="form-input"
                            id="tareas"
                            rows={3}
                            placeholder="Describa brevemente el trabajo realizado..."
                            value={tareasRealizadas}
                            onChange={(e) => setTareasRealizadas(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="form-button">GUARDAR REGISTRO</button>

                    {error && <p className="msg-error">{error}</p>}
                    {mensaje && <p className="msg-exito">{mensaje}</p>}
                </form>
            </div>

            {/* 2. Calendario / Tabla Simétrica con Acciones */}
            <div className="horario-card">
                <div className="horario-tittle">
                    <h1>CALENDARIO DIARIO DE HORAS</h1>
                </div>

                <div className="filtros-bar">
                    <span className="filtro-label">Ver registros del día:</span>
                    <input
                        type="date"
                        className="input-filtro-fecha"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                    />
                    <button type="button" className="btn-filtrar" onClick={handleFiltrar}>
                        Buscar
                    </button>
                </div>

                <div className="tabla-simetrica-wrapper">
                    <table className="tabla-horarios">
                        <thead>
                            <tr>
                                <th style={{ width: "20%" }}>Técnico</th>
                                <th style={{ width: "20%" }}>Empresa</th>
                                <th style={{ width: "10%", textAlign: "center" }}>Horas</th>
                                <th style={{ width: "25%" }}>Tareas</th>
                                <th style={{ width: "12%", textAlign: "center" }}>Estado</th>
                                <th style={{ width: "13%", textAlign: "center" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registros.length > 0 ? (
                                registros.map((reg, index) => {
                                    const estadoActual = (reg.estado || "PENDIENTE").toUpperCase();
                                    const idKey = reg.idRegistro || reg.id || index;

                                    return (
                                        <tr key={idKey}>
                                            <td className="txt-bold">{reg.usuario?.nombre} {reg.usuario?.apellido}</td>
                                            <td>{reg.empresa?.nombre}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className="badge-horas">{reg.horasDedicadas} hs</span>
                                            </td>
                                            <td>{reg.tareasRealizadas}</td>

                                            {/* BADGES DE ESTADO */}
                                            <td style={{ textAlign: "center" }}>
                                                {estadoActual === "PENDIENTE" && (
                                                    <span className="badge-estado badge-pendiente">⏳ Pendiente</span>
                                                )}
                                                {estadoActual === "APROBADO" && (
                                                    <span className="badge-estado badge-aprobado">✅ Aprobado</span>
                                                )}
                                                {estadoActual === "RECHAZADO" && (
                                                    <span className="badge-estado badge-rechazado">❌ Rechazado</span>
                                                )}
                                            </td>

                                            {/* 🌟 ACCIONES: BOTONES VISIBLES SOLO CON PERMISO "APROBAR_HORARIOS" */}
                                            <td style={{ textAlign: "center" }}>
                                                {tienePermiso("APROBAR_HORARIOS") ? (
                                                    <div className="acciones-group" style={{ justifyContent: "center" }}>
                                                        {estadoActual !== "APROBADO" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCambiarEstadoHoras(reg, "APROBADO")}
                                                                className="btn-aprobar-hora"
                                                                title="Aprobar Horas"
                                                            >
                                                                Aprobar
                                                            </button>
                                                        )}
                                                        {estadoActual !== "RECHAZADO" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCambiarEstadoHoras(reg, "RECHAZADO")}
                                                                className="btn-rechazar-hora"
                                                                title="Rechazar Horas"
                                                            >
                                                                Rechazar
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: "0.8rem", color: "#94A3B8", fontStyle: "italic" }}>
                                                        Sin permisos de aprobación
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="txt-vacio">
                                        No hay registros de carga para esta fecha.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RegistroHorarioComponent;