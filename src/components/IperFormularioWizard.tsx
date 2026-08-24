import React, { useState, useEffect } from "react";
import { ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2, Upload } from "lucide-react";
import api from "../service/api";

export const IperFormularioWizard: React.FC = () => {
  const [paso, setPaso] = useState(1);

  // Estado unificado del formulario acumulado
  const [formData, setFormData] = useState({
    idResponsable: "",
    fechaReporte: "",
    turno: "MAÑANA",
    empresa: "",
    tipoRiesgo: "",
    descripcionRiesgo: "",
    causaRiesgo: "",
    sectorUbicacion: "",
    categoriaRiesgo: "",
    nivelRiesgo: "",
    existenMedidas: "SI",
    descripcionMedidas: "",
    impactoPotencial: "",
    probabilidadOcurrencia: "",
    prioridadRiesgo: "",
    accionesSugeridas: "",
    responsableAcciones: "",
    fechaAlternativa: "",
    riesgoEliminado: "NO",
    impactoResidual: "",
    comentarios: "",
    fechaCierre: "",
    archivo: null as File | null
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setPaso(p => Math.min(p + 1, 6));
  const handlePrev = () => setPaso(p => Math.max(p - 1, 1));

  const handleSubmitFinal = async () => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === "archivo" && val) {
          data.append("archivo", val);
        } else {
          data.append(key, String(val));
        }
      });

      await api.post("/iper/formularios", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("¡Formulario IPER enviado con éxito!");
      window.location.href = "/home";
    } catch (err) {
      console.error("Error enviando IPER:", err);
      alert("Error al enviar el reporte IPER.");
    }
  };

  return (
    <div style={{ maxWidth: "850px", margin: "30px auto", padding: "28px", backgroundColor: "#0B132B", borderRadius: "12px", border: "1px solid #1E293B", color: "#F8FAFC" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: 0 }}>
          <ShieldAlert size={28} color="#10B981" /> Formulario IPER - Paso {paso} de 6
        </h2>
      </div>

      {/* PASO 1: Datos Generales */}
      {paso === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>Responsable</label>
          <input type="text" value={formData.idResponsable} onChange={e => handleChange("idResponsable", e.target.value)} required style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />

          <label>Fecha de Reporte</label>
          <input type="date" value={formData.fechaReporte} onChange={e => handleChange("fechaReporte", e.target.value)} required style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />

          <label>Turno</label>
          <select value={formData.turno} onChange={e => handleChange("turno", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }}>
            <option value="MAÑANA">MAÑANA</option>
            <option value="NOCHE">NOCHE</option>
          </select>
        </div>
      )}

      {/* PASO 2: Clasificación de Riesgo */}
      {paso === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>Descripción del Riesgo</label>
          <textarea value={formData.descripcionRiesgo} onChange={e => handleChange("descripcionRiesgo", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />

          <label>Sector de Ubicación del Desvío</label>
          <input type="text" value={formData.sectorUbicacion} onChange={e => handleChange("sectorUbicacion", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />
        </div>
      )}

      {/* PASO 3: Medidas Existentes */}
      {paso === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>¿Existen medidas de control actuales?</label>
          <select value={formData.existenMedidas} onChange={e => handleChange("existenMedidas", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }}>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
          </select>

          {formData.existenMedidas === "SI" && (
            <>
              <label>Descripción de Medidas</label>
              <textarea value={formData.descripcionMedidas} onChange={e => handleChange("descripcionMedidas", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />
            </>
          )}
        </div>
      )}

      {/* PASO 4: Acciones Propuestas */}
      {paso === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>Acciones Sugeridas</label>
          <textarea value={formData.accionesSugeridas} onChange={e => handleChange("accionesSugeridas", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />

          <label>Responsable de Implementación</label>
          <input type="text" value={formData.responsableAcciones} onChange={e => handleChange("responsableAcciones", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />
        </div>
      )}

      {/* PASO 5: Impacto Residual */}
      {paso === 5 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>¿El riesgo fue eliminado?</label>
          <select value={formData.riesgoEliminado} onChange={e => handleChange("riesgoEliminado", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }}>
            <option value="SI">SI</option>
            <option value="NO">NO</option>
            <option value="PARCIALMENTE">PARCIALMENTE</option>
            <option value="EN SEGUIMIENTO">EN SEGUIMIENTO</option>
          </select>
        </div>
      )}

      {/* PASO 6: Adjunto y Cierre */}
      {paso === 6 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label>Fecha de Cierre</label>
          <input type="date" value={formData.fechaCierre} onChange={e => handleChange("fechaCierre", e.target.value)} style={{ padding: "10px", borderRadius: "6px", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155" }} />

          <label>Subir Archivo de Respaldos (Fotos / Documentos)</label>
          <input type="file" onChange={e => e.target.files && handleChange("archivo", e.target.files[0])} style={{ color: "#FFF" }} />
        </div>
      )}

      {/* Botones de Navegación de Flujo */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px" }}>
        {paso > 1 && (
          <button onClick={handlePrev} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: "#334155", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <ArrowLeft size={16} /> Anterior
          </button>
        )}

        {paso < 6 ? (
          <button onClick={handleNext} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
            Siguiente <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmitFinal} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: "#059669", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
            <CheckCircle2 size={16} /> Enviar Formulario
          </button>
        )}
      </div>
    </div>
  );
};