import React, { useEffect, useState } from "react";
import { ClipboardCheck, FileDown, Search } from "lucide-react";
import api from "../../service/api";
import type { IPERFormulario } from "../../types/iper";
import "../documentos/documentos.css";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const badgeNivel = (nivel?: string) => {
    const n = (nivel || "").toUpperCase();
    if (n.includes("CRIT") || n.includes("ALT")) return { bg: "#fee2e2", color: "#b91c1c" };
    if (n.includes("MEDI")) return { bg: "#fef9c3", color: "#a16207" };
    if (n.includes("BAJ")) return { bg: "#dcfce7", color: "#15803d" };
    return { bg: "#f1f5f9", color: "#64748b" };
};

// US: Como tecnico quiero generar documentos de evaluacion de riesgo para reportar
// resultados (UH-25) — historial de formularios IPER con descarga de reporte en PDF.
const HistorialIperComponent: React.FC = () => {
    const [formularios, setFormularios] = useState<IPERFormulario[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [error, setError] = useState("");

    const cargar = async () => {
        try {
            const res = await api.get("/iper/activos", obtenerHeaders());
            setFormularios(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar formularios IPER", err);
        }
    };

    useEffect(() => { cargar(); }, []);

    const descargarPdf = async (id: number) => {
        setError("");
        try {
            const res = await api.get(`/iper/${id}/pdf`, { ...obtenerHeaders(), responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte-iper-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError("No se pudo generar el reporte PDF.");
        }
    };

    const filtrados = formularios.filter((f) =>
        (f.empresa || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (f.sector || "").toLowerCase().includes(busqueda.toLowerCase()) ||
        (f.tipoRiesgo || "").toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="documentos-container">
            <div className="documentos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <ClipboardCheck size={24} color="#059669" /> HISTORIAL DE FORMULARIOS IPER
                </h1>

                <div className="documentos-form-grid" style={{ gridTemplateColumns: "1fr", paddingBottom: "14px" }}>
                    <div className="form-section">
                        <label><Search size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />Buscar por empresa, sector o tipo de riesgo</label>
                        <input className="form-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Ej. Avenir, Depósito, Eléctrico..." />
                    </div>
                </div>

                {error && <p className="msg-error">{error}</p>}

                <div className="tabla-simetrica-wrapper">
                    <table className="tabla-documentos">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Empresa</th>
                                <th>Sector</th>
                                <th>Tipo de Riesgo</th>
                                <th style={{ textAlign: "center" }}>Nivel</th>
                                <th style={{ textAlign: "center" }}>Estado</th>
                                <th>Reporte</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.length > 0 ? filtrados.map((f) => {
                                const badge = badgeNivel(f.nivelRiesgo);
                                return (
                                    <tr key={f.id}>
                                        <td>{f.fecha || "-"}</td>
                                        <td>{f.empresa || "-"}</td>
                                        <td>{f.sector || "-"}</td>
                                        <td>{f.tipoRiesgo || "-"}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className="badge-vencimiento" style={{ backgroundColor: badge.bg, color: badge.color }}>
                                                {f.nivelRiesgo || "-"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>{f.estado || "-"}</td>
                                        <td>
                                            <button type="button" className="btn-doc-accion descargar" onClick={() => descargarPdf(f.id!)}>
                                                <FileDown size={12} /> Descargar PDF
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={7} className="txt-vacio">No hay formularios IPER cargados todavía.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistorialIperComponent;
