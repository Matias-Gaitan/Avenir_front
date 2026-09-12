import React, { useState, useEffect } from 'react';
import {
  UserCheck, Shield, Search, Filter, Save, Clock,
  Users, Key, Building2, ShieldAlert, FileCheck, Timer, Package, Fuel, FileText, Calendar, Settings, ClipboardList
} from 'lucide-react';
import api from '../../service/api';
import { tienePermiso } from '../../service/authHelper';
import '../gestorRoles/gestorRoles.css';
import '../insumos/insumos.css';

interface Permiso {
  idPermiso: number;
  nombre: string;
}

interface UsuarioBD {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoPersona?: { nombre: string } | string;
  permisosPersonalizados?: boolean;
  permisosEspecificos?: Permiso[];
  tieneHorarioAsignado?: boolean;
  horarioLaboral?: string;
}

interface ModuloPermisos {
  titulo: string;
  icono: React.ReactNode;
  permisos: Permiso[];
}

interface Props {
  darkMode?: boolean;
}

const obtenerHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const agruparPermisosPorModulo = (permisosDisponibles: Permiso[]): ModuloPermisos[] => {
  const modulosMap: { [key: string]: { icono: React.ReactNode; permisos: Permiso[] } } = {
    "USUARIOS": { icono: <Users size={16} />, permisos: [] },
    "ROLES": { icono: <Key size={16} />, permisos: [] },
    "EMPRESAS": { icono: <Building2 size={16} />, permisos: [] },
    "HORARIOS": { icono: <Clock size={16} />, permisos: [] },
    "IPER": { icono: <ShieldAlert size={16} color="#059669" />, permisos: [] },
    "ATS": { icono: <FileCheck size={16} color="#10B981" />, permisos: [] },
    "ASISTENCIA": { icono: <Timer size={16} color="#0EA5E9" />, permisos: [] },
    "INSUMOS": { icono: <Package size={16} color="#7C3AED" />, permisos: [] },
    "VIATICOS": { icono: <Fuel size={16} color="#D97706" />, permisos: [] },
    "DOCUMENTOS": { icono: <FileText size={16} color="#0369A1" />, permisos: [] },
    "CRONOGRAMA": { icono: <Calendar size={16} color="#DB2777" />, permisos: [] },
    "TAREAS": { icono: <ClipboardList size={16} color="#0F766E" />, permisos: [] },
    "OTROS": { icono: <Settings size={16} />, permisos: [] }
  };

  permisosDisponibles.forEach((p) => {
    const nombre = p.nombre.toUpperCase();
    if (nombre.includes("USUARIO")) modulosMap["USUARIOS"].permisos.push(p);
    else if (nombre.includes("ROL")) modulosMap["ROLES"].permisos.push(p);
    else if (nombre.includes("EMPRESA")) modulosMap["EMPRESAS"].permisos.push(p);
    else if (nombre.includes("ASISTENCIA")) modulosMap["ASISTENCIA"].permisos.push(p);
    else if (nombre.includes("HORARIO")) modulosMap["HORARIOS"].permisos.push(p);
    else if (nombre.includes("IPER") || nombre.includes("RIESGO") || nombre.includes("CATALOGO")) modulosMap["IPER"].permisos.push(p);
    else if (nombre.includes("ATS")) modulosMap["ATS"].permisos.push(p);
    else if (nombre.includes("INSUMO")) modulosMap["INSUMOS"].permisos.push(p);
    else if (nombre.includes("VIATICO")) modulosMap["VIATICOS"].permisos.push(p);
    else if (nombre.includes("DOCUMENTO")) modulosMap["DOCUMENTOS"].permisos.push(p);
    else if (nombre.includes("EVENTO")) modulosMap["CRONOGRAMA"].permisos.push(p);
    else if (nombre.includes("TAREA")) modulosMap["TAREAS"].permisos.push(p);
    else modulosMap["OTROS"].permisos.push(p);
  });

  return Object.entries(modulosMap)
    .filter(([, v]) => v.permisos.length > 0)
    .map(([titulo, v]) => ({ titulo, icono: v.icono, permisos: v.permisos }));
};

