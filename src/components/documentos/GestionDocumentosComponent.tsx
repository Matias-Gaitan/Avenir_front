import React, { useState, useEffect } from "react";
import { FileText, UploadCloud, Download, History, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import api from "../../service/api";
import { tienePermiso } from "../../service/authHelper";
import "./documentos.css";
import type { Documento, DocumentoVersion } from "../../interfaces/Documento";
import type { Empresa } from "../../interfaces/Empresa";

interface UsuarioOpcion {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
}

const CATEGORIAS = [
    { valor: "MATRICULACION", etiqueta: "Matriculación Profesional" },
    { valor: "APTO_MEDICO", etiqueta: "Apto Médico" },
    { valor: "SEGURO_ART", etiqueta: "Seguro ART" },
    { valor: "CERTIFICADO_CAPACITACION", etiqueta: "Certificado de Capacitación" },
    { valor: "CONTRATO", etiqueta: "Contrato" },
    { valor: "PROTOCOLO", etiqueta: "Protocolo de Seguridad" },
    { valor: "OTRO", etiqueta: "Otro" }
];

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const formatearBadge = (estado?: string) => {
    switch (estado) {
        case "VIGENTE": return { icono: <CheckCircle2 size={12} />, texto: "Vigente" };
        case "POR_VENCER": return { icono: <Clock size={12} />, texto: "Por vencer" };
        case "VENCIDO": return { icono: <AlertTriangle size={12} />, texto: "Vencido" };
        default: return { icono: null, texto: "Sin vencimiento" };
    }
};

const GestionDocumentosComponent: React.FC = () => {
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [versionesAbiertas, setVersionesAbiertas] = useState<number | null>(null);
    const [versiones, setVersiones] = useState<DocumentoVersion[]>([]);

    const puedeCrear = tienePermiso("CREAR_DOCUMENTOS");
    const puedeEditar = tienePermiso("EDITAR_DOCUMENTOS");
    const email = localStorage.getItem("email") || "";

    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0].valor);
    const [idUsuario, setIdUsuario] = useState<number | "">("");
    const [idEmpresa, setIdEmpresa] = useState<number | "">("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [archivo, setArchivo] = useState<File | null>(null);

    const [archivosNuevaVersion, setArchivosNuevaVersion] = useState<Record<number, File | null>>({});

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    const cargarDocumentos = async () => {
        try {
            const res = await api.get("/documentos", obtenerHeaders());
            setDocumentos(res.data);
        } catch (err) {
            console.error("Error al cargar documentos", err);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const res = await api.get("/usuarios", obtenerHeaders());
            setUsuarios(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error(err); }
    };

    const cargarEmpresas = async () => {
        try {
            const res = await api.get("/empresas", obtenerHeaders());
            setEmpresas(Array.isArray(res.data) ? res.data.filter((e: Empresa) => e.activo) : []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        cargarDocumentos();
        cargarUsuarios();
        cargarEmpresas();
    }, []);

    const handleSubir = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setMensaje("");

        if (!archivo) {
            setError("Debe adjuntar un archivo.");
            return;
        }

        try {
            const data = new FormData();
            data.append("nombre", nombre);
            data.append("categoria", categoria);
            if (idUsuario) data.append("idUsuario", String(idUsuario));
            if (idEmpresa) data.append("idEmpresa", String(idEmpresa));
            if (fechaVencimiento) data.append("fechaVencimiento", fechaVencimiento);
            data.append("archivo", archivo);
            data.append("subidoPor", email);

            await api.post("/documentos", data, { headers: { "Content-Type": "multipart/form-data" } });

            setMensaje("Documento cargado con éxito.");
            setNombre(""); setFechaVencimiento(""); setArchivo(null); setIdUsuario(""); setIdEmpresa("");
            cargarDocumentos();
        } catch (err: any) {
            setError(err.response?.data || "Error al cargar el documento.");
        }
    };

    const handleSubirVersion = async (idDocumento: number) => {
        const archivoVersion = archivosNuevaVersion[idDocumento];
        if (!archivoVersion) {
            alert("Seleccione un archivo para la nueva versión.");
            return;
        }
        try {
            const data = new FormData();
            data.append("archivo", archivoVersion);
            data.append("subidoPor", email);
            await api.post(`/documentos/${idDocumento}/versiones`, data, { headers: { "Content-Type": "multipart/form-data" } });
            setArchivosNuevaVersion((prev) => ({ ...prev, [idDocumento]: null }));
            cargarDocumentos();
            if (versionesAbiertas === idDocumento) verVersiones(idDocumento);
        } catch (err: any) {
            alert("Error al versionar: " + (err.response?.data || "Error desconocido"));
        }
    };

    const verVersiones = async (idDocumento: number) => {
        if (versionesAbiertas === idDocumento) {
            setVersionesAbiertas(null);
            return;
        }
        try {
            const res = await api.get(`/documentos/${idDocumento}/versiones`, obtenerHeaders());
            setVersiones(res.data);
            setVersionesAbiertas(idDocumento);
        } catch (err) {
            console.error("Error al cargar versiones", err);
        }
    };

    const descargar = async (idVersion: number, nombreArchivo: string) => {
        try {
            const res = await api.get(`/documentos/versiones/${idVersion}/descargar`, { ...obtenerHeaders(), responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", nombreArchivo);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Error al descargar el archivo.");
        }
    };

    return (
        <div className="documentos-container">
            <div className="documentos-card">
                <h1 style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <FileText size={24} color="#059669" /> GESTIÓN DOCUMENTAL
                </h1>

                {puedeCrear && (
                    <form onSubmit={handleSubir} className="documentos-form-grid">
                        <div className="form-section" style={{ gridColumn: "span 2" }}>
                            <label>Nombre del documento</label>
                            <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Apto Médico - Juan Pérez" required />
                        </div>
                        <div className="form-section">
                            <label>Categoría</label>
                            <select className="form-input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                                {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Empleado (opcional)</label>
                            <select className="form-input" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value as unknown as number)}>
                                <option value="">Sin asignar</option>
                                {usuarios.map((u) => <option key={u.idUsuario} value={u.idUsuario}>{u.nombre} {u.apellido}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Empresa (opcional)</label>
                            <select className="form-input" value={idEmpresa} onChange={(e) => setIdEmpresa(e.target.value as unknown as number)}>
                                <option value="">Sin asignar</option>
                                {empresas.map((emp) => <option key={emp.idEmpresa} value={emp.idEmpresa}>{emp.nombre}</option>)}
                            </select>
                        </div>
                        <div className="form-section">
                            <label>Fecha de vencimiento (opcional)</label>
                            <input type="date" className="form-input" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
                        </div>
                        <div className="form-section">
                            <label>Archivo</label>
                            <input type="file" className="form-input" onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)} required />
                        </div>
                        <div className="form-section" style={{ justifyContent: "flex-end" }}>
                            <button type="submit" className="btn-primario"><UploadCloud size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />Cargar Documento</button>
                        </div>
                    </form>
                )}

                {error && <p className="msg-error">{error}</p>}
                {mensaje && <p className="msg-exito">{mensaje}</p>}

                <div className="tabla-simetrica-wrapper">
                    <table className="tabla-documentos">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Asignado a</th>
                                <th style={{ textAlign: "center" }}>Vencimiento</th>
                                <th style={{ textAlign: "center" }}>Versión</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documentos.length > 0 ? documentos.map((doc) => {
                                const badge = formatearBadge(doc.estadoVencimiento);
                                return (
                                    <React.Fragment key={doc.idDocumento}>
                                        <tr>
                                            <td>{doc.nombre}</td>
                                            <td><span className="badge-categoria-doc">{CATEGORIAS.find((c) => c.valor === doc.categoria)?.etiqueta || doc.categoria}</span></td>
                                            <td>{doc.usuario ? `${doc.usuario.nombre} ${doc.usuario.apellido}` : doc.empresa ? doc.empresa.nombre : "-"}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className={`badge-vencimiento ${doc.estadoVencimiento}`}>
                                                    {badge.icono} {doc.fechaVencimiento ? `${doc.fechaVencimiento} · ${badge.texto}` : badge.texto}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>v{doc.versionActual}</td>
                                            <td>
                                                <div className="acciones-doc">
                                                    <button type="button" className="btn-doc-accion" onClick={() => verVersiones(doc.idDocumento!)}>
                                                        <History size={12} /> Historial
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {versionesAbiertas === doc.idDocumento && (
                                            <tr>
                                                <td colSpan={6}>
                                                    <div className="version-historial">
                                                        {versiones.map((v) => (
                                                            <div key={v.idVersion} className="version-historial-item">
                                                                <span>v{v.numeroVersion} — {v.nombreArchivo} ({v.fechaCarga?.split("T")[0]}, subido por {v.subidoPor || "desconocido"})</span>
                                                                <button type="button" className="btn-doc-accion descargar" onClick={() => descargar(v.idVersion!, v.nombreArchivo)}>
                                                                    <Download size={12} /> Descargar
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {puedeEditar && (
                                                            <div style={{ display: "flex", gap: "8px", marginTop: "8px", alignItems: "center" }}>
                                                                <input
                                                                    type="file"
                                                                    style={{ fontSize: "0.75rem" }}
                                                                    onChange={(e) => setArchivosNuevaVersion((prev) => ({ ...prev, [doc.idDocumento!]: e.target.files ? e.target.files[0] : null }))}
                                                                />
                                                                <button type="button" className="btn-doc-accion subir" onClick={() => handleSubirVersion(doc.idDocumento!)}>
                                                                    <UploadCloud size={12} /> Subir Nueva Versión
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            }) : (
                                <tr><td colSpan={6} className="txt-vacio">No hay documentos cargados todavía.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GestionDocumentosComponent;
