import React, { useState } from "react";
import { ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../service/api";

interface Props {
  darkMode?: boolean;
}

export const IperFormularioWizard: React.FC<Props> = ({ darkMode }) => {
  const [paso, setPaso] = useState(1);

  // 🌟 SI NO LLEGA LA PROP, DETECTAMOS SI EL TEMA ES OSCURO DIRECTO DE LA CLASE O LOCALSTORAGE
  const isDark = darkMode ?? (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark") ||
    localStorage.getItem("theme") === "dark"
  );

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

  // 🌟 ESTILOS FORZADOS AL 100% PARA MODO OSCURO / CLARO
  const theme = {
    cardBg: isDark ? "#0b132b" : "#FFFFFF",
    cardText: isDark ? "#F8FAFC" : "#0F172A",
    border: isDark ? "1px solid #1e293b" : "1px solid #E2E8F0",
    headerColor: isDark ? "#38BDF8" : "#064E3B",
    labelColor: isDark ? "#94A3B8" : "#475569",
    inputBg: isDark ? "#0f172a" : "#FFFFFF",
    inputBorder: isDark ? "1px solid #1e293b" : "1px solid #CBD5E1",
    inputText: isDark ? "#F8FAFC" : "#0F172A",
    btnPrevBg: isDark ? "#334155" : "#64748B",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px",
    borderRadius: "6px",
    backgroundColor: theme.inputBg,
    color: theme.inputText,
    border: theme.inputBorder,
    width: "100%",
    fontSize: "0.9rem",
    outline: "none"
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    color: theme.labelColor,
    fontWeight: "bold",
    marginBottom: "4px"
  };

  return (
    <div style={{ maxWidth: "850px", margin: "20px auto", padding: "0 15px" }}>
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: "12px",
        padding: "28px",
        border: theme.border,
        color: theme.cardText,
        boxShadow: isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 2px 10px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ color: theme.headerColor, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: 0, fontSize: "1.4rem" }}>
            <ShieldAlert size={28} color="#10B981" /> Formulario IPER - Paso {paso} de 6
          </h2>
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Responsable</label>
              <input type="text" value={formData.idResponsable} onChange={e => handleChange("idResponsable", e.target.value)} required style={inputStyle} placeholder="Nombre del responsable..." />
            </div>

            <div>
              <label style={labelStyle}>Fecha de Reporte</label>
              <input type="date" value={formData.fechaReporte} onChange={e => handleChange("fechaReporte", e.target.value)} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Turno</label>
              <select value={formData.turno} onChange={e => handleChange("turno", e.target.value)} style={inputStyle}>
                <option value="MAÑANA">MAÑANA</option>
                <option value="NOCHE">NOCHE</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Descripción del Riesgo</label>
              <textarea value={formData.descripcionRiesgo} onChange={e => handleChange("descripcionRiesgo", e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Describa el riesgo detectado..." />
            </div>

            <div>
              <label style={labelStyle}>Sector de Ubicación del Desvío</label>
              <input type="text" value={formData.sectorUbicacion} onChange={e => handleChange("sectorUbicacion", e.target.value)} style={inputStyle} placeholder="Ej. Depósito Central" />
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>¿Existen medidas de control actuales?</label>
              <select value={formData.existenMedidas} onChange={e => handleChange("existenMedidas", e.target.value)} style={inputStyle}>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>

            {formData.existenMedidas === "SI" && (
              <div>
                <label style={labelStyle}>Descripción de Medidas</label>
                <textarea value={formData.descripcionMedidas} onChange={e => handleChange("descripcionMedidas", e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Detalle las medidas vigentes..." />
              </div>
            )}
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Acciones Sugeridas</label>
              <textarea value={formData.accionesSugeridas} onChange={e => handleChange("accionesSugeridas", e.target.value)} style={{ ...inputStyle, minHeight: "80px" }} placeholder="Sugerencias de acción..." />
            </div>

            <div>
              <label style={labelStyle}>Responsable de Implementación</label>
              <input type="text" value={formData.responsableAcciones} onChange={e => handleChange("responsableAcciones", e.target.value)} style={inputStyle} placeholder="Nombre del encargado..." />
            </div>
          </div>
        )}

        {/* PASO 5 */}
        {paso === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>¿El riesgo fue eliminado?</label>
              <select value={formData.riesgoEliminado} onChange={e => handleChange("riesgoEliminado", e.target.value)} style={inputStyle}>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
                <option value="PARCIALMENTE">PARCIALMENTE</option>
                <option value="EN SEGUIMIENTO">EN SEGUIMIENTO</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 6 */}
        {paso === 6 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyle}>Fecha de Cierre</label>
              <input type="date" value={formData.fechaCierre} onChange={e => handleChange("fechaCierre", e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Subir Archivo de Respaldos (Fotos / Documentos)</label>
              <input type="file" onChange={e => e.target.files && handleChange("archivo", e.target.files[0])} style={{ color: theme.inputText, fontSize: "0.85rem" }} />
            </div>
          </div>
        )}

        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px" }}>
          {paso > 1 && (
            <button onClick={handlePrev} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: theme.btnPrevBg, color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold" }}>
              <ArrowLeft size={16} /> Anterior
            </button>
          )}

          {paso < 6 ? (
            <button onClick={handleNext} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: "#10B981", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", fontWeight: "bold" }}>
              Siguiente <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmitFinal} className="btn-interactive" style={{ padding: "10px 18px", backgroundColor: "#059669", color: "#FFF", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto", fontWeight: "bold" }}>
              <CheckCircle2 size={16} /> Enviar Formulario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};