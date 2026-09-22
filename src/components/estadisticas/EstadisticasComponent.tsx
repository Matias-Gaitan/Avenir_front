import React, { useEffect, useState } from "react";
import { BarChart3, Users, Package, Fuel, ClipboardList } from "lucide-react";
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "../insumos/insumos.css";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

interface PuntoEstadistica {
    etiqueta: string;
    valor: number;
}

const COLORES = ["#059669", "#0d9488", "#f59e0b", "#2563eb", "#7c3aed", "#dc2626", "#64748b"];

const TarjetaGrafico: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", background: "#fff" }}>
        <h3 style={{ fontSize: "0.9rem", color: "#0f172a", margin: "0 0 12px 0", fontWeight: 700 }}>{titulo}</h3>
        <div style={{ width: "100%", height: 260 }}>{children}</div>
    </div>
);

const SinDatos: React.FC = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: "0.85rem" }}>
        Sin datos para el rango seleccionado
    </div>
);

const GraficoBarras: React.FC<{ datos: PuntoEstadistica[]; color?: string; vertical?: boolean }> = ({ datos, color = "#059669", vertical }) => {
    if (!datos || datos.length === 0) return <SinDatos />;
    return (
        <ResponsiveContainer>
            <BarChart data={datos} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                {vertical ? (
                    <>
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="etiqueta" width={120} tick={{ fontSize: 11 }} />
                    </>
                ) : (
                    <>
                        <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                    </>
                )}
                <Tooltip />
                <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const GraficoLinea: React.FC<{ datos: PuntoEstadistica[]; color?: string }> = ({ datos, color = "#059669" }) => {
    if (!datos || datos.length === 0) return <SinDatos />;
    return (
        <ResponsiveContainer>
            <LineChart data={datos} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

const GraficoTorta: React.FC<{ datos: PuntoEstadistica[] }> = ({ datos }) => {
    if (!datos || datos.length === 0) return <SinDatos />;
    return (
        <ResponsiveContainer>
            <PieChart>
                <Pie data={datos} dataKey="valor" nameKey="etiqueta" cx="50%" cy="50%" outerRadius={85} label={(d: any) => `${d.etiqueta}: ${d.valor}`}>
                    {datos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

type Pestania = "asistencia" | "insumos" | "viaticos" | "relevamientos";

const EstadisticasComponent: React.FC = () => {
    const puedeVer = tienePermiso("VER_ESTADISTICAS");
    const [pestania, setPestania] = useState<Pestania>("asistencia");

    const hoy = new Date().toISOString().split("T")[0];
    const hace6Meses = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split("T")[0];
    const [desde, setDesde] = useState(hace6Meses);
    const [hasta, setHasta] = useState(hoy);

    const [datos, setDatos] = useState<Record<string, any>>({});
    const [cargando, setCargando] = useState(false);

    const cargarDatos = async (p: Pestania) => {
        setCargando(true);
        try {
            const res = await api.get(`/estadisticas/${p}?desde=${desde}&hasta=${hasta}`, obtenerHeaders());
            setDatos((prev) => ({ ...prev, [p]: res.data }));
        } catch (err) {
            console.error(`Error al cargar estadísticas de ${p}`, err);
            setDatos((prev) => ({ ...prev, [p]: null }));
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (!puedeVer) return;
        cargarDatos(pestania);

    }, [pestania]);

    if (!puedeVer) {
        return (
            <div className="insumos-container">
                <div className="insumos-card">
                    <p className="txt-vacio">No tenés permiso para ver las estadísticas.</p>
                </div>
            </div>
        );
    }

    const d = datos[pestania];

    return (
        <div className="insumos-container">
            <div className="insumos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <BarChart3 size={24} color="#059669" /> ESTADÍSTICAS DEL SISTEMA
                </h1>

                <div className="insumos-tabs">
                    <button className={`insumos-tab ${pestania === "asistencia" ? "activo" : ""}`} onClick={() => setPestania("asistencia")}>
                        <Users size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Asistencia
                    </button>
                    <button className={`insumos-tab ${pestania === "insumos" ? "activo" : ""}`} onClick={() => setPestania("insumos")}>
                        <Package size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Insumos
                    </button>
                    <button className={`insumos-tab ${pestania === "viaticos" ? "activo" : ""}`} onClick={() => setPestania("viaticos")}>
                        <Fuel size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Viáticos
                    </button>
                    <button className={`insumos-tab ${pestania === "relevamientos" ? "activo" : ""}`} onClick={() => setPestania("relevamientos")}>
                        <ClipboardList size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Relevamientos
                    </button>
                </div>

                <div className="insumos-form-grid" style={{ marginBottom: "10px" }}>
                    <div className="form-section">
                        <label>Desde</label>
                        <input type="date" className="form-input" value={desde} onChange={(e) => setDesde(e.target.value)} />
                    </div>
                    <div className="form-section">
                        <label>Hasta</label>
                        <input type="date" className="form-input" value={hasta} onChange={(e) => setHasta(e.target.value)} />
                    </div>
                    <div className="form-section" style={{ justifyContent: "flex-end" }}>
                        <button className="btn-primario" onClick={() => cargarDatos(pestania)} disabled={cargando}>
                            {cargando ? "Cargando..." : "Actualizar"}
                        </button>
                    </div>
                </div>
            </div>

            {pestania === "asistencia" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    <TarjetaGrafico titulo="Fichajes por día"><GraficoLinea datos={d?.fichajesPorDia} /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Horas trabajadas por técnico"><GraficoBarras datos={d?.horasPorTecnico} vertical color="#0d9488" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Fichajes offline vs online"><GraficoTorta datos={d?.offlineVsOnline} /></TarjetaGrafico>
                </div>
            )}

            {pestania === "insumos" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    <TarjetaGrafico titulo="Stock actual por categoría"><GraficoBarras datos={d?.stockPorCategoria} color="#2563eb" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Insumos más entregados"><GraficoBarras datos={d?.consumoPorInsumo} vertical color="#f59e0b" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Consumo por mes"><GraficoLinea datos={d?.consumoPorMes} color="#7c3aed" /></TarjetaGrafico>
                    <div className="insumos-card" style={{ padding: "16px" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "#dc2626", margin: "0 0 12px 0", fontWeight: 700 }}>Insumos bajo stock mínimo</h3>
                        {d?.bajoStockMinimo?.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                {d.bajoStockMinimo.map((i: PuntoEstadistica) => (
                                    <li key={i.etiqueta} className="stock-bajo">{i.etiqueta}: {i.valor} unidades</li>
                                ))}
                            </ul>
                        ) : <p className="txt-vacio">Ningún insumo está bajo el mínimo. 👍</p>}
                    </div>
                </div>
            )}

            {pestania === "viaticos" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    <TarjetaGrafico titulo="Gasto en viáticos por mes"><GraficoLinea datos={d?.montoPorMes} color="#059669" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Gasto por técnico"><GraficoBarras datos={d?.montoPorTecnico} vertical color="#0d9488" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Viáticos por estado"><GraficoTorta datos={d?.porEstado} /></TarjetaGrafico>
                </div>
            )}

            {pestania === "relevamientos" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                    <TarjetaGrafico titulo="Hallazgos: encontrados vs resueltos"><GraficoTorta datos={d?.hallazgosPorEstado} /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Hallazgos por tipo de riesgo"><GraficoBarras datos={d?.hallazgosPorTipoRiesgo} vertical color="#dc2626" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Hallazgos encontrados por mes"><GraficoLinea datos={d?.encontradosPorMes} color="#f59e0b" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Hallazgos resueltos por mes"><GraficoLinea datos={d?.resueltosPorMes} color="#059669" /></TarjetaGrafico>
                    <TarjetaGrafico titulo="Relevamientos por empresa"><GraficoBarras datos={d?.relevamientosPorEmpresa} color="#2563eb" /></TarjetaGrafico>
                </div>
            )}
        </div>
    );
};

export default EstadisticasComponent;
