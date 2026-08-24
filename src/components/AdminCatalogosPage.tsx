import React, { useState } from 'react';
import { SlidersHorizontal, AlertTriangle, Layers, Activity, ActivitySquare, Gauge } from 'lucide-react';
import { GestionCatalogos } from './GestionCatalogos';

type ModuloTipo = 'tipo-riesgo' | 'categoria-riesgo' | 'causa-riesgo' | 'estado' | 'probabilidad-prioridad';

interface Props {
  darkMode?: boolean;
}

export const AdminCatalogosPage: React.FC<Props> = ({ darkMode = false }) => {
  const [moduloActivo, setModuloActivo] = useState<ModuloTipo>('probabilidad-prioridad');

  const pestañas = [
    { key: 'tipo-riesgo', label: 'Tipos de Riesgo', icono: <AlertTriangle size={16} /> },
    { key: 'categoria-riesgo', label: 'Categorías de Riesgo', icono: <Layers size={16} /> },
    { key: 'causa-riesgo', label: 'Causas de Riesgo', icono: <Activity size={16} /> },
    { key: 'estado', label: 'Estados del Ciclo', icono: <ActivitySquare size={16} /> },
    { key: 'probabilidad-prioridad', label: 'Probabilidad / Prioridad', icono: <Gauge size={16} /> },
  ];

  const getTitulo = () => {
    switch (moduloActivo) {
      case 'tipo-riesgo': return 'Tipos de Riesgo Ocupacional';
      case 'categoria-riesgo': return 'Categorías de Riesgo';
      case 'causa-riesgo': return 'Causas Originarias de Riesgo';
      case 'estado': return 'Estados del Ciclo de Vida del Riesgo';
      case 'probabilidad-prioridad': return 'Probabilidad y Nivel de Prioridad (1 a 5)';
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
      {/* Cabecera sin emojis */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: darkMode ? '#38BDF8' : '#064E3B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          margin: 0
        }}>
          <SlidersHorizontal size={26} className="icon-spin-hover" color={darkMode ? '#10B981' : '#059669'} />
          Administración de Parámetros IPER
        </h2>
        <p style={{ color: darkMode ? '#94A3B8' : '#64748B', fontSize: '0.875rem', marginTop: '6px' }}>
          Configuración de tablas maestras para la Matriz de Identificación de Peligros y Evaluación de Riesgos
        </p>
      </div>

      {/* Pestañas estilo Pilled */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        {pestañas.map((tab) => {
          const estaActiva = moduloActivo === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setModuloActivo(tab.key as ModuloTipo)}
              className="btn-interactive"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                backgroundColor: estaActiva
                  ? (darkMode ? '#10B981' : '#059669')
                  : (darkMode ? '#1E293B' : '#E2E8F0'),
                color: estaActiva
                  ? '#FFFFFF'
                  : (darkMode ? '#94A3B8' : '#334155'),
                boxShadow: estaActiva ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              {tab.icono}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Componente de Gestión */}
      <GestionCatalogos modulo={moduloActivo} titulo={getTitulo()} darkMode={darkMode} />
    </div>
  );
};