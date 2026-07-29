import React, { useState } from "react";
import api from "../../service/api";
import { useNavigate } from "react-router-dom";
import "./login.css";
import type { Login } from "../../interfaces/Login";

const LoginComponent: React.FC = () => {
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
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
            // 🛑 Limpiamos la sesión anterior
            localStorage.clear();

            const response = await api.post("/usuarios/login", loginData);

            if (response.status === 200 && response.data.token) {
                const token = response.data.token;
                const rolBackend = response.data.rol ? String(response.data.rol).trim().toUpperCase() : "";

                // Guardamos la información limpia en el localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("email", loginData.email);
                localStorage.setItem("usuario", JSON.stringify({
                    username: response.data.username || loginData.email,
                    rol: rolBackend,
                    permisos: response.data.permisos || []
                }));

                // 🚀 Refresco total de la app para sincronizar permisos y componentes
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
                <div className="form-tittle">
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

                <div className="form-section">
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        className="form-input"
                        id="contrasena"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="form-button">
                    INGRESAR
                </button>

                {error && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>{error}</p>}
            </form>

            <section>
                <p>¿No tienes una cuenta?</p>
                <button
                    type="button"
                    className="registrer-button"
                    onClick={() => navigate("/register")}
                >
                    REGISTRARSE
                </button>
            </section>
        </div>
    );
};

export default LoginComponent;