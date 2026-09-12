import React, { useEffect, useState } from "react";
import { Activity, FileWarning, Users, Clock } from "lucide-react";
import api from "../../service/api";
import "./estado.css";
import type { RegistroAsistencia } from "../../interfaces/RegistroAsistencia";
import type { Documento } from "../../interfaces/Documento";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const formatearHora = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// US: Como administrador quiero visualizar qué técnicos están activos y qué documentación
// está activa, para tener control del estado operativo y documental del sistema (UH-37)
const EstadoSistemaComponent: React.FC = () => {
    const [activos, setActivos] = useState<RegistroAsistencia[]>([]);
    const [documentos, setDocumentos] = useState<Documento[]>([]);

    useEffect(() => {
        api.get("/asistencia/activos", obtenerHeaders())
            .then((res) => setActivos(res.data))
            .catch((err) => console.error("Error al cargar técnicos activos", err));

        api.get("/documentos?activo=true", obtenerHeaders())
            .then((res) => setDocumentos(res.data))
            .catch((err) => console.error("Error al cargar documentos", err));
    }, []);

    const vigentes = documentos.filter((d) => d.estadoVencimiento === "VIGENTE" || d.estadoVencimiento === "SIN_VENCIMIENTO").length;
    const porVencer = documentos.filter((d) => d.estadoVencimiento === "POR_VENCER").length;
    const vencidos = documentos.filter((d) => d.estadoVencimiento === "VENCIDO").length;

    return (
        <div className="estado-container">
            <div className="estado-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <Activity size={24} color="#059669" /> ESTADO DEL SISTEMA
                </h1>

                <div className="estado-resumen-grid">
                    <div className="estado-resumen-tile tile-activos">
                        <div className="numero">{activos.length}</div>
                        <div className="etiqueta">Técnicos Activos</div>
                    </div>
                    <div className="estado-resumen-tile tile-vigente">
                        <div className="numero">{vigentes}</div>
                        <div className="etiqueta">Documentos Vigentes</div>
                    </div>
                    <div className="estado-resumen-tile tile-por-vencer">
                        <div className="numero">{porVencer}</div>
                        <div className="etiqueta">Por Vencer</div>
                    </div>
                    <div className="estado-resumen-tile tile-vencido">
                        <div className="numero">{vencidos}</div>
                        <div className="etiqueta">Vencidos</div>
                    </div>
                </div>

                <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#064e3b", marginBottom: "10px" }}>
                    <Users size={16} /> Técnicos con Ingreso Activo Ahora
                </strong>

                {activos.length > 0 ? activos.map((reg) => (
                    <div key={reg.idAsistencia} className="tecnico-activo-item">
                        <span><strong>{reg.usuario?.nombre} {reg.usuario?.apellido}</strong></span>
                        <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={13} /> Desde las {formatearHora(reg.horaIngreso)}
                        </span>
                    </div>
                )) : <p className="txt-vacio">No hay técnicos con ingreso activo en este momento.</p>}

                <strong style={{ display: "flex", alignItems: "center", gap: "6px", color: "#064e3b", margin: "20px 0 10px 0" }}>
                    <FileWarning size={16} /> Documentación por Vencer o Vencida
                </strong>

                {documentos.filter((d) => d.estadoVencimiento === "POR_VENCER" || d.estadoVencimiento === "VENCIDO").length > 0 ? (
                    documentos.filter((d) => d.estadoVencimiento === "POR_VENCER" || d.estadoVencimiento === "VENCIDO").map((doc) => (
                        <div key={doc.idDocumento} className="tecnico-activo-item">
                            <span>{doc.nombre}</span>
                            <span style={{ color: doc.estadoVencimiento === "VENCIDO" ? "#b91c1c" : "#a16207", fontWeight: 700 }}>
                                {doc.fechaVencimiento} ({doc.estadoVencimiento === "VENCIDO" ? "Vencido" : "Por vencer"})
                            </span>
                        </div>
                    ))
                ) : <p className="txt-vacio">Toda la documentación activa está vigente.</p>}
            </div>
        </div>
    );
};

export default EstadoSistemaComponent;
