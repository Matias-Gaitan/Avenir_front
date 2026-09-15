import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// El navegador no siempre expone un icono visible para instalar la PWA
// (Brave lo esconde, y en Edge/Chrome puede no aparecer segun la version).
// Escuchamos el evento nativo y lo disparamos nosotros desde un boton propio.
interface EventoInstalacion extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstalarAppBoton({ darkMode }: { darkMode: boolean }) {
    const [eventoDiferido, setEventoDiferido] = useState<EventoInstalacion | null>(null);
    const [yaInstalada, setYaInstalada] = useState(false);

    useEffect(() => {
        const esStandalone = window.matchMedia("(display-mode: standalone)").matches;
        setYaInstalada(esStandalone);

        const manejarPrompt = (e: Event) => {
            e.preventDefault();
            setEventoDiferido(e as EventoInstalacion);
        };
        const manejarInstalada = () => {
            setYaInstalada(true);
            setEventoDiferido(null);
        };

        window.addEventListener("beforeinstallprompt", manejarPrompt);
        window.addEventListener("appinstalled", manejarInstalada);
        return () => {
            window.removeEventListener("beforeinstallprompt", manejarPrompt);
            window.removeEventListener("appinstalled", manejarInstalada);
        };
    }, []);

    if (yaInstalada || !eventoDiferido) {
        return null;
    }

    const instalar = async () => {
        await eventoDiferido.prompt();
        await eventoDiferido.userChoice;
        setEventoDiferido(null);
    };

    return (
        <button
            onClick={instalar}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: darkMode ? "#1F2937" : "#065F46",
                color: darkMode ? "#38BDF8" : "#A7F3D0",
                border: darkMode ? "1px solid #38BDF8" : "1px solid #34D399",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: "bold",
                cursor: "pointer"
            }}
        >
            <Download size={14} /> Instalar App
        </button>
    );
}
