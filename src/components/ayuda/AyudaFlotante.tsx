import React, { useState, useMemo, useEffect } from "react";
import { LifeBuoy, X, ChevronDown, ChevronUp, ArrowRight, MessageCircle } from "lucide-react";
import { articulosAyuda } from "./contenidoAyuda";
import ReportarProblemaModal from "./ReportarProblemaModal";

interface Props {
    moduloActual: string | null;
    darkMode?: boolean;
    onVerTodos: () => void;
}

const AyudaFlotante: React.FC<Props> = ({ moduloActual, darkMode = false, onVerTodos }) => {
    const [abierto, setAbierto] = useState(false);
    const [reporteAbierto, setReporteAbierto] = useState(false);
    const [expandido, setExpandido] = useState<Set<number>>(new Set());

    // Al cambiar de módulo, arrancamos con el panel colapsado de nuevo
    useEffect(() => {
        setExpandido(new Set());
    }, [moduloActual]);

    const c = {
        bg: darkMode ? "#161B22" : "#FFFFFF",
        bgSuave: darkMode ? "#0D1117" : "#F8FAFC",
        borde: darkMode ? "#30363D" : "#E2E8F0",
        texto: darkMode ? "#F0F6FC" : "#0F172A",
        textoSecundario: darkMode ? "#8B949E" : "#64748B",
    };

    const articulos = useMemo(
        () => (moduloActual ? articulosAyuda.filter((a) => a.modulo === moduloActual) : []),
        [moduloActual]
    );

    const toggleArticulo = (idx: number) => {
        setExpandido((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    return (
        <>
            {/* Botón para reportar errores/sugerencias por WhatsApp: visible en toda pantalla,
                lo use el cliente o cualquier empleado, para ir perfeccionando el sistema. */}
            <button
                type="button"
                onClick={() => setReporteAbierto(true)}
                aria-label="Reportar un problema o sugerencia"
                title="Reportar un problema o sugerencia"
                style={{
                    position: "fixed",
                    bottom: moduloActual ? "88px" : "24px",
                    right: "24px",
                    zIndex: 900,
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "none",
                    background: "#25D366",
                    color: "#FFFFFF",
                    boxShadow: "0 10px 24px -6px rgba(37,211,102,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}
            >
                <MessageCircle size={20} />
            </button>

            {moduloActual && (
                <button
                    type="button"
                    onClick={() => setAbierto((v) => !v)}
                    aria-label="Ayuda de este módulo"
                    title="Ayuda de este módulo"
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        zIndex: 900,
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#0F6B45",
                        color: "#FFFFFF",
                        boxShadow: "0 10px 24px -6px rgba(15,107,69,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                    }}
                >
                    {abierto ? <X size={22} /> : <LifeBuoy size={22} />}
                </button>
            )}

            {abierto && moduloActual && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "148px",
                        right: "24px",
                        zIndex: 900,
                        width: "min(360px, calc(100vw - 48px))",
                        maxHeight: "min(70vh, 560px)",
                        overflowY: "auto",
                        backgroundColor: c.bg,
                        border: `1px solid ${c.borde}`,
                        borderRadius: "14px",
                        boxShadow: "0 20px 45px -12px rgba(0,0,0,0.35)"
                    }}
                >
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${c.borde}`, display: "flex", alignItems: "center", gap: "8px" }}>
                        <LifeBuoy size={16} color="#059669" />
                        <strong style={{ color: c.texto, fontSize: "0.92rem" }}>Ayuda: {moduloActual}</strong>
                    </div>

                    <div style={{ padding: "10px 12px" }}>
                        {articulos.length === 0 && (
                            <p style={{ fontSize: "0.85rem", color: c.textoSecundario, padding: "8px 4px" }}>
                                Todavía no hay instructivos para esta pantalla.
                            </p>
                        )}
                        {articulos.map((a) => {
                            const idx = articulosAyuda.indexOf(a);
                            const expandidoActual = expandido.has(idx);
                            return (
                                <div key={idx} style={{ marginBottom: "8px", backgroundColor: c.bgSuave, border: `1px solid ${c.borde}`, borderRadius: "8px", padding: "10px 12px" }}>
                                    <button
                                        type="button"
                                        onClick={() => toggleArticulo(idx)}
                                        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: c.texto, fontWeight: 600, fontSize: "0.85rem", textAlign: "left" }}
                                    >
                                        {a.titulo}
                                        {expandidoActual ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </button>
                                    {expandidoActual && (
                                        <ol style={{ margin: "8px 0 0 0", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "5px" }}>
                                            {a.pasos.map((paso, pIdx) => (
                                                <li key={pIdx} style={{ fontSize: "0.8rem", color: c.textoSecundario, lineHeight: 1.5 }}>{paso}</li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => { setAbierto(false); onVerTodos(); }}
                        style={{ width: "100%", padding: "10px", background: "none", border: "none", borderTop: `1px solid ${c.borde}`, color: "#059669", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                        Ver todos los módulos <ArrowRight size={13} />
                    </button>
                </div>
            )}

            <ReportarProblemaModal
                abierto={reporteAbierto}
                onCerrar={() => setReporteAbierto(false)}
                moduloActual={moduloActual}
            />
        </>
    );
};

export default AyudaFlotante;
