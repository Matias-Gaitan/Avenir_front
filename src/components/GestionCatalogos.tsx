import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Gauge
} from 'lucide-react';
import {
  getTiposRiesgoActivos,
  getCategoriasRiesgoActivas,
  getCausasRiesgoActivas,
  getEstadosActivos,
  getProbabilidadesActivas
} from '../service/iperService';
import api from '../service/api';

interface ItemCat {
  id?: number;
  nombre: string;
  descripcion?: string;
  nivel?: number;
  valor?: number;
  activo?: boolean;
  estado?: boolean;
}

type TipoModulo = 'tipo-riesgo' | 'categoria-riesgo' | 'causa-riesgo' | 'estado' | 'probabilidad-prioridad';

interface Props {
  modulo: TipoModulo;
  titulo: string;
  darkMode?: boolean;
}

export const GestionCatalogos: React.FC<Props> = ({ modulo, titulo, darkMode = false }) => {
  const [items, setItems] = useState<ItemCat[]>([]);
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<number>(1);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const esProbabilidad = modulo === 'probabilidad-prioridad';

  const cargarDatos = async () => {
    setLoading(true);
    try {
      let data: ItemCat[] = [];
      switch (modulo) {
        case 'tipo-riesgo':
          data = await getTiposRiesgoActivos();
          break;
        case 'categoria-riesgo':
          data = await getCategoriasRiesgoActivas();
          break;
        case 'causa-riesgo':
          data = await getCausasRiesgoActivas();
          break;
        case 'estado':
          data = await getEstadosActivos();
          break;
        case 'probabilidad-prioridad':
          data = await getProbabilidadesActivas();
          break;
      }
      setItems(data);
    } catch (error) {
      console.error(`Error cargando ${titulo}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    cancelarEdicion();
  }, [modulo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const textoLimpio = nombre.trim();
    if (!textoLimpio) return;

    let valorNumerico = 1;
    if (esProbabilidad) {
      valorNumerico = Math.min(Math.max(Number(nivel), 1), 5);
    }

    const payload = {
      nombre: textoLimpio,
      descripcion: textoLimpio,
      nivel: valorNumerico,
      valor: valorNumerico,
      estado: true,
      activo: true
    };

    try {
      if (idEditando) {
        await api.put(`/${modulo}/${idEditando}`, payload);
      } else {
        await api.post(`/${modulo}`, payload);
      }
      setNombre('');
      setNivel(1);
      setIdEditando(null);
      cargarDatos();
    } catch (error) {
      console.error(`Error al guardar en ${titulo}:`, error);
      alert(`Ocurrió un error al guardar en ${titulo}.`);
    }
  };

  const handleEditar = (item: ItemCat) => {
    if (item.id) {
      setIdEditando(item.id);
      setNombre(item.nombre);
      const valorEncontrado = item.nivel ?? item.valor;
      if (valorEncontrado !== undefined) {
        setNivel(valorEncontrado);
      }
    }
  };

  const handleDesactivar = async (id: number) => {
    if (window.confirm('¿Seguro que querés dar de baja este registro?')) {
      try {
        await api.patch(`/${modulo}/${id}/desactivar`);
        cargarDatos();
      } catch (error) {
        console.error(`Error al dar de baja en ${titulo}:`, error);
      }
    }
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setNombre('');
    setNivel(1);
  };

  const renderBadgeNivel = (numNivel: number) => {
    const configNiveles: { [key: number]: { label: string; bg: string; color: string } } = {
      1: { label: '1 - Bajo', bg: '#065F46', color: '#D1FAE5' },
      2: { label: '2 - Medio', bg: '#92400E', color: '#FEF3C7' },
      3: { label: '3 - Alto', bg: '#C2410C', color: '#FFEDD5' },
      4: { label: '4 - Muy Alto', bg: '#B91C1C', color: '#FEE2E2' },
      5: { label: '5 - Crítico', bg: '#991B1B', color: '#FFFFFF' }
    };

    const conf = configNiveles[numNivel] || configNiveles[1];

    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: conf.bg,
        color: conf.color,
        display: 'inline-block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }}>
        {conf.label}
      </span>
    );
  };

  const estilos = {
    card: {
      backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
      color: darkMode ? '#F8FAFC' : '#0F172A',
      borderRadius: '10px',
      padding: '24px',
      maxWidth: '900px',
      margin: '0 auto',
      boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 2px 10px rgba(0,0,0,0.05)',
      border: darkMode ? '1px solid #1E293B' : '1px solid #E2E8F0',
      borderTop: `4px solid ${darkMode ? '#10B981' : '#059669'}`
    },
    titulo: {
      color: darkMode ? '#38BDF8' : '#064E3B',
      fontSize: '1.25rem',
      fontWeight: '700',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    input: {
      flex: 1,
      padding: '10px 14px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #334155' : '1px solid #CBD5E1',
      backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
      color: darkMode ? '#F8FAFC' : '#0F172A',
      fontSize: '0.9rem',
      outline: 'none',
    },
    selectNivel: {
      width: '140px',
      padding: '10px 12px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #334155' : '1px solid #CBD5E1',
      backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
      color: darkMode ? '#F8FAFC' : '#0F172A',
      fontSize: '0.875rem',
      fontWeight: '600',
      outline: 'none',
    },
    btnSubmit: {
      padding: '10px 18px',
      backgroundColor: idEditando ? '#D97706' : '#059669',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    btnCancel: {
      padding: '10px 14px',
      backgroundColor: darkMode ? '#334155' : '#64748B',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    tabla: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '16px',
    },
    th: {
      backgroundColor: darkMode ? '#1E293B' : '#F8FAFC',
      color: darkMode ? '#38BDF8' : '#0F172A',
      padding: '12px 14px',
      textAlign: 'left' as const,
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase' as const,
      borderBottom: darkMode ? '2px solid #334155' : '2px solid #E2E8F0',
      letterSpacing: '0.05em'
    },
    td: {
      padding: '12px 14px',
      borderBottom: darkMode ? '1px solid #1E293B' : '1px solid #F1F5F9',
      fontSize: '0.9rem',
      color: darkMode ? '#F1F5F9' : '#1E293B'
    }
  };

  return (
    <div style={estilos.card}>
      <h3 style={estilos.titulo}>
        {esProbabilidad ? (
          <Gauge size={22} className="icon-pulse" color={darkMode ? '#10B981' : '#059669'} />
        ) : (
          <ShieldAlert size={22} className="icon-pulse" color={darkMode ? '#10B981' : '#059669'} />
        )}
        Gestión de {titulo}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder={`Ingresar nombre/descripción...`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={estilos.input}
          required
        />

        {esProbabilidad && (
          <select
            value={nivel}
            onChange={(e) => setNivel(Number(e.target.value))}
            style={estilos.selectNivel}
            title="Nivel de Prioridad / Criticidad"
          >
            <option value={1}>1 - Bajo</option>
            <option value={2}>2 - Medio</option>
            <option value={3}>3 - Alto</option>
            <option value={4}>4 - Muy Alto</option>
            <option value={5}>5 - Crítico</option>
          </select>
        )}

        <button type="submit" style={estilos.btnSubmit} className="btn-interactive">
          {idEditando ? <Edit3 size={16} /> : <Plus size={16} />}
          {idEditando ? 'Actualizar' : 'Agregar'}
        </button>

        {idEditando && (
          <button type="button" onClick={cancelarEdicion} style={estilos.btnCancel} className="btn-interactive">
            <X size={16} />
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>
          Cargando registros...
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={{ ...estilos.th, width: '70px' }}>ID</th>
                <th style={estilos.th}>Descripción</th>
                {esProbabilidad && <th style={{ ...estilos.th, width: '150px', textAlign: 'center' }}>Nivel Criticidad</th>}
                <th style={{ ...estilos.th, width: '110px', textAlign: 'center' }}>Estado</th>
                <th style={{ ...estilos.th, width: '120px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ ...estilos.td, fontWeight: 'bold' }}>#{item.id}</td>
                  <td style={{ ...estilos.td, fontWeight: '500' }}>{item.nombre}</td>
                  {esProbabilidad && (
                    <td style={{ ...estilos.td, textAlign: 'center' }}>
                      {renderBadgeNivel(item.nivel ?? item.valor ?? 1)}
                    </td>
                  )}
                  <td style={{ ...estilos.td, textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                      color: darkMode ? '#34D399' : '#047857',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: darkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #A7F3D0'
                    }}>
                      <CheckCircle2 size={13} /> Activo
                    </span>
                  </td>
                  <td style={{ ...estilos.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEditar(item)}
                        title="Editar registro"
                        className="btn-interactive"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#059669',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => item.id && handleDesactivar(item.id)}
                        title="Dar de baja"
                        className="btn-interactive"
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#64748B',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Dar de baja
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={esProbabilidad ? 5 : 4} style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                    Sin registros activos para {titulo}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};