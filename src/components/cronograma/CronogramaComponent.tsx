import React, { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, BellRing, Plus } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./cronograma.css";
import type { Evento } from "../../interfaces/Evento";

const TIPOS = [
    { valor: "AUDITORIA", etiqueta: "Auditoría" },
    { valor: "CAPACITACION", etiqueta: "Capacitación" },
    { valor: "REUNION", etiqueta: "Reunión" },
    { valor: "MANTENIMIENTO", etiqueta: "Mantenimiento" },
    { valor: "OTRO", etiqueta: "Otro" }
];

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const aISO = (d: Date) => d.toISOString().split("T")[0];

const construirGrilla = (mes: Date): Date[] => {
    const primerDiaMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
    const diaSemanaInicio = (primerDiaMes.getDay() + 6) % 7; // Lunes = 0
    const inicioGrilla = new Date(primerDiaMes);
    inicioGrilla.setDate(inicioGrilla.getDate() - diaSemanaInicio);

    const dias: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const dia = new Date(inicioGrilla);
        dia.setDate(inicioGrilla.getDate() + i);
        dias.push(dia);
    }
    return dias;
};

const CronogramaComponent: React.FC = () => {
    const [mesActual, setMesActual] = useState(new Date());
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [recordatorios, setRecordatorios] = useState<Evento[]>([]);
    const [diaSeleccionado, setDiaSeleccionado] = useState<string>(aISO(new Date()));

    const puedeCrear = tienePermiso("CREAR_EVENTOS");

    const [titulo, setTitulo] = useState("");
    const [fecha, setFecha] = useState(aISO(new Date()));
    const [hora, setHora] = useState("");
    const [tipo, setTipo] = useState(TIPOS[0].valor);
    const [descripcion, setDescripcion] = useState("");
    const [recordatorio, setRecordatorio] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const diasGrilla = construirGrilla(mesActual);

    const cargarEventosDelMes = async () => {
        try {
            const desde = aISO(diasGrilla[0]);
            const hasta = aISO(diasGrilla[diasGrilla.length - 1]);
            const res = await api.get(`/eventos?desde=${desde}&hasta=${hasta}`, obtenerHeaders());
            setEventos(res.data);
        } catch (err) {
            console.error("Error al cargar eventos", err);
        }
    };

    const cargarRecordatorios = async () => {
        try {
            const res = await api.get("/eventos/recordatorios", obtenerHeaders());
            setRecordatorios(res.data);
        } catch (err) {
            console.error("Error al cargar recordatorios", err);
        }
    };

    useEffect(() => {
        cargarEventosDelMes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesActual]);

    useEffect(() => {
        cargarRecordatorios();
    }, []);

    const eventosDeDia = (diaISO: string) => eventos.filter((e) => e.fecha === diaISO);

    const handleCrearEvento = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");
        try {
            await api.post("/eventos", {
                titulo, fecha, hora: hora || null, tipo, descripcion, recordatorio
            }, obtenerHeaders());

            setMensaje("Evento creado con éxito.");
            setTitulo(""); setHora(""); setDescripcion(""); setRecordatorio(false);
            cargarEventosDelMes();
            cargarRecordatorios();
        } catch (err: any) {
            setError(err.response?.data || "Error al crear el evento.");
        }
    };

    const nombreMes = mesActual.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

    return (
        <div className="cronograma-container">
            <div className="cronograma-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Calendar size={24} color="#059669" /> CRONOGRAMA DE ACTIVIDADES
                </h1>

                <div className="cronograma-layout">
                    <div>
                        <div className="cronograma-nav">
                            <button type="button" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}>
                                <ChevronLeft size={16} />
                            </button>
                            <h2>{nombreMes}</h2>
                            <button type="button" onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="cronograma-grid">
                            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                                <div key={d} className="cronograma-dia-header">{d}</div>
                            ))}

                            {diasGrilla.map((dia) => {
                                const diaISO = aISO(dia);
                                const esDeEsteMes = dia.getMonth() === mesActual.getMonth();
                                const esHoy = diaISO === aISO(new Date());
                                const eventosDia = eventosDeDia(diaISO);

                                return (
                                    <div
                                        key={diaISO}
                                        className={`cronograma-dia ${esDeEsteMes ? "" : "fuera-de-mes"} ${esHoy ? "hoy" : ""} ${diaSeleccionado === diaISO ? "seleccionado" : ""}`}
                                        onClick={() => { setDiaSeleccionado(diaISO); setFecha(diaISO); }}
                                    >
                                        <span className="cronograma-dia-numero">{dia.getDate()}</span>
                                        {eventosDia.slice(0, 3).map((ev) => (
                                            <span key={ev.idEvento} className={`cronograma-evento-punto evento-tipo-${ev.tipo}`}>{ev.titulo}</span>
                                        ))}
                                        {eventosDia.length > 3 && <span style={{ fontSize: "0.65rem", color: "#64748b" }}>+{eventosDia.length - 3} más</span>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cronograma-lista-dia">
                            <strong>Eventos del {diaSeleccionado}</strong>
                            {eventosDeDia(diaSeleccionado).length > 0 ? eventosDeDia(diaSeleccionado).map((ev) => (
                                <div key={ev.idEvento} className="cronograma-evento-item">
                                    <span className={`cronograma-evento-punto evento-tipo-${ev.tipo}`} style={{ marginRight: "8px" }}>{TIPOS.find((t) => t.valor === ev.tipo)?.etiqueta || ev.tipo}</span>
                                    <strong>{ev.titulo}</strong> {ev.hora && `— ${ev.hora}`}
                                    {ev.descripcion && <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>{ev.descripcion}</p>}
                                </div>
                            )) : <p className="txt-vacio">No hay eventos este día.</p>}
                        </div>
                    </div>

                    <div>
                        {puedeCrear && (
                            <form onSubmit={handleCrearEvento} style={{ marginBottom: "20px" }}>
                                <div className="form-section">
                                    <label>Título</label>
                                    <input className="form-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
                                </div>
                                <div className="form-section">
                                    <label>Fecha</label>
                                    <input type="date" className="form-input" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                                </div>
                                <div className="form-section">
                                    <label>Hora (opcional)</label>
                                    <input type="time" className="form-input" value={hora} onChange={(e) => setHora(e.target.value)} />
                                </div>
                                <div className="form-section">
                                    <label>Tipo</label>
                                    <select className="form-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                                        {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
                                    </select>
                                </div>
                                <div className="form-section">
                                    <label>Descripción</label>
                                    <textarea className="form-input" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                                </div>
                                <div className="form-section" style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
                                    <input type="checkbox" checked={recordatorio} onChange={(e) => setRecordatorio(e.target.checked)} />
                                    <label style={{ margin: 0 }}>Marcar como recordatorio</label>
                                </div>
                                <button type="submit" className="btn-primario"><Plus size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />Agregar Evento</button>
                                {error && <p className="msg-error">{error}</p>}
                                {mensaje && <p className="msg-exito">{mensaje}</p>}
                            </form>
                        )}

                        <div>
                            <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#064e3b" }}>
                                <BellRing size={16} /> Próximos Recordatorios
                            </strong>
                            {recordatorios.length > 0 ? recordatorios.map((r) => (
                                <div key={r.idEvento} className="recordatorio-item">
                                    <span className={`cronograma-evento-punto evento-tipo-${r.tipo}`}>{r.fecha}</span>
                                    <span>{r.titulo}</span>
                                </div>
                            )) : <p className="txt-vacio">No hay recordatorios próximos.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CronogramaComponent;
