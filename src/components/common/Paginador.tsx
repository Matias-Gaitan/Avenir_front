import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    pagina: number;
    totalPaginas: number;
    totalItems: number;
    porPagina: number;
    onCambiarPagina: (pagina: number) => void;
    darkMode?: boolean;
}

export const Paginador: React.FC<Props> = ({ pagina, totalPaginas, totalItems, porPagina, onCambiarPagina, darkMode = false }) => {
    if (totalItems === 0 || totalPaginas <= 1) return null;

    const inicio = (pagina - 1) * porPagina + 1;
    const fin = Math.min(pagina * porPagina, totalItems);

    const estiloBoton = (deshabilitado: boolean): React.CSSProperties => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        border: darkMode ? "1px solid #30363D" : "1px solid #CBD5E1",
        backgroundColor: deshabilitado ? "transparent" : (darkMode ? "#21262D" : "#F1F5F9"),
        color: deshabilitado ? (darkMode ? "#30363D" : "#CBD5E1") : (darkMode ? "#F0F6FC" : "#0F172A"),
        cursor: deshabilitado ? "not-allowed" : "pointer"
    });

    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "14px",
            padding: "10px 2px 0 2px",
            borderTop: darkMode ? "1px solid #21262D" : "1px solid #E2E8F0"
        }}>
            <span style={{ fontSize: "0.78rem", color: darkMode ? "#8B949E" : "#64748B" }}>
                Mostrando {inicio}–{fin} de {totalItems}
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                    type="button"
                    disabled={pagina <= 1}
                    onClick={() => onCambiarPagina(pagina - 1)}
                    style={estiloBoton(pagina <= 1)}
                >
                    <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: darkMode ? "#F0F6FC" : "#0F172A", minWidth: "90px", textAlign: "center" }}>
                    Página {pagina} de {totalPaginas}
                </span>
                <button
                    type="button"
                    disabled={pagina >= totalPaginas}
                    onClick={() => onCambiarPagina(pagina + 1)}
                    style={estiloBoton(pagina >= totalPaginas)}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};
