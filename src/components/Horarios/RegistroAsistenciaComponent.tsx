import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Clock, Calendar, Timer } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./asistencia.css";
import type { RegistroAsistencia } from "../../interfaces/RegistroAsistencia";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Intenta obtener la geolocalización del navegador sin bloquear el fichaje si el usuario la rechaza
const obtenerCoordenadas = (): Promise<{ latitud: number | null; longitud: number | null }> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ latitud: null, longitud: null });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
            () => resolve({ latitud: null, longitud: null }),
            { timeout: 4000 }
        );
    });
};

const formatearHora = (iso: string | null) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const calcularDuracion = (ingreso: string, egreso: string | null) => {
    if (!egreso) return "En curso";
    const ms = new Date(egreso).getTime() - new Date(ingreso).getTime();
    const horas = Math.floor(ms / 3600000);
    const minutos = Math.floor((ms % 3600000) / 60000);
    return `${horas}h ${minutos}m`;
};

const RegistroAsistenciaComponent: React.FC = () => {
    const [horaActual, setHoraActual] = useState(new Date());
    const [registroAbierto, setRegistroAbierto] = useState<RegistroAsistencia | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split("T")[0]);
    const [registrosDia, setRegistrosDia] = useState<RegistroAsistencia[]>([]);

    const email = localStorage.getItem("email") || "";

    useEffect(() => {
        const intervalo = setInterval(() => setHoraActual(new Date()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    const consultarEstado = async () => {
        if (!email) return;
        try {
            const res = await api.get(`/asistencia/estado?email=${encodeURIComponent(email)}`, obtenerHeaders());
            setRegistroAbierto(res.data || null);
        } catch (err) {
            console.error("Error al consultar el estado de asistencia", err);
        }
    };

    const buscarRegistrosDia = async (fecha: string) => {
        try {
            const res = await api.get(`/asistencia/calendario?fecha=${fecha}`, obtenerHeaders());
            setRegistrosDia(res.data);
        } catch (err) {
            // Si el usuario no tiene permiso de VER_ASISTENCIA el backend devuelve 403; no es un error de UI.
            setRegistrosDia([]);
        }
    };

    useEffect(() => {
        consultarEstado();
        if (tienePermiso("VER_ASISTENCIA")) {
            buscarRegistrosDia(fechaFiltro);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarcarIngreso = async () => {
        setCargando(true);
        setError("");
        setMensaje("");
        try {
            const { latitud, longitud } = await obtenerCoordenadas();
            await api.post("/asistencia/ingreso", { emailUsuario: email, latitud, longitud }, obtenerHeaders());
            setMensaje("Ingreso registrado con éxito.");
            await consultarEstado();
            if (tienePermiso("VER_ASISTENCIA")) buscarRegistrosDia(fechaFiltro);
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar el ingreso.");
        } finally {
            setCargando(false);
        }
    };

    const handleMarcarEgreso = async () => {
        setCargando(true);
        setError("");
        setMensaje("");
        try {
            const { latitud, longitud } = await obtenerCoordenadas();
            await api.post("/asistencia/egreso", { emailUsuario: email, latitud, longitud }, obtenerHeaders());
            setMensaje("Egreso registrado con éxito.");
            await consultarEstado();
            if (tienePermiso("VER_ASISTENCIA")) buscarRegistrosDia(fechaFiltro);
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar el egreso.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="asistencia-container">
            <div className="asistencia-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Timer size={24} color="#059669" /> INGRESO Y EGRESO
                </h1>

                <div className="asistencia-reloj">
                    <div className="hora">{horaActual.toLocaleTimeString()}</div>
                    <div className="fecha">{horaActual.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                </div>

                <div className="asistencia-estado">
                    {registroAbierto ? (
                        <span className="asistencia-badge trabajando">
                            <Clock size={16} /> En turno desde las {formatearHora(registroAbierto.horaIngreso)}
                        </span>
                    ) : (
                        <span className="asistencia-badge libre">Sin ingreso registrado</span>
                    )}
                </div>

                <div className="asistencia-botones">
                    <button
                        type="button"
                        className="btn-fichaje ingreso"
                        onClick={handleMarcarIngreso}
                        disabled={cargando || !!registroAbierto}
                    >
                        <LogIn size={20} /> MARCAR INGRESO
                    </button>
                    <button
                        type="button"
                        className="btn-fichaje egreso"
                        onClick={handleMarcarEgreso}
                        disabled={cargando || !registroAbierto}
                    >
                        <LogOut size={20} /> MARCAR EGRESO
                    </button>
                </div>

                {error && <p className="msg-error">{error}</p>}
                {mensaje && <p className="msg-exito">{mensaje}</p>}
            </div>

            {tienePermiso("VER_ASISTENCIA") && (
                <div className="asistencia-card">
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                        <Calendar size={24} color="#059669" /> CALENDARIO DE FICHAJES
                    </h1>

                    <div className="filtros-bar">
                        <span className="filtro-label">Ver fichajes del día:</span>
                        <input
                            type="date"
                            className="input-filtro-fecha"
                            value={fechaFiltro}
                            onChange={(e) => setFechaFiltro(e.target.value)}
                        />
                        <button type="button" className="btn-filtrar" onClick={() => buscarRegistrosDia(fechaFiltro)}>
                            Buscar
                        </button>
                    </div>

                    <div className="tabla-simetrica-wrapper">
                        <table className="tabla-horarios">
                            <thead>
                                <tr>
                                    <th style={{ width: "25%" }}>Empleado</th>
                                    <th style={{ width: "15%", textAlign: "center" }}>Ingreso</th>
                                    <th style={{ width: "15%", textAlign: "center" }}>Egreso</th>
                                    <th style={{ width: "15%", textAlign: "center" }}>Duración</th>
                                    <th style={{ width: "15%", textAlign: "center" }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosDia.length > 0 ? (
                                    registrosDia.map((reg) => (
                                        <tr key={reg.idAsistencia}>
                                            <td className="txt-bold">{reg.usuario?.nombre} {reg.usuario?.apellido}</td>
                                            <td style={{ textAlign: "center" }}>{formatearHora(reg.horaIngreso)}</td>
                                            <td style={{ textAlign: "center" }}>{formatearHora(reg.horaEgreso)}</td>
                                            <td style={{ textAlign: "center" }}>{calcularDuracion(reg.horaIngreso, reg.horaEgreso)}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className={`badge-estado-asistencia ${reg.horaEgreso ? "cerrado" : "abierto"}`}>
                                                    {reg.horaEgreso ? "Completo" : "En curso"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="txt-vacio">No hay fichajes registrados para esta fecha.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistroAsistenciaComponent;
