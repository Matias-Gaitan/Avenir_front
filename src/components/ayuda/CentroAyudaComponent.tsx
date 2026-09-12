import React, { useState, useMemo } from "react";
import { LifeBuoy, Search, ChevronDown, ChevronUp } from "lucide-react";
import { articulosAyuda } from "./contenidoAyuda";

interface Props {
    darkMode?: boolean;
}

const CentroAyudaComponent: React.FC<Props> = ({ darkMode = false }) => {
    const [busqueda, setBusqueda] = useState("");
    const [moduloAbierto, setModuloAbierto] = useState<string | null>(null);
    const [expandido, setExpandido] = useState<Set<number>>(new Set());

    const c = {
        bgSuave: darkMode ? "#0D1117" : "#F8FAFC",
        bgTarjeta: darkMode ? "#161B22" : "#FFFFFF",
        borde: darkMode ? "#30363D" : "#E2E8F0",
        texto: darkMode ? "#F0F6FC" : "#0F172A",
        textoSecundario: darkMode ? "#8B949E" : "#64748B",
    };

    const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    const articulosFiltrados = useMemo(() => {
        const q = normalizar(busqueda.trim());
        if (!q) return articulosAyuda;
        return articulosAyuda.filter((a) =>
            normalizar(a.modulo).includes(q) ||
            normalizar(a.titulo).includes(q) ||
            a.pasos.some((p) => normalizar(p).includes(q))
        );
    }, [busqueda]);

    const modulos = useMemo(() => {
        const orden: string[] = [];
        articulosFiltrados.forEach((a) => { if (!orden.includes(a.modulo)) orden.push(a.modulo); });
        return orden;
    }, [articulosFiltrados]);

    const toggleArticulo = (idx: number) => {
        setExpandido((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    return (
        <div className="roles-card">
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <LifeBuoy size={22} color="#059669" /> Centro de Ayuda
            </h2>
            <p style={{ color: c.textoSecundario, fontSize: "0.85rem", margin: "0 0 16px 0" }}>
                Instructivos cortos de cómo cargar datos en cada módulo del sistema. Buscá por
                palabra clave o navegá por módulo.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: c.bgSuave, border: `1px solid ${c.borde}`, borderRadius: "8px", padding: "0 12px", marginBottom: "20px" }}>
                <Search size={16} color="#94A3B8" />
                <input
                    type="text"
                    placeholder="Ej. viáticos, tareas, checklist, permisos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "100%", padding: "10px", backgroundColor: "transparent", border: "none", color: c.texto, outline: "none", fontSize: "0.9rem" }}
                />
            </div>

            {articulosFiltrados.length === 0 && (
                <p style={{ color: c.textoSecundario, fontSize: "0.9rem" }}>No encontramos nada para "{busqueda}". Probá con otra palabra.</p>
            )}

            {modulos.map((modulo) => {
                const items = articulosFiltrados.filter((a) => a.modulo === modulo);
                const estaAbierto = busqueda.trim() !== "" || moduloAbierto === modulo;
                return (
                    <div key={modulo} style={{ marginBottom: "10px", border: `1px solid ${c.borde}`, borderRadius: "10px", overflow: "hidden" }}>
                        <button
                            type="button"
                            onClick={() => setModuloAbierto((m) => (m === modulo ? null : modulo))}
                            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: c.bgSuave, border: "none", cursor: "pointer", color: c.texto, fontWeight: 700, fontSize: "0.9rem" }}
                        >
                            {modulo} <span style={{ fontWeight: 400, color: c.textoSecundario, fontSize: "0.78rem" }}>({items.length})</span>
                            {estaAbierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {estaAbierto && (
                            <div style={{ padding: "10px 16px 16px" }}>
                                {items.map((a, i) => {
                                    const idx = articulosAyuda.indexOf(a);
                                    const abierto = expandido.has(idx);
                                    return (
                                        <div key={idx} style={{ marginTop: i === 0 ? 0 : "10px", backgroundColor: c.bgTarjeta, border: `1px solid ${c.borde}`, borderRadius: "8px", padding: "12px 14px" }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleArticulo(idx)}
                                                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: c.texto, fontWeight: 600, fontSize: "0.87rem", textAlign: "left" }}
                                            >
                                                {a.titulo}
                                                {abierto ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                            {abierto && (
                                                <ol style={{ margin: "10px 0 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                                    {a.pasos.map((paso, pIdx) => (
                                                        <li key={pIdx} style={{ fontSize: "0.85rem", color: c.textoSecundario, lineHeight: 1.5 }}>{paso}</li>
                                                    ))}
                                                </ol>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CentroAyudaComponent;
