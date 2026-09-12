import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { obtenerPendientes } from "../../service/offlineQueue";

// Muestra el estado de conexión de ESTE dispositivo/usuario únicamente. No hay forma
// de saber en tiempo real qué está haciendo un dispositivo que está realmente sin
// señal (por eso no existe algo así para "otros" usuarios) — esto es honesto sobre esa
// limitación y solo informa el propio estado del que está mirando la pantalla.
const ConectividadIndicador: React.FC = () => {
    const [enLinea, setEnLinea] = useState(navigator.onLine);
    const [pendientes, setPendientes] = useState(() => obtenerPendientes().length);

    useEffect(() => {
        const actualizarPendientes = () => setPendientes(obtenerPendientes().length);
        const alConectar = () => { setEnLinea(true); actualizarPendientes(); };
        const alDesconectar = () => setEnLinea(false);

        window.addEventListener("online", alConectar);
        window.addEventListener("offline", alDesconectar);
        // Revisa la cola periódicamente por si otro componente la modificó
        const intervalo = setInterval(actualizarPendientes, 3000);

        return () => {
            window.removeEventListener("online", alConectar);
            window.removeEventListener("offline", alDesconectar);
            clearInterval(intervalo);
        };
    }, []);

    if (enLinea && pendientes === 0) {
        return (
            <span title="Conectado" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6EE7B7", fontSize: "0.78rem", fontWeight: 700 }}>
                <Wifi size={15} />
            </span>
        );
    }

    if (!enLinea) {
        return (
            <span title="Sin conexión: los fichajes se guardan en este dispositivo" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(220,38,38,0.15)", color: "#FCA5A5", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>
                <WifiOff size={14} /> Sin conexión{pendientes > 0 ? ` · ${pendientes} pendiente${pendientes > 1 ? "s" : ""}` : ""}
            </span>
        );
    }

    return (
        <span title="Sincronizando cambios guardados localmente" style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "rgba(245,158,11,0.15)", color: "#FCD34D", padding: "4px 10px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>
            <RefreshCw size={14} className="icon-spin-hover" /> Sincronizando {pendientes}
        </span>
    );
};

export default ConectividadIndicador;
