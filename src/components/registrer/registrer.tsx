import React, { useState } from "react";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import "./registrer.css";
import type { Usuario } from "../../interfaces/Usuario";

const Register: React.FC = () => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [claveAcceso, setClaveAcceso] = useState("");
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

            const { token, rol, permisos } = response.data || {};
            const esClaveAdmin = claveAcceso.trim() === "000010001";

            if (esClaveAdmin) {
                // 🚀 Es Admin: Guardamos la sesión y forzamos refresco directo
                if (token) {
                    localStorage.setItem("token", token);
                    localStorage.setItem("email", email);

                    // 🌟 FORZAMOS "ADMINISTRADOR" EN MAYÚSCULAS PARA EL AUTHHELPER
                    localStorage.setItem("usuario", JSON.stringify({
                        username: email,
                        rol: "ADMINISTRADOR",
                        permisos: permisos || []
                    }));
                }

                alert("¡Cuenta de Administrador registrada y activada con éxito!");
                // Reemplazamos navigate por window.location.href para asegurar un refresco limpio de la app
                window.location.href = "/home";
            } else {
                // ⏳ Es Empleado / Estándar: Va al Login a esperar activación
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
                <h1>CREAR CUENTA NUEVA</h1>

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

                <div className="form-section">
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        className="form-input"
                        id="contrasena"
                        placeholder="Crea una contraseña segura (mín 6 chars)"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
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

                <button type="submit" className="form-button">
                    REGISTRARSE
                </button>

                {error && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{error}</p>}
            </form>

            <section>
                <p>¿Ya tienes una cuenta?</p>
                <button
                    type="button"
                    className="login-button"
                    onClick={() => navigate("/login")}
                >
                    INICIAR SESIÓN
                </button>
            </section>
        </div>
    );
};

export default Register;