import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Check, FileText, Building2, Search, Filter, Save, MapPin } from 'lucide-react';
import api from '../../service/api';

interface UsuarioBD {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  tipoPersona?: { nombre: string } | string;
  rol?: string;
  tareaActual?: string;
  empresaActual?: string;
  direccionTarea?: string;
  barrio?: string;
  horarioAsignado?: string;
}

export const GestorPermisosUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioBD[]>([]);
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [idUsuarioSel, setIdUsuarioSel] = useState<number | null>(null);

  // Formulario para Asignar Actividad/Ubicación
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [nuevaEmpresa, setNuevaEmpresa] = useState("Panda");
  const [nuevaDireccion, setNuevaDireccion] = useState("Derqui 99");
  const [nuevoBarrio, setNuevoBarrio] = useState("Nueva Córdoba");
  const [nuevoHorario, setNuevoHorario] = useState("08:00 a 16:00 Hs");

  useEffect(() => {
    cargarUsuariosBD();
  }, []);

  const cargarUsuariosBD = async () => {
    try {
      const res = await api.get("/usuarios");
      const lista: UsuarioBD[] = Array.isArray(res.data) ? res.data : [];
      setUsuarios(lista);
      if (lista.length > 0) setIdUsuarioSel(lista[0].idUsuario || 1);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      const listaFallback: UsuarioBD[] = [
        { idUsuario: 1, nombre: "Alan Rodrigo", apellido: "Moreno", email: "moreno@gmail.com", rol: "Empleado", tareaActual: "Revisión LOTO y Puesta a Tierra", empresaActual: "Panda", direccionTarea: "Derqui 99", barrio: "Nueva Córdoba", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 2, nombre: "Alan Rodrigo", apellido: "pela", email: "medina@gmail.com", rol: "Empleado", tareaActual: "Inspección de Tableros Eléctricos", empresaActual: "Angeles", direccionTarea: "Córdoba y Sarmiento", barrio: "Centro", horarioAsignado: "09:00 a 17:00 Hs" },
        { idUsuario: 3, nombre: "jesus", apellido: "testo", email: "testeoadmin@gmail.com", rol: "Empleado", tareaActual: "Carga de ATS en Terreno", empresaActual: "Avenir", direccionTarea: "Perú", barrio: "Observatorio", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 4, nombre: "panda", apellido: "testeoAdmin", email: "panda@gmail.com", rol: "Administrador", tareaActual: "Supervisión de Seguridad e Higiene", empresaActual: "Panda", direccionTarea: "Derqui 99", barrio: "Nueva Córdoba", horarioAsignado: "Turno Completo" },
        { idUsuario: 5, nombre: "María angeles", apellido: "Medina", email: "shila@gmail.com", rol: "Administrador", tareaActual: "Auditoría de Parámetros IPER", empresaActual: "Sede Central", direccionTarea: "Córdoba y Sarmiento", barrio: "Centro", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 6, nombre: "enzoq", apellido: "allende", email: "allende@gmail.com", rol: "Gerente", tareaActual: "Firma de Certificados e IPER", empresaActual: "Panda", direccionTarea: "Derqui 99", barrio: "Nueva Córdoba", horarioAsignado: "09:00 a 18:00 Hs" },
        { idUsuario: 7, nombre: "Pedro", apellido: "Ricartti", email: "ricartii@gmai.com", rol: "Empleado", tareaActual: "Control de Registro de Horarios", empresaActual: "Angeles", direccionTarea: "Córdoba y Sarmiento", barrio: "Centro", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 8, nombre: "pepita", apellido: "ex", email: "pepita@gmail.com", rol: "Gerente", tareaActual: "Supervisión de Normativa ISO", empresaActual: "Avenir", direccionTarea: "Perú", barrio: "Observatorio", horarioAsignado: "09:00 a 17:00 Hs" },
        { idUsuario: 9, nombre: "ramiro", apellido: "aguero", email: "aguero@gmail.com", rol: "Empleado", tareaActual: "Toma de muestras de aire/ruido", empresaActual: "Panda", direccionTarea: "Derqui 99", barrio: "Nueva Córdoba", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 10, nombre: "licha", apellido: "martinez", email: "licha@gmail.com", rol: "Gerente", tareaActual: "Planificación de Turnos", empresaActual: "Angeles", direccionTarea: "Córdoba y Sarmiento", barrio: "Centro", horarioAsignado: "08:00 a 16:00 Hs" },
        { idUsuario: 11, nombre: "Juan", apellido: "Medina", email: "juanmartin@gmail.com", rol: "Gerente", tareaActual: "Carga de Inspección y Registro ATS", empresaActual: "Panda", direccionTarea: "Derqui 99", barrio: "Nueva Córdoba", horarioAsignado: "08:00 a 17:00 Hs" }
      ];
      setUsuarios(listaFallback);
      setIdUsuarioSel(1);
    }
  };

  const obtenerRolNombre = (u: UsuarioBD) => {
    if (typeof u.tipoPersona === 'object' && u.tipoPersona?.nombre) return u.tipoPersona.nombre;
    if (typeof u.tipoPersona === 'string') return u.tipoPersona;
    return u.rol || "Empleado";
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
      setNuevaTarea(usuarioSeleccionado.tareaActual || "Revisión de Seguridad");
      setNuevaEmpresa(usuarioSeleccionado.empresaActual || "Panda");
      setNuevaDireccion(usuarioSeleccionado.direccionTarea || "Derqui 99");
      setNuevoBarrio(usuarioSeleccionado.barrio || "Nueva Córdoba");
      setNuevoHorario(usuarioSeleccionado.horarioAsignado || "08:00 a 16:00 Hs");
    }
  }, [idUsuarioSel]);

  const handleGuardarTarea = () => {
    setUsuarios(prev => prev.map(u => {
      if (u.idUsuario === usuarioSeleccionado.idUsuario) {
        return {
          ...u,
          tareaActual: nuevaTarea,
          empresaActual: nuevaEmpresa,
          direccionTarea: nuevaDireccion,
          barrio: nuevoBarrio,
          horarioAsignado: nuevoHorario
        };
      }
      return u;
    }));
    alert(`¡Tarea y Ubicación actualizadas para ${usuarioSeleccionado.nombre}!`);
  };

  const permisosPorRolMap: { [key: string]: string[] } = {
    "GERENTE": [
      "VER_USUARIOS", "CREAR_USUARIOS", "EDITAR_USUARIOS",
      "VER_ROLES", "VER_EMPRESAS", "EDITAR_EMPRESAS",
      "VER_HORARIOS", "REGISTRAR_HORARIOS", "APROBAR_HORARIOS",
      "VER_CATALOGOS_IPER", "CREAR_CATALOGOS_IPER", "CREAR_ATS", "APROBAR_ATS"
    ],
    "EMPLEADO": [
      "VER_EMPRESAS", "VER_HORARIOS", "REGISTRAR_HORARIOS", "CREAR_ATS", "CREAR_IPER"
    ],
    "ADMINISTRADOR": [
      "VER_USUARIOS", "CREAR_USUARIOS", "EDITAR_USUARIOS", "ELIMINAR_USUARIOS",
      "VER_ROLES", "CREAR_ROLES", "EDITAR_ROLES", "ELIMINAR_ROLES",
      "VER_EMPRESAS", "CREAR_EMPRESAS", "EDITAR_EMPRESAS", "ELIMINAR_EMPRESAS",
      "VER_HORARIOS", "REGISTRAR_HORARIOS", "APROBAR_HORARIOS"
    ]
  };

  const rolActual = usuarioSeleccionado ? obtenerRolNombre(usuarioSeleccionado).toUpperCase() : "EMPLEADO";
  const permisosEficiencia = permisosPorRolMap[rolActual] || permisosPorRolMap["EMPLEADO"];

  return (
    <div style={{
      backgroundColor: "#0B132B",
      padding: "24px",
      borderRadius: "12px",
      border: "1px solid #1E293B",
      color: "#F8FAFC",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      maxWidth: "1000px",
      margin: "0 auto"
    }}>
      <h3 style={{ color: "#38BDF8", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 15px 0", fontSize: "1.3rem" }}>
        <UserCheck size={24} color="#10B981" /> Permisos y Asignación de Actividades por Empleado
      </h3>

      {/* FILTROS Y BUSQUEDA */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", backgroundColor: "#0F172A", padding: "12px", borderRadius: "8px", border: "1px solid #1E293B" }}>
        <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", backgroundColor: "#1E293B", borderRadius: "6px", padding: "0 10px", border: "1px solid #334155" }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: "100%", padding: "8px", backgroundColor: "transparent", border: "none", color: "#FFF", outline: "none", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Filter size={16} color="#38BDF8" />
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            style={{ backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155", padding: "8px 12px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "bold" }}
          >
            <option value="TODOS">Todos los Roles ({usuarios.length})</option>
            <option value="EMPLEADO">Rol Empleado</option>
            <option value="GERENTE">Rol Gerente</option>
            <option value="ADMINISTRADOR">Rol Administrador</option>
          </select>
        </div>
      </div>

      {/* LISTA DE SELECCION */}
      {usuarioSeleccionado && (
        <>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontSize: "0.8rem", color: "#94A3B8", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
              Seleccionar Empleado para Asignar Tarea ({usuariosFiltrados.length} encontrados):
            </label>
            <select
              value={usuarioSeleccionado.idUsuario}
              onChange={(e) => setIdUsuarioSel(Number(e.target.value))}
              style={{
                width: "100%",
                backgroundColor: "#1E293B",
                color: "#F8FAFC",
                border: "1px solid #10B981",
                padding: "10px",
                borderRadius: "6px",
                fontWeight: "bold",
                outline: "none"
              }}
            >
              {usuariosFiltrados.map(u => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  👤 {u.nombre} {u.apellido} — [{obtenerRolNombre(u)}] — ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* TARJETA DEL EMPLEADO CON ROL CORREGIDO (LEGIBLE) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            backgroundColor: "#0F172A",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #1E293B",
            marginBottom: "20px"
          }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold" }}>Empleado Seleccionado</span>
              <strong style={{ display: "block", fontSize: "1.1rem", color: "#38BDF8", marginTop: "2px" }}>
                {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#CBD5E1" }}>{usuarioSeleccionado.email}</span>
            </div>

            {/* AHORA EL ROL SE LEE PERFECTAMENTE */}
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold" }}>Rol del Sistema</span>
              <div style={{ marginTop: "6px" }}>
                <span style={{ backgroundColor: "#FEF08A", color: "#854D0E", padding: "6px 12px", borderRadius: "6px", fontSize: "0.9rem", fontWeight: "bold", border: "1px solid #FACC15", display: "inline-block" }}>
                  <Shield size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} /> {obtenerRolNombre(usuarioSeleccionado)}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: "bold" }}>Horario Laboral Asignado</span>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#38BDF8", fontWeight: "bold" }}>
                {usuarioSeleccionado.horarioAsignado || "08:00 a 16:00 Hs"}
              </p>
            </div>
          </div>

          {/* FORMULARIO DE EDICIÓN DE ACTIVIDAD Y UBICACIÓN EXPRESA */}
          <div style={{ backgroundColor: "#1E293B", padding: "16px", borderRadius: "8px", border: "1px solid #334155", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 12px 0", color: "#10B981", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <FileText size={18} /> Asignar Actividad Específica y Ubicación Geográfica
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: "bold" }}>Tarea / Actividad a Realizar</label>
                <input
                  type="text"
                  value={nuevaTarea}
                  onChange={(e) => setNuevaTarea(e.target.value)}
                  placeholder="Ej: Inspección LOTO de Tablero"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#0F172A", border: "1px solid #334155", color: "#FFF", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: "bold" }}>Sede / Empresa Destino</label>
                <select
                  value={nuevaEmpresa}
                  onChange={(e) => setNuevaEmpresa(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#0F172A", border: "1px solid #334155", color: "#FFF", marginTop: "4px" }}
                >
                  <option value="Panda">Panda</option>
                  <option value="Angeles">Angeles</option>
                  <option value="Avenir">Avenir</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: "bold" }}>Dirección Exacta</label>
                <input
                  type="text"
                  value={nuevaDireccion}
                  onChange={(e) => setNuevaDireccion(e.target.value)}
                  placeholder="Ej: Derqui 99"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#0F172A", border: "1px solid #334155", color: "#FFF", marginTop: "4px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: "bold" }}>Barrio / Zona</label>
                <input
                  type="text"
                  value={nuevoBarrio}
                  onChange={(e) => setNuevoBarrio(e.target.value)}
                  placeholder="Ej: Nueva Córdoba"
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", backgroundColor: "#0F172A", border: "1px solid #334155", color: "#FFF", marginTop: "4px" }}
                />
              </div>
            </div>

            <button
              onClick={handleGuardarTarea}
              className="btn-interactive"
              style={{
                padding: "8px 16px",
                backgroundColor: "#10B981",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Save size={16} /> Guardar Asignación de Tarea
            </button>
          </div>

          {/* PERMISOS QUE TIENE HABILITADOS POR SU ROL */}
          <h4 style={{ color: "#34D399", margin: "0 0 12px 0", fontSize: "0.95rem" }}>
            Permisos Activos para {usuarioSeleccionado.nombre} ({permisosEficiencia.length} Permisos):
          </h4>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "10px",
            maxHeight: "220px",
            overflowY: "auto",
            paddingRight: "6px"
          }}>
            {permisosEficiencia.map((perm, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid #10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <strong style={{ fontSize: "0.8rem", color: "#34D399" }}>{perm}</strong>
                <Check size={16} color="#34D399" />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GestorPermisosUsuarios;