import React from 'react';
import { Activity, MapPin, Clock, FileText } from 'lucide-react';

interface TecnicoActivo {
  id: number;
  nombre: string;
  email: string;
  tareaActual: string;
  empresaAsignada: string;
  ubicacionNombre: string;
  horaInicio: string;
  estado: 'EN_PROGRESO' | 'PAUSADO' | 'COMPLETADO';
}

interface Props {
  tecnicos: TecnicoActivo[];
}

export const MonitorTecnicosActivos: React.FC<Props> = ({ tecnicos }) => {
  return (
    <div style={{ backgroundColor: "#0B132B", padding: "20px", borderRadius: "10px", border: "1px solid #1E293B" }}>
      <h3 style={{ color: "#38BDF8", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 15px 0" }}>
        <Activity size={20} className="icon-pulse" color="#10B981" />
        Técnicos en Campo y Tareas Activas
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
        {tecnicos.map((t) => (
          <div
            key={t.id}
            style={{
              backgroundColor: "#0F172A",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #1E293B",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <strong style={{ color: "#F8FAFC", fontSize: "0.95rem" }}>{t.nombre}</strong>
              <span style={{
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: "bold",
                backgroundColor: t.estado === 'EN_PROGRESO' ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: t.estado === 'EN_PROGRESO' ? "#34D399" : "#FBBF24"
              }}>
                {t.estado === 'EN_PROGRESO' ? '🟢 En Servicio' : '🟡 Pausado'}
              </span>
            </div>

            <p style={{ margin: "4px 0", fontSize: "0.8rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={14} color="#38BDF8" /> {t.tareaActual}
            </p>
            <p style={{ margin: "4px 0", fontSize: "0.8rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={14} color="#10B981" /> {t.empresaAsignada} ({t.ubicacionNombre})
            </p>
            <p style={{ margin: "4px 0", fontSize: "0.75rem", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={12} /> Inicio: {t.horaInicio}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};