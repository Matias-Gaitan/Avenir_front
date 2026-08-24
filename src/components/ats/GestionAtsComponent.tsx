import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Building2
} from "lucide-react";
import api from "../../service/api";
import { guardarAts, type PasoAts, type AtsDTO } from "../../service/atsService";
import {
  getTiposRiesgoActivos,
  getCategoriasRiesgoActivas,
  getCausasRiesgoActivas,
  getProbabilidadesActivas
} from "../../service/iperService";

interface ItemCat {
  id?: number;
  nombre: string;
  nivel?: number;
}

interface Empresa {
  idEmpresa?: number;
  nombre: string;
}

interface Props {
  darkMode?: boolean;
}

export const GestionAtsComponent: React.FC<Props> = ({ darkMode }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tiposRiesgo, setTiposRiesgo] = useState<ItemCat[]>([]);
  const [categoriasRiesgo, setCategoriasRiesgo] = useState<ItemCat[]>([]);
  const [causasRiesgo, setCausasRiesgo] = useState<ItemCat[]>([]);
  const [probabilidades, setProbabilidades] = useState<ItemCat[]>([]);

  // 🌟 SI NO LLEGA LA PROP, DETECTAMOS SI EL TEMA ES OSCURO DIRECTO DE LA CLASE O LOCALSTORAGE
  const isDark = darkMode ?? (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark") ||
    localStorage.getItem("theme") === "dark"
  );

  const [idEmpresa, setIdEmpresa] = useState<number | "">("");
  const [ubicacion, setUbicacion] = useState("");
  const [tarea, setTarea] = useState("");
  const [idTipoRiesgo, setIdTipoRiesgo] = useState<number | "">("");
  const [idCategoriaRiesgo, setIdCategoriaRiesgo] = useState<number | "">("");
  const [idCausaRiesgo, setIdCausaRiesgo] = useState<number | "">("");
  const [idProbabilidad, setIdProbabilidad] = useState<number | "">("");

  const [pasos, setPasos] = useState<PasoAts[]>([
    { paso: 1, descripcion: "", peligro: "", riesgo: "", medidaControl: "" }
  ]);

  useEffect(() => {
    cargarParametros();
  }, []);

  const cargarParametros = async () => {
    try {
      const resEmp = await api.get("/empresas");
      setEmpresas(Array.isArray(resEmp.data) ? resEmp.data : []);
      setTiposRiesgo(await getTiposRiesgoActivos());
      setCategoriasRiesgo(await getCategoriasRiesgoActivas());
      setCausasRiesgo(await getCausasRiesgoActivas());
      setProbabilidades(await getProbabilidadesActivas());
    } catch (err) {
      console.error("Error al cargar parámetros:", err);
    }
  };

  const handleAgregarPaso = () => {
    setPasos([
      ...pasos,
      { paso: pasos.length + 1, descripcion: "", peligro: "", riesgo: "", medidaControl: "" }
    ]);
  };

  const handleEliminarPaso = (index: number) => {
    if (pasos.length === 1) return;
    const nuevosPasos = pasos.filter((_, i) => i !== index).map((p, idx) => ({ ...p, paso: idx + 1 }));
    setPasos(nuevosPasos);
  };

  const handlePasoChange = (index: number, field: keyof PasoAts, value: string) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = { ...nuevosPasos[index], [field]: value };
    setPasos(nuevosPasos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: AtsDTO = {
      empresaId: Number(idEmpresa),
      usuarioAuditorEmail: localStorage.getItem("email") || "tecnico@avenir.com",
      fechaRealizacion: new Date().toISOString().split("T")[0],
      ubicacionSector: ubicacion,
      tareaARealizar: tarea,
      tipoRiesgoId: Number(idTipoRiesgo),
      categoriaRiesgoId: Number(idCategoriaRiesgo),
      causaRiesgoId: Number(idCausaRiesgo),
      probabilidadId: Number(idProbabilidad),
      pasosTarea: pasos
    };

    try {
      await guardarAts(payload);
      alert("¡Análisis de Trabajo Seguro (ATS) registrado con éxito!");
      setUbicacion("");
      setTarea("");
      setIdEmpresa("");
      setIdTipoRiesgo("");
      setIdCategoriaRiesgo("");
      setIdCausaRiesgo("");
      setIdProbabilidad("");
      setPasos([{ paso: 1, descripcion: "", peligro: "", riesgo: "", medidaControl: "" }]);
    } catch (err: any) {
      console.error("Error al enviar ATS:", err);
      alert(err.response?.data || "Error al registrar el ATS.");
    }
  };

  const theme = {
    cardBg: isDark ? "#0b132b" : "#FFFFFF",
    cardText: isDark ? "#F8FAFC" : "#0F172A",
    border: isDark ? "1px solid #1e293b" : "1px solid #E2E8F0",
    headerColor: isDark ? "#38BDF8" : "#064E3B",
    labelColor: isDark ? "#94A3B8" : "#475569",
    inputBg: isDark ? "#0f172a" : "#FFFFFF",
    inputBorder: isDark ? "1px solid #1e293b" : "1px solid #CBD5E1",
    inputText: isDark ? "#F8FAFC" : "#0F172A",
    blockBg: isDark ? "#0f172a" : "#F1F5F9",
    tableHeaderBg: isDark ? "#1e293b" : "#E2E8F0",
    tableHeaderText: isDark ? "#38BDF8" : "#0F172A"
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", padding: "0 15px" }}>
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: "12px",
        padding: "28px",
        border: theme.border,
        boxShadow: isDark ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)" : "0 2px 10px rgba(0, 0, 0, 0.05)",
        color: theme.cardText
      }}>
        <h2 style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: theme.headerColor,
          fontSize: "1.4rem",
          margin: "0 0 20px 0",
          borderBottom: theme.border,
          paddingBottom: "15px"
        }}>
          <FileCheck size={28} className="icon-pulse" color="#10B981" />
          Análisis de Trabajo Seguro (ATS) - Operativo Campo
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Bloque 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: theme.labelColor, fontWeight: "bold", marginBottom: "6px" }}>
                <Building2 size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Empresa Auditada
              </label>
              <select
                value={idEmpresa}
                onChange={(e) => setIdEmpresa(Number(e.target.value))}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}
              >
                <option value="">Seleccionar Empresa...</option>
                {empresas.map((e) => (
                  <option key={e.idEmpresa} value={e.idEmpresa}>{e.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: theme.labelColor, fontWeight: "bold", marginBottom: "6px" }}>Ubicación / Sector de Trabajo</label>
              <input
                type="text"
                placeholder="Ej. Planta Alta - Sector B"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", color: theme.labelColor, fontWeight: "bold", marginBottom: "6px" }}>Tarea Específica a Realizar</label>
              <input
                type="text"
                placeholder="Ej. Mantenimiento de Tablero..."
                value={tarea}
                onChange={(e) => setTarea(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}
              />
            </div>
          </div>

          {/* Bloque 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "25px", backgroundColor: theme.blockBg, padding: "16px", borderRadius: "8px", border: theme.border }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: theme.headerColor, fontWeight: "bold", marginBottom: "6px" }}>Tipo de Riesgo (IPER)</label>
              <select value={idTipoRiesgo} onChange={(e) => setIdTipoRiesgo(Number(e.target.value))} required style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}>
                <option value="">Seleccionar Tipo...</option>
                {tiposRiesgo.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: theme.headerColor, fontWeight: "bold", marginBottom: "6px" }}>Categoría de Riesgo</label>
              <select value={idCategoriaRiesgo} onChange={(e) => setIdCategoriaRiesgo(Number(e.target.value))} required style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}>
                <option value="">Seleccionar Categoría...</option>
                {categoriasRiesgo.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: theme.headerColor, fontWeight: "bold", marginBottom: "6px" }}>Causa de Riesgo</label>
              <select value={idCausaRiesgo} onChange={(e) => setIdCausaRiesgo(Number(e.target.value))} required style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}>
                <option value="">Seleccionar Causa...</option>
                {causasRiesgo.map((ca) => (
                  <option key={ca.id} value={ca.id}>{ca.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: theme.headerColor, fontWeight: "bold", marginBottom: "6px" }}>Nivel de Criticidad</label>
              <select value={idProbabilidad} onChange={(e) => setIdProbabilidad(Number(e.target.value))} required style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText }}>
                <option value="">Seleccionar Nivel...</option>
                {probabilidades.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} (Nivel {p.nivel || 1})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bloque 3 */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, color: "#10B981", fontSize: "1rem", fontWeight: "bold" }}>Secuencia de Pasos y Medidas Preventivas</h4>
              <button
                type="button"
                onClick={handleAgregarPaso}
                className="btn-interactive"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem"
                }}
              >
                <Plus size={16} /> Agregar Paso
              </button>
            </div>

            <div style={{ overflowX: "auto", border: theme.border, borderRadius: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: theme.blockBg }}>
                <thead>
                  <tr style={{ backgroundColor: theme.tableHeaderBg, color: theme.tableHeaderText, fontSize: "0.75rem", textTransform: "uppercase" }}>
                    <th style={{ width: "50px", padding: "12px 10px", textAlign: "center" }}>#</th>
                    <th style={{ width: "23%", padding: "12px 10px", textAlign: "left" }}>Paso de la Tarea</th>
                    <th style={{ width: "23%", padding: "12px 10px", textAlign: "left" }}>Peligro Identificado</th>
                    <th style={{ width: "23%", padding: "12px 10px", textAlign: "left" }}>Riesgo / Impacto</th>
                    <th style={{ width: "23%", padding: "12px 10px", textAlign: "left" }}>Medida de Control</th>
                    <th style={{ width: "40px", padding: "12px 10px", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pasos.map((p, index) => (
                    <tr key={index} style={{ borderBottom: theme.border }}>
                      <td style={{ textAlign: "center", fontWeight: "bold", color: "#10B981" }}>{p.paso}</td>
                      <td style={{ padding: "8px" }}>
                        <input type="text" value={p.descripcion} onChange={(e) => handlePasoChange(index, "descripcion", e.target.value)} placeholder="Ej. Bloqueo LOTO" required style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText, fontSize: "0.85rem" }} />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input type="text" value={p.peligro} onChange={(e) => handlePasoChange(index, "peligro", e.target.value)} placeholder="Ej. Energía eléctrica" required style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText, fontSize: "0.85rem" }} />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input type="text" value={p.riesgo} onChange={(e) => handlePasoChange(index, "riesgo", e.target.value)} placeholder="Ej. Electrocución" required style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText, fontSize: "0.85rem" }} />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input type="text" value={p.medidaControl} onChange={(e) => handlePasoChange(index, "medidaControl", e.target.value)} placeholder="Ej. Candado y EPP" required style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: theme.inputBg, border: theme.inputBorder, color: theme.inputText, fontSize: "0.85rem" }} />
                      </td>
                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {pasos.length > 1 && (
                          <button type="button" onClick={() => handleEliminarPaso(index)} style={{ backgroundColor: "transparent", border: "none", color: "#EF4444", cursor: "pointer", padding: "4px" }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="submit"
            className="btn-interactive"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#10B981",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)"
            }}
          >
            <CheckCircle2 size={20} /> GUARDAR ANÁLISIS DE TRABAJO SEGURO (ATS)
          </button>
        </form>
      </div>
    </div>
  );
};