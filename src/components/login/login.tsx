import React, { useState } from "react";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, LogIn, UserPlus, Eye, EyeOff, Hash, Type } from "lucide-react";
import "./login.css";
import type { Login } from "../../interfaces/Login";

const LoginComponent: React.FC = () => {
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validarEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validarEmail(email)) {
            setError("El email no es válido");
            return;
        }

        const loginData: Login = { email, contrasena };

        try {
            localStorage.clear();

            const response = await api.post("/usuarios/login", loginData);

            if (response.status === 200 && response.data.token) {
                const token = response.data.token;
                const rolBackend = response.data.rol ? String(response.data.rol).trim().toUpperCase() : "";

                localStorage.setItem("token", token);
                localStorage.setItem("email", loginData.email);
                localStorage.setItem("rolOriginal", rolBackend);
                localStorage.setItem("usuario", JSON.stringify({
                    username: response.data.username || loginData.email,
                    nombre: response.data.nombre || response.data.usuario?.nombre || "",
                    apellido: response.data.apellido || response.data.usuario?.apellido || "",
                    rol: rolBackend,
                    permisos: response.data.permisos || []
                }));

                window.location.href = "/home";
            } else {
                setError("Credenciales inválidas o cuenta no aprobada.");
            }
        } catch (err: any) {
            console.error("Error en login:", err.response);
            const msgError = err.response?.data?.mensaje || err.response?.data || "Verifique sus credenciales o estado de cuenta.";
            setError("Error al iniciar sesión: " + msgError);
        }
    };

    return (
        <div className="form-component">
            <form className="form" onSubmit={handleSubmit}>
                <div className="form-tittle" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <ShieldCheck size={42} color="#059669" className="icon-pulse" style={{ marginBottom: "10px" }} />
                    <h1>INICIO DE SESIÓN</h1>
                    <p>Ingrese sus credenciales para continuar</p>
                </div>

                <div className="form-section">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        className="form-input input-email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-section" style={{ position: "relative" }}>
                    <label htmlFor="contrasena">Contraseña</label>

                    <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                        <input
                            type={mostrarPassword ? "text" : "password"}
                            className="form-input"
                            id="contrasena"
                            placeholder="Ingrese su contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            style={{ paddingRight: "45px", width: "100%", boxSizing: "border-box" }}
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setMostrarPassword(!mostrarPassword)}
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#64748b",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "4px",
                                zIndex: 10
                            }}
                            title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* 🌟 MATRIZ GUÍA DE TIPEO POR PATRÓN DE CARÁCTER */}
                    {contrasena.length > 0 && (
                        <div style={{
                            marginTop: "8px",
                            padding: "10px 12px",
                            backgroundColor: "#0B132B",
                            borderRadius: "8px",
                            border: "1px solid #1E293B",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                                {contrasena.split("").map((char, index) => {
                                    const esNumero = /\d/.test(char);
                                    const esMayus = /[A-Z]/.test(char);

                                    return (
                                        <div
                                            key={index}
                                            className="char-badge-anim"
                                            title={`Posición ${index + 1}: ${esMayus ? 'Mayúscula' : esNumero ? 'Número' : 'Minúscula/Símbolo'}`}
                                            style={{
                                                width: "28px",
                                                height: "30px",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.75rem",
                                                fontWeight: "bold",
                                                backgroundColor: esMayus ? "rgba(16, 185, 129, 0.2)" : esNumero ? "rgba(37, 99, 235, 0.2)" : "#1E293B",
                                                color: esMayus ? "#34D399" : esNumero ? "#60A5FA" : "#94A3B8",
                                                border: `1px solid ${esMayus ? "#10B981" : esNumero ? "#2563EB" : "#334155"}`
                                            }}
                                        >
                                            {esMayus ? <Type size={13} /> : esNumero ? <Hash size={13} /> : "•"}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "#64748B", borderTop: "1px solid #1E293B", paddingTop: "6px" }}>
                                <span>Guía de patrón (Mayús / Núm / Letra)</span>
                                <span>{contrasena.length} chars</span>
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className="form-button btn-interactive" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "15px" }}>
                    <LogIn size={18} /> INGRESAR
                </button>

                {error && <p style={{ color: "#dc2626", marginTop: "10px", textAlign: "center", fontSize: "0.875rem" }}>{error}</p>}
            </form>

            <section>
                <p>¿No tienes una cuenta?</p>
                <button
                    type="button"
                    className="registrer-button btn-interactive"
                    onClick={() => navigate("/register")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                    <UserPlus size={16} /> REGISTRARSE
                </button>
            </section>
        </div>
    );
};

export default LoginComponent;