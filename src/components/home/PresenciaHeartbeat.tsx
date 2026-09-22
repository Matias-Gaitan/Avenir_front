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

const PresenciaHeartbeat: React.FC = () => {
    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        const enviar = () => {
            if (!navigator.onLine) return;
            api.post("/presencia/heartbeat", { plataforma: detectarPlataforma() }, obtenerHeaders()).catch(() => {

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
