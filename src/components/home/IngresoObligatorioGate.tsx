import React, { useState, useEffect } from "react";
import { LogIn, MapPin, RefreshCw, AlertTriangle } from "lucide-react";
import api from "../../service/api";
import { obtenerUbicacionValidada } from "../../service/geolocalizacion";

interface Props {
    darkMode?: boolean;
}

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const IngresoObligatorioGate: React.FC<Props> = ({ darkMode = false }) => {
    const [cargandoEstado, setCargandoEstado] = useState(true);
    const [necesitaIngreso, setNecesitaIngreso] = useState(false);
    const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false);
    const [marcando, setMarcando] = useState(false);
    const [error, setError] = useState("");
    const [empresas, setEmpresas] = useState<any[]>([]);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");

    const email = localStorage.getItem("email") || "";

    useEffect(() => {
        let activo = true;

        api.get("/asistencia/estado", obtenerHeaders())
            .then((res) => { if (activo) setNecesitaIngreso(!res.data); })
            .catch(() => { if (activo) setNecesitaIngreso(false); })
            .finally(() => { if (activo) setCargandoEstado(false); });

        api.get("/empresas", obtenerHeaders())
            .then((res) => { if (activo) setEmpresas(Array.isArray(res.data) ? res.data : []); })
            .catch(() => {});

        return () => { activo = false; };
    }, []);

    const handleMarcarIngreso = async () => {
        setError("");
        setObteniendoUbicacion(true);

        let latitud: number, longitud: number;
        try {
            const ubicacion = await obtenerUbicacionValidada();
            latitud = ubicacion.latitud;
            longitud = ubicacion.longitud;
        } catch (err: any) {
            setObteniendoUbicacion(false);
            setError(err.message || "No se pudo obtener tu ubicación.");
            return;
        }
        setObteniendoUbicacion(false);
        setMarcando(true);

        try {
            const loginLatitud = localStorage.getItem("loginLat");
            const loginLongitud = localStorage.getItem("loginLng");
            await api.post("/asistencia/ingreso", {
                emailUsuario: email,
                latitud,
                longitud,
                idEmpresa: idEmpresa || null,
                loginLatitud,
                loginLongitud
            }, obtenerHeaders());
            setNecesitaIngreso(false);
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar el ingreso. Volvé a intentar.");
        } finally {
            setMarcando(false);
        }
    };

    if (cargandoEstado || !necesitaIngreso) return null;

    const c = {
        fondo: darkMode ? "#0B132B" : "#064E3B",
        tarjeta: darkMode ? "#161B22" : "#FFFFFF",
        texto: darkMode ? "#F0F6FC" : "#0F172A",
        textoSec: darkMode ? "#8B949E" : "#64748B",
        borde: darkMode ? "#30363D" : "#CBD5E1",
        inputBg: darkMode ? "#0D1117" : "#FFFFFF"
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, backgroundColor: c.fondo, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}>
            <div style={{ backgroundColor: c.tarjeta, borderRadius: "16px", padding: "32px 26px", maxWidth: "420px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.4)", textAlign: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <LogIn size={32} color="#059669" />
                </div>
                <h2 style={{ margin: "0 0 8px 0", color: c.texto, fontSize: "1.25rem" }}>Marcá tu ingreso para empezar</h2>
                <p style={{ color: c.textoSec, fontSize: "0.87rem", lineHeight: 1.55, margin: "0 0 20px 0" }}>
                    Antes de continuar necesitamos registrar el inicio de tu jornada con tu ubicación real. Esto habilita el cálculo automático de horas trabajadas y viáticos por kilómetro.
                </p>

                {empresas.length > 0 && (
                    <div style={{ textAlign: "left", marginBottom: "16px" }}>
                        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: c.textoSec, display: "block", marginBottom: "6px" }}>
                            ¿Vas a visitar alguna empresa hoy? (opcional)
                        </label>
                        <select
                            value={idEmpresa}
                            onChange={(e) => setIdEmpresa(e.target.value ? Number(e.target.value) : "")}
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${c.borde}`, backgroundColor: c.inputBg, color: c.texto, fontSize: "0.85rem", boxSizing: "border-box" }}
                        >
                            <option value="">No, trabajo desde la oficina/casa</option>
                            {empresas.map((emp: any) => (
                                <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                {error && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", textAlign: "left" }}>
                        <AlertTriangle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span style={{ fontSize: "0.78rem", color: "#991B1B" }}>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleMarcarIngreso}
                    disabled={obteniendoUbicacion || marcando}
                    style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        backgroundColor: "#059669", color: "#FFFFFF", border: "none", borderRadius: "10px", padding: "14px",
                        fontSize: "0.95rem", fontWeight: 700, cursor: obteniendoUbicacion || marcando ? "wait" : "pointer",
                        opacity: obteniendoUbicacion || marcando ? 0.8 : 1
                    }}
                >
                    {obteniendoUbicacion ? (
                        <><MapPin size={20} /> Obteniendo tu ubicación...</>
                    ) : marcando ? (
                        <><RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} /> Registrando ingreso...</>
                    ) : (
                        <><MapPin size={20} /> Marcar Ingreso y Continuar</>
                    )}
                </button>

                <p style={{ fontSize: "0.7rem", color: c.textoSec, marginTop: "14px" }}>
                    Te vamos a pedir permiso de ubicación del navegador. Es obligatorio para trabajar con coordenadas reales.
                </p>
            </div>
        </div>
    );
};

export default IngresoObligatorioGate;