export const GestorPermisosUsuarios: React.FC<Props> = ({ darkMode = false }) => {
  const puedeEditar = tienePermiso("EDITAR_USUARIOS");

  // Paleta local: en modo oscuro usamos los mismos tonos que el resto del sistema
  // (theme.css), para que estas tarjetas internas no queden claras sobre fondo oscuro.
  const c = {
    bgSuave: darkMode ? "#0D1117" : "#F8FAFC",
    bgTarjeta: darkMode ? "#161B22" : "#FFFFFF",
    borde: darkMode ? "#30363D" : "#E2E8F0",
    texto: darkMode ? "#F0F6FC" : "#0F172A",
    textoSecundario: darkMode ? "#8B949E" : "#64748B",
    seleccionadoBg: darkMode ? "#0F3D2E" : "#ECFDF5",
    seleccionadoBorde: darkMode ? "#238636" : "#6EE7B7",
    seleccionadoTexto: darkMode ? "#7EE2B8" : "#065F46",
  };

  const [usuarios, setUsuarios] = useState<UsuarioBD[]>([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [idUsuarioSel, setIdUsuarioSel] = useState<number | null>(null);

  // Formulario de permisos individuales del usuario seleccionado
  const [personalizados, setPersonalizados] = useState(false);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  // Formulario de horario laboral del usuario seleccionado
  const [tieneHorario, setTieneHorario] = useState(false);
  const [horarioTexto, setHorarioTexto] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarPermisosDisponibles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/usuarios", obtenerHeaders());
      const lista: UsuarioBD[] = Array.isArray(res.data) ? res.data : [];
      setUsuarios(lista);
      setIdUsuarioSel((actual) => actual ?? lista[0]?.idUsuario ?? null);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  const cargarPermisosDisponibles = async () => {
    try {
      const res = await api.get("/roles/permisos", obtenerHeaders());
      setPermisosDisponibles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar permisos:", err);
    }
  };

  const obtenerRolNombre = (u: UsuarioBD) => {
    if (typeof u.tipoPersona === 'object' && u.tipoPersona?.nombre) return u.tipoPersona.nombre;
    if (typeof u.tipoPersona === 'string') return u.tipoPersona;
    return "Sin rol";
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const rol = obtenerRolNombre(u).toUpperCase();
    const coincideRol = filtroRol === "TODOS" || rol === filtroRol.toUpperCase();
    const coincideTexto = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideTexto;
  });

  const usuarioSeleccionado = usuarios.find(u => u.idUsuario === idUsuarioSel) || usuariosFiltrados[0] || usuarios[0];

  useEffect(() => {
    if (usuarioSeleccionado) {
      setPersonalizados(!!usuarioSeleccionado.permisosPersonalizados);
      setPermisosSeleccionados((usuarioSeleccionado.permisosEspecificos || []).map(p => p.idPermiso));
      setTieneHorario(!!usuarioSeleccionado.tieneHorarioAsignado);
      setHorarioTexto(usuarioSeleccionado.horarioLaboral || "");
      setError(""); setMensaje("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioSeleccionado?.idUsuario]);

  const handleCheckboxChange = (idPermiso: number) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(idPermiso) ? prev.filter((id) => id !== idPermiso) : [...prev, idPermiso]
    );
  };

  const handleToggleModulo = (permisosModulo: Permiso[]) => {
    const ids = permisosModulo.map((p) => p.idPermiso);
    const estanTodos = ids.every((id) => permisosSeleccionados.includes(id));
    setPermisosSeleccionados((prev) =>
      estanTodos ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const handleGuardarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    setError(""); setMensaje("");
    try {
      await api.put(`/usuarios/${usuarioSeleccionado.idUsuario}/permisos-especificos`, {
        permisosPersonalizados: personalizados,
        idsPermisos: permisosSeleccionados
      }, obtenerHeaders());
      setMensaje(`Permisos de ${usuarioSeleccionado.nombre} actualizados con éxito.`);
      cargarUsuarios();
    } catch (err: any) {
      setError(err.response?.data || "Error al guardar los permisos.");
    }
  };

  const handleGuardarHorario = async () => {
    if (!usuarioSeleccionado) return;
    setError(""); setMensaje("");
    try {
      await api.put(`/usuarios/${usuarioSeleccionado.idUsuario}/horario-laboral`, {
        tieneHorarioAsignado: tieneHorario,
        horarioLaboral: horarioTexto
      }, obtenerHeaders());
      setMensaje(`Horario laboral de ${usuarioSeleccionado.nombre} actualizado con éxito.`);
      cargarUsuarios();
    } catch (err: any) {
      setError(err.response?.data || "Error al guardar el horario laboral.");
    }
  };

  const modulosAgrupados = agruparPermisosPorModulo(permisosDisponibles);
  const permisosDelRol = usuarioSeleccionado ? permisosDisponibles.length : 0;

  return (
    <div className="roles-card">
      <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <UserCheck size={22} color="#059669" /> Permisos y Horario Laboral por Empleado
      </h2>
      <p style={{ color: c.textoSecundario, fontSize: "0.85rem", margin: "0 0 16px 0" }}>
        Por defecto, un empleado tiene los permisos de su rol. Acá se puede definir un set de
        permisos propio para un usuario puntual (por ejemplo, que solo algunos gerentes puedan
        aprobar viáticos), y si tiene un horario laboral fijo asignado.
      </p>

      {/* FILTROS Y BUSQUEDA */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", backgroundColor: c.bgSuave, padding: "12px", borderRadius: "8px", border: `1px solid ${c.borde}` }}>
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", backgroundColor: c.bgTarjeta, borderRadius: "6px", padding: "0 10px", border: `1px solid ${c.borde}` }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: "100%", padding: "8px", backgroundColor: "transparent", border: "none", color: c.texto, outline: "none", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Filter size={16} color="#059669" />
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            style={{ backgroundColor: c.bgTarjeta, color: c.texto, border: `1px solid ${c.borde}`, padding: "8px 12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "bold" }}
          >
            <option value="TODOS">Todos los Roles ({usuarios.length})</option>
            <option value="EMPLEADO">Rol Empleado</option>
            <option value="GERENTE">Rol Gerente</option>
            <option value="ADMINISTRADOR">Rol Administrador</option>
          </select>
        </div>
      </div>

      {usuarioSeleccionado && (
        <>
          <div style={{ marginBottom: "18px" }}>
            <label style={{ fontSize: "0.8rem", color: c.textoSecundario, fontWeight: "bold", display: "block", marginBottom: "6px" }}>
              Seleccionar Empleado ({usuariosFiltrados.length} encontrados):
            </label>
            <select
              value={usuarioSeleccionado.idUsuario}
              onChange={(e) => setIdUsuarioSel(Number(e.target.value))}
              style={{ width: "100%", backgroundColor: c.bgTarjeta, color: c.texto, border: "1px solid #059669", padding: "10px", borderRadius: "6px", fontWeight: "bold", outline: "none" }}
            >
              {usuariosFiltrados.map(u => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  {u.nombre} {u.apellido} — [{obtenerRolNombre(u)}] — ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            backgroundColor: c.bgSuave,
            padding: "16px",
            borderRadius: "8px",
            border: `1px solid ${c.borde}`,
            marginBottom: "20px"
          }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: c.textoSecundario, textTransform: "uppercase", fontWeight: "bold" }}>Empleado</span>
              <strong style={{ display: "block", fontSize: "1.05rem", color: c.texto, marginTop: "2px" }}>
                {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
              </strong>
              <span style={{ fontSize: "0.8rem", color: c.textoSecundario }}>{usuarioSeleccionado.email}</span>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: c.textoSecundario, textTransform: "uppercase", fontWeight: "bold" }}>Rol del Sistema</span>
              <div style={{ marginTop: "6px" }}>
                <span style={{ backgroundColor: "#FEF08A", color: "#854D0E", padding: "6px 12px", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "bold", border: "1px solid #FACC15", display: "inline-block" }}>
                  <Shield size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> {obtenerRolNombre(usuarioSeleccionado)}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: c.textoSecundario, textTransform: "uppercase", fontWeight: "bold" }}>Fuente de sus permisos</span>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: personalizados ? "#D97706" : "#059669", fontWeight: "bold" }}>
                {personalizados ? "Personalizados (override)" : `Los de su rol (${permisosDelRol} disponibles en el sistema)`}
              </p>
            </div>
          </div>

          {error && <p className="msg-error">{error}</p>}
          {mensaje && <p className="msg-exito">{mensaje}</p>}

          {/* HORARIO LABORAL */}
          <div style={{ backgroundColor: c.bgSuave, padding: "16px", borderRadius: "8px", border: `1px solid ${c.borde}`, marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: c.texto, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={18} color="#059669" /> Horario Laboral Asignado
            </h4>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: puedeEditar ? "pointer" : "default", fontSize: "0.9rem", marginBottom: "10px", color: c.texto }}>
              <input type="checkbox" checked={tieneHorario} disabled={!puedeEditar} onChange={(e) => setTieneHorario(e.target.checked)} />
              Este empleado tiene un horario laboral fijo definido
            </label>

            {tieneHorario && (
              <input
                type="text"
                className="form-input"
                value={horarioTexto}
                disabled={!puedeEditar}
                onChange={(e) => setHorarioTexto(e.target.value)}
                placeholder="Ej. Lunes a Viernes de 08:00 a 17:00"
                style={{ marginBottom: "10px" }}
              />
            )}

            {puedeEditar && (
              <button type="button" className="btn-primario" onClick={handleGuardarHorario} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Save size={14} /> Guardar Horario
              </button>
            )}
          </div>

          {/* PERMISOS PERSONALIZADOS */}
          <div style={{ backgroundColor: c.bgSuave, padding: "16px", borderRadius: "8px", border: `1px solid ${c.borde}` }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: puedeEditar ? "pointer" : "default", fontSize: "0.9rem", fontWeight: "bold", color: c.texto, marginBottom: "12px" }}>
              <input type="checkbox" checked={personalizados} disabled={!puedeEditar} onChange={(e) => setPersonalizados(e.target.checked)} />
              Usar permisos personalizados para este usuario (en vez de los de su rol)
            </label>

            {personalizados ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
                {modulosAgrupados.map((mod) => {
                  const idsMod = mod.permisos.map((p) => p.idPermiso);
                  const estanTodosMod = idsMod.every((id) => permisosSeleccionados.includes(id));
                  const algunoMod = idsMod.some((id) => permisosSeleccionados.includes(id));

                  return (
                    <div key={mod.titulo} style={{ backgroundColor: c.bgTarjeta, border: "1px solid", borderColor: algunoMod ? c.seleccionadoBorde : c.borde, borderRadius: "10px", padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.borde}`, paddingBottom: "8px", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", color: c.texto, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                          {mod.icono} {mod.titulo}
                        </span>
                        {puedeEditar && (
                          <button type="button" onClick={() => handleToggleModulo(mod.permisos)} style={{ backgroundColor: "transparent", border: "none", color: "#059669", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}>
                            {estanTodosMod ? "Desmarcar" : "Marcar todo"}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {mod.permisos.map((p) => {
                          const seleccionado = permisosSeleccionados.includes(p.idPermiso);
                          return (
                            <label key={p.idPermiso} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 8px", borderRadius: "6px", backgroundColor: seleccionado ? c.seleccionadoBg : c.bgSuave, border: "1px solid", borderColor: seleccionado ? c.seleccionadoBorde : c.borde, cursor: puedeEditar ? "pointer" : "default", fontSize: "0.8rem" }}>
                              <input type="checkbox" checked={seleccionado} disabled={!puedeEditar} onChange={() => handleCheckboxChange(p.idPermiso)} />
                              <span style={{ fontWeight: seleccionado ? "bold" : "normal", color: seleccionado ? c.seleccionadoTexto : c.textoSecundario }}>{p.nombre}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "0.85rem", color: c.textoSecundario, margin: 0 }}>
                Este usuario usa los permisos de su rol ({obtenerRolNombre(usuarioSeleccionado)}). Tildá la casilla de arriba para asignarle un set propio.
              </p>
            )}

            {puedeEditar && (
              <button type="button" className="btn-primario" onClick={handleGuardarPermisos} style={{ marginTop: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <Save size={14} /> Guardar Permisos
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GestorPermisosUsuarios;
