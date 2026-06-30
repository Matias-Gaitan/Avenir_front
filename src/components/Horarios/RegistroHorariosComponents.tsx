import React, { useState, useEffect } from "react";
import axios from "axios";
import "./horarios.css";
import "../empresa/empresa.css"; // Reutilizamos estilos base
import type { Empresa } from "../../interfaces/Empresa";
import type { RegistroHora, RegistroHoraPayload } from "../../interfaces/RegistroHora";

const RegistroHorarioComponent: React.FC = () => {
    // Estados para el Formulario (POST)
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fechaRegistro, setFechaRegistro] = useState(new Date().toISOString().split('T')[0]);
    const [horasDedicadas, setHorasDedicadas] = useState<number | "">("");
    const [tareasRealizadas, setTareasRealizadas] = useState("");

    // Estados para el Calendario (GET)
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [registros, setRegistros] = useState<RegistroHora[]>([]);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const token = localStorage.getItem("token");
    const idUsuarioStorage = localStorage.getItem("idUsuario"); // Asegurate de guardar el idUsuario al hacer Login
    const headers = { Authorization: `Bearer ${token}` };

    // Cargar empresas activas para el select
    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/empresas", { headers });
                // Filtramos solo las activas para cargar horas
                setEmpresas(response.data.filter((e: Empresa) => e.activo));
            } catch (err) {
                console.error("Error al cargar empresas", err);
            }
        };
        fetchEmpresas();
        buscarRegistros(fechaFiltro);
    }, []);

    // Buscar registros por fecha (El molde del calendario)
    const buscarRegistros = async (fecha: string) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/horas/calendario?fecha=${fecha}`, { headers });
            setRegistros(response.data);
            setError("");
        } catch (err: any) {
            setError("Error al obtener los registros del día.");
        }
    };

    const handleFiltrar = () => {
        buscarRegistros(fechaFiltro);
    };

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            setMensaje("");

            const emailUsuario = localStorage.getItem("email"); // Recuperamos el email

            if (!emailUsuario) {
                setError("Error de sesión: vuelva a iniciar sesión.");
                return;
            }

            // Enviamos emailUsuario en lugar de idUsuario
            const payload = {
                idEmpresa: Number(idEmpresa),
                emailUsuario: emailUsuario,
                fecha: fechaRegistro,
                horasDedicadas: Number(horasDedicadas),
                tareasRealizadas: tareasRealizadas
            };

            try {
                await axios.post("http://localhost:8080/api/horas/registrar", payload, { headers });
                setMensaje("Horas registradas exitosamente");
                setHorasDedicadas("");
                setTareasRealizadas("");

                if (fechaRegistro === fechaFiltro) {
                    buscarRegistros(fechaFiltro);
                }
            } catch (err: any) {
                setError("Error al guardar: " + (err.response?.data || "Verifique los datos"));
            }
        };

    return (
        <div className="horario-container">

            {/* SECCIÓN 1: FORMULARIO DE REGISTRO */}
            <div className="form-component">
                <div className="form-tittle">
                    <h1>REGISTRAR HORAS DE TRABAJO</h1>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <label htmlFor="idEmpresa">Empresa Auditada</label>
                        <select
                            className="form-input"
                            id="idEmpresa"
                            value={idEmpresa}
                            onChange={(e) => setIdEmpresa(e.target.value as unknown as number)}
                            required
                        >
                            <option value="" disabled>Seleccione una empresa</option>
                            {empresas.map(emp => (
                                <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-section">
                        <label htmlFor="fechaRegistro">Fecha</label>
                        <input
                            type="date"
                            className="form-input"
                            id="fechaRegistro"
                            value={fechaRegistro}
                            onChange={(e) => setFechaRegistro(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="horas">Cantidad de Horas</label>
                        <input
                            type="number"
                            step="0.5"
                            className="form-input"
                            id="horas"
                            value={horasDedicadas}
                            onChange={(e) => setHorasDedicadas(e.target.value as unknown as number)}
                            required
                        />
                    </div>

                    <div className="form-section">
                        <label htmlFor="tareas">Tareas Realizadas</label>
                        <textarea
                            className="form-input"
                            id="tareas"
                            rows={3}
                            value={tareasRealizadas}
                            onChange={(e) => setTareasRealizadas(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="form-button">GUARDAR REGISTRO</button>

                    {error && <p style={{ color: "#DC2626", marginTop: "10px" }}>{error}</p>}
                    {mensaje && <p style={{ color: "#22C55E", marginTop: "10px" }}>{mensaje}</p>}
                </form>
            </div>

            {/* SECCIÓN 2: CALENDARIO / VISOR DE REGISTROS DIARIOS */}
            <div className="form-component">
                <div className="form-tittle">
                    <h1>CALENDARIO DIARIO DE HORAS</h1>
                </div>

                <div className="filtros-section">
                    <label style={{ fontWeight: "bold", color: "#064E3B" }}>Ver registros del día: </label>
                    <input
                        type="date"
                        value={fechaFiltro}
                        onChange={(e) => setFechaFiltro(e.target.value)}
                    />
                    <button onClick={handleFiltrar}>Buscar</button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Técnico</th>
                            <th>Empresa</th>
                            <th>Horas</th>
                            <th>Tareas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length > 0 ? (
                            registros.map((reg) => (
                                <tr key={reg.idRegistro}>
                                    <td>{reg.usuario.nombre} {reg.usuario.apellido}</td>
                                    <td>{reg.empresa.nombre}</td>
                                    <td>{reg.horasDedicadas} hs</td>
                                    <td>{reg.tareasRealizadas}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center" }}>No hay registros en esta fecha.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default RegistroHorarioComponent;