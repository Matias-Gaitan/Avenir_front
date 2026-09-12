import React, { useState, useEffect, useCallback } from "react";
import { LogIn, LogOut, Clock, Calendar, Timer, Building2, WifiOff, RefreshCw, CloudOff } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./asistencia.css";
import type { RegistroAsistencia } from "../../interfaces/RegistroAsistencia";
import type { Empresa } from "../../interfaces/Empresa";
import { encolarFichaje, obtenerPendientes, quitarPendiente, esErrorDeRed, formatearFechaLocalISO } from "../../service/offlineQueue";

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

// US: cuanto tardo en subirse un fichaje hecho sin señal, para que quede trazable
// que la hora registrada es la real del dispositivo y no la de la sincronización.
const calcularDemoraSync = (horaReal: string, fechaSync: string | null | undefined) => {
    if (!fechaSync) return null;
    const ms = new Date(fechaSync).getTime() - new Date(horaReal).getTime();
    if (ms < 60000) return "menos de 1 min";
    const minutos = Math.round(ms / 60000);
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `${horas}h ${minutos % 60}m`;
};

const RegistroAsistenciaComponent: React.FC = () => {
    const [horaActual, setHoraActual] = useState(new Date());
    const [registroAbierto, setRegistroAbierto] = useState<RegistroAsistencia | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [idEmpresaVisita, setIdEmpresaVisita] = useState<number | "">("");

    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split("T")[0]);
    const [registrosDia, setRegistrosDia] = useState<RegistroAsistencia[]>([]);

    const email = localStorage.getItem("email") || "";

    const [enLinea, setEnLinea] = useState(navigator.onLine);
    const [pendientes, setPendientes] = useState(() => obtenerPendientes().length);
    const [sincronizando, setSincronizando] = useState(false);

    useEffect(() => {
        const intervalo = setInterval(() => setHoraActual(new Date()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    // US: si el dispositivo se queda sin señal, el fichaje se guarda localmente en vez
    // de perderse; apenas vuelve la conexión se sincroniza solo con el servidor.
    const sincronizarPendientes = useCallback(async () => {
        const cola = obtenerPendientes();
        if (cola.length === 0) return;
        setSincronizando(true);
        for (const item of cola) {
            try {
                const endpoint = item.tipo === "ingreso" ? "/asistencia/ingreso" : "/asistencia/egreso";
                await api.post(endpoint, item.payload, obtenerHeaders());
                quitarPendiente(item.id);
            } catch (err) {
                // Si todavía no hay señal (o el servidor no responde), dejamos el resto en
                // la cola para el próximo intento y no seguimos golpeando el servidor.
                break;
            }
        }
        setPendientes(obtenerPendientes().length);
        setSincronizando(false);
        await consultarEstado();
        if (tienePermiso("VER_ASISTENCIA")) buscarRegistrosDia(fechaFiltro);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const alConectar = () => { setEnLinea(true); sincronizarPendientes(); };
        const alDesconectar = () => setEnLinea(false);
        window.addEventListener("online", alConectar);
        window.addEventListener("offline", alDesconectar);
        if (navigator.onLine) sincronizarPendientes();
        return () => {
            window.removeEventListener("online", alConectar);
            window.removeEventListener("offline", alDesconectar);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarEmpresas = async () => {
        try {
            const res = await api.get("/empresas", obtenerHeaders());
            setEmpresas(Array.isArray(res.data) ? res.data.filter((e: Empresa) => e.activo) : []);
        } catch (err) {
            console.error("Error al cargar empresas", err);
        }
    };

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
        cargarEmpresas();
        if (tienePermiso("VER_ASISTENCIA")) {
            buscarRegistrosDia(fechaFiltro);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMarcarIngreso = async () => {
        setCargando(true);
        setError("");
        setMensaje("");
        const { latitud, longitud } = await obtenerCoordenadas();
        const loginLatitud = localStorage.getItem("loginLat");
        const loginLongitud = localStorage.getItem("loginLng");
        const payload = {
            emailUsuario: email,
            latitud,
            longitud,
            idEmpresa: idEmpresaVisita || null,
            loginLatitud,
            loginLongitud
        };

        try {
            await api.post("/asistencia/ingreso", payload, obtenerHeaders());
            setMensaje(
                idEmpresaVisita
                    ? "Ingreso registrado con éxito. Se generó automáticamente el viático estimado para su aprobación."
                    : "Ingreso registrado con éxito."
            );
            await consultarEstado();
            if (tienePermiso("VER_ASISTENCIA")) buscarRegistrosDia(fechaFiltro);
        } catch (err: any) {
            if (esErrorDeRed(err)) {
                // La hora real del fichaje es AHORA (el momento del click), no la hora en la
                // que esto termine sincronizando; se la mandamos al backend para que no
                // registre la hora de sincronización como si fuera la hora del fichaje.
                encolarFichaje("ingreso", { ...payload, horaRealDispositivo: formatearFechaLocalISO(new Date()) });
                setPendientes(obtenerPendientes().length);
                setEnLinea(false);
                setRegistroAbierto({
                    idAsistencia: -1,
                    fecha: new Date().toISOString().split("T")[0],
                    horaIngreso: new Date().toISOString(),
                    horaEgreso: null,
                    latitudIngreso: latitud, longitudIngreso: longitud,
                    latitudEgreso: null, longitudEgreso: null,
                    observaciones: undefined,
                    usuario: { idUsuario: 0, nombre: "", apellido: "", email },
                    empresa: idEmpresaVisita ? (empresas.find((e) => e.idEmpresa === idEmpresaVisita) as any) : null
                } as RegistroAsistencia);
                setMensaje("Sin conexión: tu ingreso se guardó en el dispositivo y se va a sincronizar solo apenas vuelva la señal.");
            } else {
                setError(err.response?.data || "Error al registrar el ingreso.");
            }
        } finally {
            setCargando(false);
        }
    };

    const handleMarcarEgreso = async () => {
        setCargando(true);
        setError("");
        setMensaje("");
        const { latitud, longitud } = await obtenerCoordenadas();
        const payload = { emailUsuario: email, latitud, longitud };

        try {
            await api.post("/asistencia/egreso", payload, obtenerHeaders());
            setMensaje("Egreso registrado con éxito.");
            setIdEmpresaVisita("");
            await consultarEstado();
            if (tienePermiso("VER_ASISTENCIA")) buscarRegistrosDia(fechaFiltro);
        } catch (err: any) {
            if (esErrorDeRed(err)) {
                encolarFichaje("egreso", { ...payload, horaRealDispositivo: formatearFechaLocalISO(new Date()) });
                setPendientes(obtenerPendientes().length);
                setEnLinea(false);
                setIdEmpresaVisita("");
                setRegistroAbierto(null);
                setMensaje("Sin conexión: tu egreso se guardó en el dispositivo y se va a sincronizar solo apenas vuelva la señal.");
            } else {
                setError(err.response?.data || "Error al registrar el egreso.");
            }
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

                {(!enLinea || pendientes > 0) && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: enLinea ? "#FEF3C7" : "#FEE2E2", color: enLinea ? "#92400E" : "#991B1B", padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, marginBottom: "12px" }}>
                        {enLinea ? <RefreshCw size={14} className={sincronizando ? "icon-spin-hover" : ""} /> : <WifiOff size={14} />}
                        {!enLinea && "Sin conexión — tus fichajes se guardan en este dispositivo"}
                        {enLinea && pendientes > 0 && `Sincronizando ${pendientes} fichaje${pendientes > 1 ? "s" : ""} pendiente${pendientes > 1 ? "s" : ""}...`}
                    </div>
                )}

                <div className="asistencia-reloj">
                    <div className="hora">{horaActual.toLocaleTimeString()}</div>
                    <div className="fecha">{horaActual.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                </div>

                <div className="asistencia-estado">
                    {registroAbierto ? (
                        <span className="asistencia-badge trabajando">
                            <Clock size={16} /> En turno desde las {formatearHora(registroAbierto.horaIngreso)}
                            {registroAbierto.empresa && <> — <Building2 size={14} style={{ verticalAlign: "middle" }} /> {registroAbierto.empresa.nombre}</>}
                        </span>
                    ) : (
                        <span className="asistencia-badge libre">Sin ingreso registrado</span>
                    )}
                </div>

                {!registroAbierto && (
                    <div style={{ maxWidth: "360px", margin: "0 auto 16px auto" }}>
                        <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                            Empresa a visitar (opcional)
                        </label>
                        <select
                            className="input-filtro-fecha"
                            style={{ width: "100%" }}
                            value={idEmpresaVisita}
                            onChange={(e) => setIdEmpresaVisita(e.target.value ? Number(e.target.value) : "")}
                        >
                            <option value="">Sin visita a empresa (ingreso a oficina)</option>
                            {empresas.map((emp) => (
                                <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

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
                                    <th style={{ width: "20%" }}>Empleado</th>
                                    <th style={{ width: "16%" }}>Empresa Visitada</th>
                                    <th style={{ width: "12%", textAlign: "center" }}>Ingreso</th>
                                    <th style={{ width: "12%", textAlign: "center" }}>Egreso</th>
                                    <th style={{ width: "11%", textAlign: "center" }}>Duración</th>
                                    <th style={{ width: "11%", textAlign: "center" }}>Estado</th>
                                    <th style={{ width: "18%", textAlign: "center" }}>Origen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrosDia.length > 0 ? (
                                    registrosDia.map((reg) => (
                                        <tr key={reg.idAsistencia}>
                                            <td className="txt-bold">{reg.usuario?.nombre} {reg.usuario?.apellido}</td>
                                            <td>{reg.empresa?.nombre || "-"}</td>
                                            <td style={{ textAlign: "center" }}>{formatearHora(reg.horaIngreso)}</td>
                                            <td style={{ textAlign: "center" }}>{formatearHora(reg.horaEgreso)}</td>
                                            <td style={{ textAlign: "center" }}>{calcularDuracion(reg.horaIngreso, reg.horaEgreso)}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className={`badge-estado-asistencia ${reg.horaEgreso ? "cerrado" : "abierto"}`}>
                                                    {reg.horaEgreso ? "Completo" : "En curso"}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                {reg.generadoOffline ? (
                                                    <span title={`Se sincronizó ${calcularDemoraSync(reg.horaIngreso, reg.fechaSincronizacion) || ""} después de pasar en el dispositivo`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#B45309", fontWeight: 700 }}>
                                                        <CloudOff size={12} /> Offline{calcularDemoraSync(reg.horaIngreso, reg.fechaSincronizacion) && ` (+${calcularDemoraSync(reg.horaIngreso, reg.fechaSincronizacion)})`}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>En línea</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="txt-vacio">No hay fichajes registrados para esta fecha.</td>
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
