import React from "react";
import { X, ShieldCheck, ClipboardList, Fuel, Clock, Package, LifeBuoy } from "lucide-react";
import logoAvenir from "../../assets/avenir-logo.png";

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    darkMode?: boolean;
}

const destacados = [
    { icono: <Clock size={20} color="#059669" />, titulo: "Ingreso y Egreso", texto: "Fichá tu entrada y salida; las horas trabajadas se calculan solas." },
    { icono: <Fuel size={20} color="#D97706" />, titulo: "Viáticos automáticos", texto: "Los kilómetros de tus visitas se calculan por geolocalización, sin cargarlos a mano." },
    { icono: <Package size={20} color="#7C3AED" />, titulo: "Insumos y EPP", texto: "Consultá el catálogo y la entrega de elementos de protección personal." },
    { icono: <ClipboardList size={20} color="#0F766E" />, titulo: "Tareas y checklist", texto: "Mirá tus tareas asignadas y tildá el checklist antes de cada visita." }
];

const BienvenidaModal: React.FC<Props> = ({ abierto, onCerrar, darkMode = false }) => {
    if (!abierto) return null;

    const bg = darkMode ? "#161B22" : "#FFFFFF";
    const texto = darkMode ? "#F0F6FC" : "#0F172A";
    const textoSecundario = darkMode ? "#8B949E" : "#64748B";
    const borde = darkMode ? "#30363D" : "#E2E8F0";
    const bgTile = darkMode ? "#0D1117" : "#F8FAFC";

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(4, 24, 18, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
            onClick={onCerrar}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: bg, borderRadius: "18px", maxWidth: "620px", width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)" }}
            >
                <div style={{ background: "linear-gradient(135deg, #0F6B45 0%, #0B4A31 100%)", borderRadius: "18px 18px 0 0", padding: "28px 32px", color: "#FFFFFF", position: "relative" }}>
                    <button
                        onClick={onCerrar}
                        aria-label="Cerrar"
                        style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#FFFFFF" }}
                    >
                        <X size={16} />
                    </button>
                    <div style={{ width: "52px", height: "52px", background: "#FFFFFF", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                        <img src={logoAvenir} alt="Avenir" style={{ width: "34px", height: "34px", objectFit: "contain" }} />
                    </div>
                    <h2 style={{ margin: "0 0 8px 0", fontSize: "1.4rem" }}>Bienvenido al sistema de Avenir</h2>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.92, lineHeight: 1.5, maxWidth: "46ch" }}>
                        Acá gestionás toda la operación de higiene y seguridad: fichajes, viáticos, insumos,
                        tareas de campo y la documentación de IPER y ATS, todo en un solo lugar.
                    </p>
                </div>

                <div style={{ padding: "24px 32px 8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                        {destacados.map((d) => (
                            <div key={d.titulo} style={{ backgroundColor: bgTile, border: `1px solid ${borde}`, borderRadius: "12px", padding: "14px" }}>
                                <div style={{ marginBottom: "8px" }}>{d.icono}</div>
                                <strong style={{ display: "block", fontSize: "0.9rem", color: texto, marginBottom: "4px" }}>{d.titulo}</strong>
                                <span style={{ fontSize: "0.82rem", color: textoSecundario, lineHeight: 1.5 }}>{d.texto}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "18px", padding: "12px 14px", backgroundColor: bgTile, borderRadius: "10px", border: `1px solid ${borde}` }}>
                        <LifeBuoy size={18} color="#059669" />
                        <span style={{ fontSize: "0.85rem", color: textoSecundario }}>
                            ¿Tenés dudas más adelante? Abrí <strong style={{ color: texto }}>Centro de Ayuda</strong> en el menú lateral,
                            o volvé a ver esta introducción con el botón "¿Cómo funciona?".
                        </span>
                    </div>
                </div>

                <div style={{ padding: "16px 32px 28px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={onCerrar}
                        style={{ background: "#0F6B45", color: "#FFFFFF", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <ShieldCheck size={16} /> Empezar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BienvenidaModal;
