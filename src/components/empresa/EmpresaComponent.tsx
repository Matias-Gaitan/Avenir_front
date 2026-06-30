import React, { useState, useEffect } from "react";
import axios from "axios";
import "./empresa.css";
import type { Empresa } from "../../interfaces/Empresa";

const EmpresaComponent: React.FC = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [cuit, setCuit] = useState("");
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const cargarEmpresas = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/empresas", { headers });
            setEmpresas(response.data);
        } catch (err: any) {
            setError("Error al cargar empresas");
        }
    };

    useEffect(() => {
        cargarEmpresas();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMensaje("");

        const nuevaEmpresa: Empresa = { cuit, nombre, direccion, activo: true };

        try {
            await axios.post("http://localhost:8080/api/empresas", nuevaEmpresa, { headers });
            setMensaje("Empresa registrada exitosamente");
            setCuit("");
            setNombre("");
            setDireccion("");
            cargarEmpresas(); // Recargar la tabla
        } catch (err: any) {
            setError(err.response?.data || "Error al registrar la empresa");
        }
    };

    const handleBaja = async (id: number | undefined) => {
        if (!id) return;
        try {
            await axios.patch(`http://localhost:8080/api/empresas/${id}/baja`, {}, { headers });
            cargarEmpresas();
        } catch (err: any) {
            setError("Error al dar de baja");
        }
    };

    return (
        <div className="form-component">
            <div className="form-tittle">
                <h1>GESTIÓN DE EMPRESAS</h1>
            </div>

            <form className="form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <label htmlFor="cuit">CUIT</label>
                    <input
                        type="text"
                        className="form-input"
                        id="cuit"
                        value={cuit}
                        onChange={(e) => setCuit(e.target.value)}
                        required
                    />
                </div>
                <div className="form-section">
                    <label htmlFor="nombre">Razón Social / Nombre</label>
                    <input
                        type="text"
                        className="form-input"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                </div>
                <div className="form-section">
                    <label htmlFor="direccion">Dirección</label>
                    <input
                        type="text"
                        className="form-input"
                        id="direccion"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="form-button">REGISTRAR EMPRESA</button>

                {error && <p style={{ color: "#DC2626", marginTop: "10px" }}>{error}</p>}
                {mensaje && <p style={{ color: "#22C55E", marginTop: "10px" }}>{mensaje}</p>}
            </form>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>CUIT</th>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((emp) => (
                        <tr key={emp.idEmpresa}>
                            <td>{emp.cuit}</td>
                            <td>{emp.nombre}</td>
                            <td>{emp.direccion}</td>
                            <td style={{ color: emp.activo ? "#22C55E" : "#DC2626", fontWeight: "bold" }}>
                                {emp.activo ? "Activo" : "Inactivo"}
                            </td>
                            <td>
                                {emp.activo && (
                                    <button className="btn-baja" onClick={() => handleBaja(emp.idEmpresa)}>
                                        Dar de baja
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmpresaComponent;