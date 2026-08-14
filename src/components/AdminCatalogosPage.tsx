import React, { useState } from 'react';
import { GestionCatalogos } from './GestionCatalogos';

type Tab = 'tipo-riesgo' | 'categoria-riesgo' | 'causa-riesgo' | 'estado' | 'probabilidad-prioridad';

interface Props {
  darkMode?: boolean;
}

export const AdminCatalogosPage: React.FC<Props> = ({ darkMode = false }) => {
  const [tabActiva, setTabActiva] = useState<Tab>('tipo-riesgo');

  const tabs = [
    { key: 'tipo-riesgo', label: 'Tipos de Riesgo' },
    { key: 'categoria-riesgo', label: 'Categorías de Riesgo' },
    { key: 'causa-riesgo', label: 'Causas de Riesgo' },
    { key: 'estado', label: 'Estados' },
    { key: 'probabilidad-prioridad', label: 'Probabilidad / Prioridad' },
  ];

  return (
    <div style={{ padding: '10px' }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: darkMode ? '#38BDF8' : '#0F172A',
        textShadow: darkMode ? '0 0 10px rgba(56, 189, 248, 0.3)' : 'none'
      }}>
        🛠️ Administración de Parámetros IPER
      </h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {tabs.map((t) => {
          const activa = tabActiva === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTabActiva(t.key as Tab)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: activa ? (darkMode ? '1px solid #38BDF8' : '1px solid #0284C7') : 'none',
                cursor: 'pointer',
                backgroundColor: activa ? (darkMode ? '#1E293B' : '#0284C7') : (darkMode ? '#111827' : '#E2E8F0'),
                color: activa ? (darkMode ? '#38BDF8' : '#FFFFFF') : (darkMode ? '#94A3B8' : '#475569'),
                fontWeight: 'bold',
                fontSize: '0.9rem',
                boxShadow: activa && darkMode ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tabActiva === 'tipo-riesgo' && <GestionCatalogos modulo="tipo-riesgo" titulo="Tipo de Riesgo" darkMode={darkMode} />}
      {tabActiva === 'categoria-riesgo' && <GestionCatalogos modulo="categoria-riesgo" titulo="Categoría de Riesgo" darkMode={darkMode} />}
      {tabActiva === 'causa-riesgo' && <GestionCatalogos modulo="causa-riesgo" titulo="Causa de Riesgo" darkMode={darkMode} />}
      {tabActiva === 'estado' && <GestionCatalogos modulo="estado" titulo="Estado" darkMode={darkMode} />}
      {tabActiva === 'probabilidad-prioridad' && <GestionCatalogos modulo="probabilidad-prioridad" titulo="Probabilidad / Prioridad" darkMode={darkMode} />}
    </div>
  );
};