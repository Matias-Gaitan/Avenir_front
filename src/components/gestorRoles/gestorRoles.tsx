import React, { useState, useEffect } from "react";
import api from "../../service/api";
import "./gestorRoles.css";

interface Rol {
    idTipoPersona?: number;
    nombre: string;
}

const GestorRoles: React.FC = () => {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [nuevoRol, setNuevoRol] = useState("");

    const cargarRoles = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await api.get("/roles", { headers });
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error al cargar roles:", err);
        }
    };

    useEffect(() => {
        cargarRoles();
    }, []);

    const handleCrearRol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nuevoRol.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await api.post("/roles", { nombre: nuevoRol }, { headers });
            setNuevoRol("");
            cargarRoles();
        } catch (err) {
            console.error("Error al crear rol:", err);
        }
    };

    return (
        <div className="roles-card">
            <h2>Gestor de Roles</h2>

            <form onSubmit={handleCrearRol} className="form-rol">
                <input
                    type="text"
                    placeholder="Nombre del nuevo rol (ej: Gerente)"
                    value={nuevoRol}
                    onChange={(e) => setNuevoRol(e.target.value)}
                />
                <button type="submit" className="btn-agregar-rol">Agregar Rol</button>
            </form>

            {/* 🚀 DIV RESPONSIVO AGREGADO */}
            <div className="table-responsive">
                <table className="gestor-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre del Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((rol) => (
                            <tr key={rol.idTipoPersona}>
                                <td>{rol.idTipoPersona}</td>
                                <td>{rol.nombre}</td>
                                <td>
                                    <div className="acciones-group">
                                        <button className="btn-editar">Editar</button>
                                        <button className="btn-eliminar">Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GestorRoles;