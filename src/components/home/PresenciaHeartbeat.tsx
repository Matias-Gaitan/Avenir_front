import { useEffect } from "react";
import api from "../../service/api";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const detectarPlataforma = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return "iPhone";
    if (/Android/.test(ua)) return "Android";
    return "PC";
};

// Componente sin UI: mientras el usuario tiene la app abierta y logueada, avisa
// "sigo acá" cada 20s. Es la única forma real de saber quién está conectado:
// mientras un dispositivo esté offline no puede avisar nada, así que ausencia de
// heartbeat es lo más cerca que se puede estar de "se desconectó".
const PresenciaHeartbeat: React.FC = () => {
    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        const enviar = () => {
            if (!navigator.onLine) return;
            api.post("/presencia/heartbeat", { plataforma: detectarPlataforma() }, obtenerHeaders()).catch(() => {
                // Si falla (sin señal, token vencido, etc.) simplemente no se registra este latido
            });
        };

        enviar();
        const intervalo = setInterval(enviar, 20000);

        const alVolverAEstarVisible = () => { if (document.visibilityState === "visible") enviar(); };
        document.addEventListener("visibilitychange", alVolverAEstarVisible);
        window.addEventListener("online", enviar);

        return () => {
            clearInterval(intervalo);
            document.removeEventListener("visibilitychange", alVolverAEstarVisible);
            window.removeEventListener("online", enviar);
        };
    }, []);

    return null;
};

export default PresenciaHeartbeat;
