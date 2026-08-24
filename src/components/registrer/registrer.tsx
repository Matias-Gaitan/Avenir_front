import React, { useState } from "react";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import { UserPlus, LogIn, Eye, EyeOff } from "lucide-react";
import "./registrer.css";
import type { Usuario } from "../../interfaces/Usuario";
import { PasswordMatrix } from "../PasswordMatrix";

const Register: React.FC = () => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [claveAcceso, setClaveAcceso] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validarEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validarPassword = (password: string) => {
        return password.length >= 6;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validarEmail(email)) {
            setError("El email no es válido");
            return;
        }
        if (!validarPassword(contrasena)) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        const nuevoUsuario: Usuario = {
            nombre,
            apellido,
            email,
            contrasena
        };

        try {
            const response = await api.post("/usuarios", {
                usuario: nuevoUsuario,
                claveAcceso: claveAcceso.trim()
            });

            const { token, permisos } = response.data || {};
            const esClaveAdmin = claveAcceso.trim() === "000010001";

            if (esClaveAdmin) {
                if (token) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("email", email);

                    localStorage.setItem("usuario", JSON.stringify({
                        username: email,
                        rol: "ADMINISTRADOR",
                        permisos: permisos || []
                    }));
                }

                alert("¡Cuenta de Administrador registrada y activada con éxito!");
                window.location.href = "/home";
            } else {
                alert("¡Registro exitoso! Su cuenta ha sido creada. Un Administrador le asignará su Rol y activará su acceso.");
                navigate("/login");
            }

        } catch (err: any) {
            console.error("Error recibido del backend:", err.response?.data);

            const mensajeError =
                typeof err.response?.data === "string"
                    ? err.response.data
                    : err.response?.data?.mensaje || err.response?.data?.message || "Verifique los datos ingresados";

            setError("Error al registrarse: " + mensajeError);
        }
    };

    return (
        <div className="form-component">
            <form className="form" onSubmit={handleSubmit}>
                <h1 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <UserPlus size={26} color="#059669" /> CREAR CUENTA NUEVA
                </h1>

                <div className="form-nombres">
                    <div className="nombre">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            className="form-input"
                            id="nombre"
                            placeholder="Ej. Juan"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="apellido">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            type="text"
                            className="form-input"
                            id="apellido"
                            placeholder="Ej. Perez"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        className="form-input input-email"
                        id="email"
                        placeholder="Ej. juan@gmail.com"
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
                            placeholder="Mínimo 6 caracteres"
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

                    {/* 🌟 Matriz de Tipeo Animada e Interactiva */}
                    <PasswordMatrix contrasena={contrasena} />
                </div>

                <div className="form-section">
                    <label htmlFor="clave-acceso">
                        Clave de Acceso <span style={{ fontSize: "0.8rem", color: "#64748b" }}>(Opcional - Solo Administradores)</span>
                    </label>
                    <input
                        type="password"
                        className="form-input"
                        id="clave-acceso"
                        placeholder="Dejar en blanco si es usuario estándar"
                        value={claveAcceso}
                        onChange={(e) => setClaveAcceso(e.target.value)}
                    />
                </div>

                <button type="submit" className="form-button btn-interactive" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "15px" }}>
                    <UserPlus size={18} /> REGISTRARSE
                </button>

                {error && <p style={{ color: "#dc2626", marginTop: "10px", textAlign: "center", fontSize: "0.875rem" }}>{error}</p>}
            </form>

            <section>
                <p>¿Ya tienes una cuenta?</p>
                <button
                    type="button"
                    className="login-button btn-interactive"
                    onClick={() => navigate("/login")}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                    <LogIn size={16} /> INICIAR SESIÓN
                </button>
            </section>
        </div>
    );
};

export default Register;