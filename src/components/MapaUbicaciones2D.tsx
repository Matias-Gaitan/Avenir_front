import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de íconos vectoriales para la mapoteca 2D
const iconoEmpresa = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const iconoTecnico = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

interface Ubicacion {
  id: number;
  tipo: 'EMPRESA' | 'TECNICO';
  nombre: string;
  lat: number;
  lng: number;
  detalle: string;
}

interface Props {
  puntos: Ubicacion[];
}

export const MapaUbicaciones2D: React.FC<Props> = ({ puntos }) => {
  // Centro inicial por defecto (ej: Argentina)
  const centroInicial: [number, number] = puntos.length > 0
    ? [puntos[0].lat, puntos[0].lng]
    : [-31.4135, -64.1810];

  return (
    <div style={{ height: "420px", width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #1E293B" }}>
      <MapContainer center={centroInicial} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {puntos.map((pt) => (
          <Marker
            key={`${pt.tipo}-${pt.id}`}
            position={[pt.lat, pt.lng]}
            icon={pt.tipo === 'EMPRESA' ? iconoEmpresa : iconoTecnico}
          >
            <Popup>
              <div style={{ color: '#0F172A' }}>
                <strong>{pt.tipo === 'EMPRESA' ? '🏢 ' : '👷 '}{pt.nombre}</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>{pt.detalle}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};