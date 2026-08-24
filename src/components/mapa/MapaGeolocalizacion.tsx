import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./mapaFix.css";
import { MapPin, User, Building2, Activity, Clock, ShieldAlert } from "lucide-react";
import api from "../../service/api";

const iconoEmpresa = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoEmpleado = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface EmpresaBD {
  idEmpresa?: number;
  cuit: string;
  nombre: string;
  direccion: string;
  pais: string;
  provincia: string;
  barrio: string;
  lat: number;
  lng: number;
}

interface EmpleadoTarea {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  tarea: string;
  empresaDestino: string;
  direccionExacta: string;
  pais: string;
  provincia: string;
  barrio: string;
  horaInicio: string;
  lat: number;
  lng: number;
}

export const MapaGeolocalizacion: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  // Sedes reales de tu sistema
  const sedesEmpresas: EmpresaBD[] = [
    { cuit: "20-42978187-7", nombre: "Panda", direccion: "Derqui 99", barrio: "Nueva Córdoba", provincia: "Córdoba", pais: "Argentina", lat: -31.4285, lng: -64.1852 },
    { cuit: "27-27248489-4", nombre: "Angeles", direccion: "Córdoba y Sarmiento", barrio: "Centro", provincia: "Córdoba", pais: "Argentina", lat: -31.4112, lng: -64.1805 },
    { cuit: "32-323232-45", nombre: "Avenir", direccion: "Perú", barrio: "Observatorio", provincia: "Córdoba", pais: "Argentina", lat: -31.4221, lng: -64.1985 }
  ];

  // Empleados asignados a tareas específicas
  const empleadosActivos: EmpleadoTarea[] = [
    { id: 1, nombre: "Alan Rodrigo Moreno", email: "moreno@gmail.com", rol: "Empleado", tarea: "Revisión LOTO y Medición Puesta a Tierra", empresaDestino: "Panda", direccionExacta: "Derqui 99", barrio: "Nueva Córdoba", provincia: "Córdoba", pais: "Argentina", horaInicio: "08:00 Hs", lat: -31.4282, lng: -64.1850 },
    { id: 2, nombre: "Alan Rodrigo pela", email: "medina@gmail.com", rol: "Empleado", tarea: "Inspección de Tableros y Mantenimiento", empresaDestino: "Angeles", direccionExacta: "Córdoba y Sarmiento", barrio: "Centro", provincia: "Córdoba", pais: "Argentina", horaInicio: "09:30 Hs", lat: -31.4110, lng: -64.1802 },
    { id: 6, nombre: "enzoq allende", email: "allende@gmail.com", rol: "Gerente", tarea: "Auditoría General de Seguridad e Higiene", empresaDestino: "Panda", direccionExacta: "Derqui 99", barrio: "Nueva Córdoba", provincia: "Córdoba", pais: "Argentina", horaInicio: "10:15 Hs", lat: -31.4288, lng: -64.1855 }
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{
        backgroundColor: darkMode ? "#0B132B" : "#FFFFFF",
        borderRadius: "12px",
        padding: "24px",
        border: darkMode ? "1px solid #1E293B" : "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        color: darkMode ? "#F8FAFC" : "#0F172A"
      }}>
        {/* ENCABEZADO CON NÚMEROS Y MÉTRICAS REALES */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ color: darkMode ? "#38BDF8" : "#064E3B", margin: 0, display: "flex", alignItems: "center", gap: "10px", fontSize: "1.3rem" }}>
              <MapPin size={26} color="#10B981" /> Mapa 2D de Geolocalización y Tareas de Campo
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#94A3B8" }}>
              Monitoreo geográfico de tareas, horarios y ubicación exacta de sedes y personal.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ backgroundColor: "#1E293B", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", textAlign: "center" }}>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase" }}>Empresas</span>
              <strong style={{ display: "block", color: "#EF4444", fontSize: "1.1rem" }}>{sedesEmpresas.length}</strong>
            </div>

            <div style={{ backgroundColor: "#1E293B", padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", textAlign: "center" }}>
              <span style={{ fontSize: "0.7rem", color: "#94A3B8", textTransform: "uppercase" }}>Empleados Activos</span>
              <strong style={{ display: "block", color: "#10B981", fontSize: "1.1rem" }}>{empleadosActivos.length}</strong>
            </div>
          </div>
        </div>

        {/* MAPA Y POPUPS CORREGIDOS CON TEXTO NEGRO LEGIBLE */}
        <div style={{ height: "480px", width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid #334155" }}>
          <MapContainer center={[-31.4200, -64.1880]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* MARCADORES DE EMPRESAS (ROJOS) */}
            {sedesEmpresas.map((emp, idx) => (
              <Marker key={`emp-${idx}`} position={[emp.lat, emp.lng]} icon={iconoEmpresa}>
                <Popup>
                  <div style={{ minWidth: "180px", color: "#0F172A" }}>
                    <strong style={{ color: "#B91C1C", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
                      <Building2 size={16} /> {emp.nombre}
                    </strong>
                    <div style={{ fontSize: "0.8rem", marginTop: "6px", color: "#334155" }}>
                      <p style={{ margin: "2px 0" }}><strong>CUIT:</strong> {emp.cuit}</p>
                      <p style={{ margin: "2px 0" }}><strong>Dirección:</strong> {emp.direccion}</p>
                      <p style={{ margin: "2px 0" }}><strong>Ubicación:</strong> {emp.barrio}, {emp.provincia}, {emp.pais}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* MARCADORES DE EMPLEADOS EN TAREA (VERDES) */}
            {empleadosActivos.map((emp) => (
              <Marker key={`emp-tec-${emp.id}`} position={[emp.lat, emp.lng]} icon={iconoEmpleado}>
                <Popup>
                  <div style={{ minWidth: "220px", color: "#0F172A" }}>
                    <strong style={{ color: "#047857", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
                      <User size={16} /> {emp.nombre}
                    </strong>

                    <div style={{ marginTop: "6px", fontSize: "0.8rem", color: "#1E293B" }}>
                      <p style={{ margin: "2px 0" }}><strong>Lugar:</strong> {emp.empresaDestino} ({emp.direccionExacta})</p>
                      <p style={{ margin: "2px 0" }}><strong>Zona:</strong> {emp.barrio}, {emp.provincia}</p>
                      <p style={{ margin: "2px 0" }}><strong>Actividad:</strong> {emp.tarea}</p>
                      <p style={{ margin: "2px 0", color: "#059669", fontWeight: "bold" }}><strong>Horario Inicio:</strong> {emp.horaInicio}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* LEYENDA E INDICADOR JERÁRQUICO DE UBICACIÓN */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", flexWrap: "wrap", gap: "10px", fontSize: "0.85rem", color: darkMode ? "#94A3B8" : "#475569" }}>
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", backgroundColor: "#DC2626", borderRadius: "50%", display: "inline-block" }}></span>
              Sedes Registradas (3)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", backgroundColor: "#10B981", borderRadius: "50%", display: "inline-block" }}></span>
              Empleados en Servicio (11 Registrados / 3 en Campo)
            </span>
          </div>

          <span style={{ fontSize: "0.75rem", backgroundColor: "#1E293B", padding: "4px 8px", borderRadius: "4px", color: "#38BDF8" }}>
            📍 Cobertura: Argentina ➔ Córdoba ➔ Nueva Córdoba / Centro / Observatorio
          </span>
        </div>
      </div>
    </div>
  );
};