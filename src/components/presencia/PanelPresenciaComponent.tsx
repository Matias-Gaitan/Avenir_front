import React, { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff, Monitor, Smartphone, AlertTriangle, Users } from "lucide-react";
import api from "../../service/api";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

interface Presencia {
    idUsuario: number;
    usuario: { nombre: string; apellido: string; email: string };
    ultimoHeartbeat: string;
    plataforma?: string;
}

// Un usuario se considera "en línea" si mandó un heartbeat en los últimos 40s
// (el frontend los manda cada 20s, así que 40s tolera perder uno solo por una
// red lenta antes de darlo por desconectado).
const SEGUNDOS_EN_LINEA = 40;

interface Props {
    darkMode?: boolean;
}

const iconoPlataforma = (plataforma?: string) => {
    if (plataforma === "iPhone" || plataforma === "Android") return <Smartphone size={14} />;
    return <Monitor size={14} />;
};

const segundosDesde = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

const formatearTranscurrido = (segundos: number) => {
    if (segundos < 60) return `hace ${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    return `hace ${horas}h`;
};

const PanelPresenciaComponent: React.FC<Props> = ({ darkMode = false }) => {
    const [lista, setLista] = useState<Presencia[]>([]);
    const [alertas, setAlertas] = useState<string[]>([]);
    const enLineaAnterior = useRef<Set<number>>(new Set());

    const c = {
        bgSuave: darkMode ? "#0D1117" : "#F8FAFC",
        bgTarjeta: darkMode ? "#161B22" : "#FFFFFF",
        borde: darkMode ? "#30363D" : "#E2E8F0",
        texto: darkMode ? "#F0F6FC" : "#0F172A",
        textoSecundario: darkMode ? "#8B949E" : "#64748B",
    };

    const cargar = async () => {
        try {
            const res = await api.get("/presencia", obtenerHeaders());
            const datos: Presencia[] = Array.isArray(res.data) ? res.data : [];

            const enLineaAhora = new Set(
                datos.filter((p) => segundosDesde(p.ultimoHeartbeat) <= SEGUNDOS_EN_LINEA).map((p) => p.idUsuario)
            );

            // Comparamos contra la foto anterior: quien estaba en línea y ya no está, se avisa.
            const nuevasAlertas: string[] = [];
            enLineaAnterior.current.forEach((id) => {
                if (!enLineaAhora.has(id)) {
                    const persona = datos.find((p) => p.idUsuario === id);
                    if (persona) {
                        nuevasAlertas.push(`${persona.usuario.nombre} ${persona.usuario.apellido} se desconectó`);
                    }
                }
            });
            if (nuevasAlertas.length > 0) {
                setAlertas((prev) => [...nuevasAlertas, ...prev].slice(0, 5));
            }

            enLineaAnterior.current = enLineaAhora;
            setLista(datos);
        } catch (err) {
            console.error("Error al cargar presencia", err);
        }
    };

    useEffect(() => {
        cargar();
        const intervalo = setInterval(cargar, 10000);
        return () => clearInterval(intervalo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const enLinea = lista.filter((p) => segundosDesde(p.ultimoHeartbeat) <= SEGUNDOS_EN_LINEA);
    const desconectadosRecientes = lista.filter((p) => segundosDesde(p.ultimoHeartbeat) > SEGUNDOS_EN_LINEA);

    return (
        <div className="roles-card">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Users size={22} color="#059669" /> Usuarios Conectados
            </h2>
            <p style={{ color: c.textoSecundario, fontSize: "0.85rem", margin: "0 0 16px 0" }}>
                Se actualiza solo cada 10 segundos. Ojo: esto solo puede notar que alguien dejó de
                avisar "sigo acá" — mientras un dispositivo esté realmente sin señal, no hay forma de
                saber en vivo qué está haciendo, recién se sabe cuando vuelve a tener conexión.
            </p>

            {alertas.length > 0 && (
                <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {alertas.map((a, i) => (
                        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#92400E", fontWeight: 600 }}>
                            <AlertTriangle size={14} /> {a}
                        </span>
                    ))}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {lista.length === 0 && (
                    <p style={{ color: c.textoSecundario, fontSize: "0.85rem" }}>No hay actividad reciente de ningún usuario.</p>
                )}
                {[...enLinea, ...desconectadosRecientes].map((p) => {
                    const online = segundosDesde(p.ultimoHeartbeat) <= SEGUNDOS_EN_LINEA;
                    return (
                        <div key={p.idUsuario} style={{ backgroundColor: c.bgTarjeta, border: `1px solid ${c.borde}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                            {online ? <Wifi size={18} color="#059669" /> : <WifiOff size={18} color="#DC2626" />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <strong style={{ display: "block", fontSize: "0.88rem", color: c.texto }}>
                                    {p.usuario.nombre} {p.usuario.apellido}
                                </strong>
                                <span style={{ fontSize: "0.75rem", color: c.textoSecundario, display: "flex", alignItems: "center", gap: "4px" }}>
                                    {iconoPlataforma(p.plataforma)} {online ? "En línea" : `Desconectado ${formatearTranscurrido(segundosDesde(p.ultimoHeartbeat))}`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PanelPresenciaComponent;
