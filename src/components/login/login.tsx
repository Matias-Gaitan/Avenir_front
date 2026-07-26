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

        if (!validarEmail(email)) {
            setError("El email no es válido");
            return;
        }

        const loginData: Login = { email, contrasena };

        try {
            const response = await api.post("/usuarios/login", loginData);

            if(response.data.mensaje !== "Credenciales inválidas"){
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("email", loginData.email);
                navigate("/home");
            }
        } catch (err: any) {
            setError("Error al iniciar sesión: " + (err.response?.data || "Verifique sus credenciales"));
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
                    />
                </div>

                <button type="submit" className="form-button">
                    INGRESAR
                </button>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>

            <section>
                <p>¿No tienes una cuenta?</p>
                <button
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