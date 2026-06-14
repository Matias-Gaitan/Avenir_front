// src/components/register/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./registrer.css";
import type { Usuario } from "../../interfaces/Usuario";

const Register: React.FC = () => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [claveAcceso, setClaveAcceso] = useState(""); // ⚠️ Campo independiente, no forma parte de Usuario
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
    };

    const validarPassword = (password: string) => {
        return password.length >= 8;
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarEmail(email)) {
        setError("El email no es válido");
        return;
    }
    if (!validarPassword(contrasena)) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
    }
    if (!claveAcceso) {
        setError("La clave de acceso es obligatoria");
        return;
    }

    // Construimos el objeto respetando lo que espera tu Backend
            const nuevoUsuario: Usuario = {
                nombre,
                apellido,
                email,
                contrasena,
                activo: true,
                tipoPersona: {
                    idTipoPersona: 1 // Le mandamos directo el ID del rol Administrador
                }
            };

    try {
        console.log("Payload enviado:", { usuario: nuevoUsuario, claveAcceso });
        const response = await axios.post("http://localhost:8080/api/usuarios", {
        usuario: nuevoUsuario,
        claveAcceso, // se envía aparte para verificación en backend
        });
        console.log("Usuario registrado:", response.data);
    
      // Código para tokens (comentado hasta que el backend lo implemente)
        /*
        localStorage.setItem("token", response.data.token);
      */
        navigate("/login");
    } catch (err: any) {
        console.error("Error recibido del backend:", err.response?.data);

    const mensajeError =
    typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data.message || "Error desconocido";

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
                    placeholder="Ej.Juan"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>
            <div className="apellido">
                <label htmlFor="apellido">Apellido</label>
                <input
                    type="text"
                    className="form-input"
                    id="apellido"
                    placeholder="Ej.Perez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                />
            </div>
        </div>

        <div className="form-section">
            <label htmlFor="email">Email</label>
            <input
            type="email"
            className="form-input input-email"
            id="email"
            placeholder="Ej.juan@gmail.com"
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
            placeholder="Crea una contraseña segura"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            />
        </div>

        <div className="form-section">
            <label htmlFor="clave-acceso">Clave de acceso</label>
            <input
            type="password"
            className="form-input"
            id="clave-acceso"
            value={claveAcceso}
            onChange={(e) => setClaveAcceso(e.target.value)}
            />
        </div>

        <button type="submit" className="form-button">
            REGISTRARSE
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        <section>
        <p>¿Ya tienes una cuenta?</p>
        <button
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
