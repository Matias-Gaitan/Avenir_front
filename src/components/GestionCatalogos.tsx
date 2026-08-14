import React, { useState, useEffect } from 'react';
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
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

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
  }, [modulo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      if (idEditando) {
        await api.put(`/${modulo}/${idEditando}`, { nombre, activo: true, estado: true });
      } else {
        await api.post(`/${modulo}`, { nombre });
      }
      setNombre('');
      setIdEditando(null);
      cargarDatos();
    } catch (error) {
      console.error(`Error al guardar en ${titulo}:`, error);
    }
  };

  const handleEditar = (item: ItemCat) => {
    if (item.id) {
      setIdEditando(item.id);
      setNombre(item.nombre);
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
  };

  const estilos = {
    card: {
      backgroundColor: darkMode ? '#0B132B' : '#FFFFFF',
      color: darkMode ? '#E2E8F0' : '#1E293B',
      borderRadius: '12px',
      padding: '25px',
      maxWidth: '750px',
      margin: '0 auto',
      boxShadow: darkMode ? '0 0 20px rgba(56, 189, 248, 0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
      border: darkMode ? '1px solid #1E293B' : '1px solid #E2E8F0',
      transition: 'all 0.3s ease'
    },
    titulo: {
      color: darkMode ? '#38BDF8' : '#0F172A',
      fontSize: '1.4rem',
      fontWeight: 'bold',
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
      backgroundColor: darkMode ? '#111827' : '#FFFFFF',
      color: darkMode ? '#F8FAFC' : '#0F172A',
      fontSize: '0.95rem',
      outline: 'none',
    },
    btnSubmit: {
      padding: '10px 20px',
      backgroundColor: idEditando ? '#F59E0B' : '#10B981',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.9rem',
      transition: 'background-color 0.2s'
    },
    btnCancel: {
      padding: '10px 15px',
      backgroundColor: '#64748B',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '0.9rem'
    },
    tabla: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '20px',
    },
    th: {
      backgroundColor: darkMode ? '#1E293B' : '#F1F5F9',
      color: darkMode ? '#38BDF8' : '#475569',
      padding: '12px',
      textAlign: 'left' as const,
      fontSize: '0.85rem',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      borderBottom: darkMode ? '2px solid #334155' : '2px solid #E2E8F0'
    },
    td: {
      padding: '12px',
      borderBottom: darkMode ? '1px solid #1E293B' : '1px solid #F1F5F9',
      fontSize: '0.95rem',
      color: darkMode ? '#F1F5F9' : '#1E293B'
    }
  };

  return (
    <div style={estilos.card}>
      <h3 style={estilos.titulo}>⚙️ Gestión de {titulo}</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Ingresar nombre de ${titulo}...`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={estilos.input}
        />
        <button type="submit" style={estilos.btnSubmit}>
          {idEditando ? '✏️ Actualizar' : '➕ Agregar'}
        </button>
        {idEditando && (
          <button type="button" onClick={cancelarEdicion} style={estilos.btnCancel}>
            Cancelar
          </button>
        )}
      </form>

      {loading ? (
        <p style={{ textAlign: 'center', color: darkMode ? '#94A3B8' : '#64748B', padding: '20px' }}>
          Cargando registros...
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={estilos.tabla}>
            <thead>
              <tr>
                <th style={{ ...estilos.th, width: '80px' }}>ID</th>
                <th style={estilos.th}>Nombre / Descripción</th>
                <th style={{ ...estilos.th, width: '120px', textAlign: 'center' }}>Estado</th>
                <th style={{ ...estilos.th, width: '160px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={estilos.td}>#{item.id}</td>
                  <td style={{ ...estilos.td, fontWeight: '600' }}>{item.nombre}</td>
                  <td style={{ ...estilos.td, textAlign: 'center' }}>
                    <span style={{
                      backgroundColor: darkMode ? '#064E3B' : '#DCFCE7',
                      color: darkMode ? '#34D399' : '#166534',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      border: darkMode ? '1px solid #059669' : '1px solid #86EFAC'
                    }}>
                      ACTIVO
                    </span>
                  </td>
                  <td style={{ ...estilos.td, textAlign: 'right' }}>
                    <button
                      onClick={() => handleEditar(item)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#F59E0B',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => item.id && handleDesactivar(item.id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Baja
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: darkMode ? '#64748B' : '#94A3B8', padding: '25px' }}>
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