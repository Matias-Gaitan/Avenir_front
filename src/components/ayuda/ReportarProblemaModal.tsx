import React, { useState } from "react";
import { X, Bug, Lightbulb, HelpCircle, MessageCircle } from "lucide-react";

// Número de soporte de Avenir: 3541-204059 (Argentina), en formato internacional para WhatsApp.
const NUMERO_WHATSAPP_SOPORTE = "5493541204059";

interface Props {
    abierto: boolean;
    onCerrar: () => void;
    moduloActual: string | null;
}

type Tipo = "ERROR" | "SUGERENCIA" | "NO_FUNCIONA_COMO_ESPERABAMOS";

const tipos: { valor: Tipo; icono: React.ReactNode; titulo: string; texto: string }[] = [
    { valor: "ERROR", icono: <Bug size={18} />, titulo: "Encontré un error", texto: "Algo se rompió, no guarda, o se ve mal." },
    { valor: "SUGERENCIA", icono: <Lightbulb size={18} />, titulo: "Sugerencia o mejora", texto: "Falta algo, o se podría hacer más completo." },
    { valor: "NO_FUNCIONA_COMO_ESPERABAMOS", icono: <HelpCircle size={18} />, titulo: "No funciona como esperábamos", texto: "La lógica no es como lo hacemos en el día a día." }
];

const ReportarProblemaModal: React.FC<Props> = ({ abierto, onCerrar, moduloActual }) => {
    const [tipo, setTipo] = useState<Tipo | null>(null);
    const [descripcion, setDescripcion] = useState("");

    if (!abierto) return null;

    const email = localStorage.getItem("email") || "";
    let nombre = "";
    let rol = "";
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
        rol = usuario.rol || "";
    } catch {
        // localStorage puede no tener el objeto "usuario" bien formado; seguimos sin nombre/rol
    }

    const etiquetaTipo = tipos.find((t) => t.valor === tipo)?.titulo || "";

    const handleEnviar = () => {
        const lineas = [
            `*${etiquetaTipo || "Reporte del sistema"}*`,
            moduloActual ? `Módulo: ${moduloActual}` : null,
            `Usuario: ${nombre} (${email})${rol ? ` — ${rol}` : ""}`,
            "",
            descripcion.trim() || "(sin descripción)"
        ].filter(Boolean);

        const texto = encodeURIComponent(lineas.join("\n"));
        window.open(`https://wa.me/${NUMERO_WHATSAPP_SOPORTE}?text=${texto}`, "_blank", "noopener,noreferrer");
        setDescripcion("");
        setTipo(null);
        onCerrar();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(4, 24, 18, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}
            onClick={onCerrar}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", maxWidth: "460px", width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.4)" }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #E2E8F0" }}>
                    <strong style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", color: "#0F172A" }}>
                        <MessageCircle size={18} color="#25D366" /> Reportar algo del sistema
                    </strong>
                    <button onClick={onCerrar} aria-label="Cerrar" style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}><X size={18} /></button>
                </div>

                <div style={{ padding: "18px 22px" }}>
                    <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: 0 }}>
                        Esto se envía por WhatsApp directo al equipo. Sirve para errores, ideas de mejora,
                        o cuando algo no funciona como realmente lo trabajan en el día a día.
                        {moduloActual && <> Se va a marcar que estabas en <strong>{moduloActual}</strong>.</>}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                        {tipos.map((t) => (
                            <button
                                key={t.valor}
                                type="button"
                                onClick={() => setTipo(t.valor)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                    borderRadius: "8px", border: "1px solid", textAlign: "left", cursor: "pointer",
                                    borderColor: tipo === t.valor ? "#25D366" : "#E2E8F0",
                                    backgroundColor: tipo === t.valor ? "#ECFDF5" : "#F8FAFC"
                                }}
                            >
                                <span style={{ color: tipo === t.valor ? "#25D366" : "#64748B" }}>{t.icono}</span>
                                <span>
                                    <strong style={{ display: "block", fontSize: "0.88rem", color: "#0F172A" }}>{t.titulo}</strong>
                                    <span style={{ fontSize: "0.78rem", color: "#64748B" }}>{t.texto}</span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F172A", display: "block", marginBottom: "6px" }}>Contanos con tus palabras</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={4}
                        placeholder="Ej. Al cargar una entrega de insumos el stock no se actualiza..."
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.88rem", fontFamily: "inherit", resize: "vertical" }}
                    />

                    <button
                        type="button"
                        disabled={!tipo}
                        onClick={handleEnviar}
                        style={{
                            marginTop: "16px", width: "100%", padding: "11px", borderRadius: "8px", border: "none",
                            backgroundColor: tipo ? "#25D366" : "#CBD5E1", color: "#FFFFFF", fontWeight: 700,
                            cursor: tipo ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                        }}
                    >
                        <MessageCircle size={16} /> Enviar por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportarProblemaModal;
