import { useEffect, useState } from "react";
import { Download, Share, X, PlusSquare } from "lucide-react";

interface EventoInstalacion extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

export default function InstalarAppBoton({ darkMode }: { darkMode: boolean }) {
    const [eventoDiferido, setEventoDiferido] = useState<EventoInstalacion | null>(null);
    const [yaInstalada, setYaInstalada] = useState(false);
    const [mostrarInstruccionesIOS, setMostrarInstruccionesIOS] = useState(false);

    useEffect(() => {
        const modoStandalone = window.matchMedia("(display-mode: standalone)").matches;
        const iosStandalone = (window.navigator as any).standalone === true;
        setYaInstalada(modoStandalone || iosStandalone);

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

    if (yaInstalada) {
        return null;
    }

    const botonEstilo: React.CSSProperties = {
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
    };

    if (esIOS()) {
        return (
            <>
                <button onClick={() => setMostrarInstruccionesIOS(true)} style={botonEstilo}>
                    <Download size={14} /> Instalar App
                </button>

                {mostrarInstruccionesIOS && (
                    <div
                        onClick={() => setMostrarInstruccionesIOS(false)}
                        style={{
                            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
                            zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: darkMode ? "#161B22" : "#FFFFFF",
                                color: darkMode ? "#F0F6FC" : "#0F172A",
                                borderRadius: "12px",
                                padding: "20px",
                                maxWidth: "320px",
                                width: "100%",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <strong style={{ fontSize: "1rem" }}>Instalar Avenir</strong>
                                <button onClick={() => setMostrarInstruccionesIOS(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 14px 0", color: darkMode ? "#8B949E" : "#475569" }}>
                                En iPhone la instalación se hace desde Safari, en 2 pasos:
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                <div style={{ backgroundColor: "#0EA5E9", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FFF", fontWeight: "bold", fontSize: "0.8rem" }}>1</div>
                                <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    Tocá el ícono <Share size={16} /> Compartir (abajo en la barra de Safari)
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ backgroundColor: "#0EA5E9", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#FFF", fontWeight: "bold", fontSize: "0.8rem" }}>2</div>
                                <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    Elegí <PlusSquare size={16} /> "Agregar a inicio"
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (!eventoDiferido) {
        return null;
    }

    const instalar = async () => {
        await eventoDiferido.prompt();
        await eventoDiferido.userChoice;
        setEventoDiferido(null);
    };

    return (
        <button onClick={instalar} style={botonEstilo}>
            <Download size={14} /> Instalar App
        </button>
    );
}
