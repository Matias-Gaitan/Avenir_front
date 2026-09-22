import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapaFix.css";
import api from "../../service/api";
import {
  Building2,
  Users,
  RefreshCw,
  Compass,
  Search,
  ChevronRight,
  ChevronLeft,
  Navigation,
  MapPin,
  Navigation2,
  Send,
  XCircle
} from "lucide-react";

const iconoEmpresa = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoEmpleado = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ElementoMap {
  id: number;
  tipo: "EMPRESA" | "EMPLEADO_CAMPO";
  nombre: string;
  subtitulo: string;
  direccion: string;
  latitud: number;
  longitud: number;
  ciudad?: string;
}

interface PuntoEnfocado {
  lat: number;
  lng: number;
  zoom?: number;
  titulo?: string;
  timestamp?: number;
}

interface RegionDinamica {
  nombre: string;
  coords: [number, number];
  zoom: number;
  cantidad: number;
}

interface PosicionEnVivo {
  idUsuario: number;
  nombre: string;
  online: boolean;
  lat: number;
  lng: number;
  direccionAproximada: string | null;
  segundosDesdeUltimoDato: number;
}

const crearIconoEnVivo = (online: boolean) => L.divIcon({
  className: "",
  html: `<div class="marcador-en-vivo ${online ? "" : "desconectado"}"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

interface Props {
  darkMode?: boolean;
  puntoEnfocado?: PuntoEnfocado | null;
}

const formatearTranscurrido = (segundos: number): string => {
  if (segundos < 60) return `hace ${segundos}s`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  return `hace ${horas}h`;
};

const calcularDistanciaKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const MapController: React.FC<{ punto: PuntoEnfocado | null }> = ({ punto }) => {
  const map = useMap();
  useEffect(() => {
    if (punto && !isNaN(punto.lat) && !isNaN(punto.lng) && punto.lat !== 0 && punto.lng !== 0) {
      const zoomObjetivo = punto.zoom || 17;
      map.flyTo([punto.lat, punto.lng], zoomObjetivo, { animate: true, duration: 1.5 });
    }
  }, [punto, map]);
  return null;
};

export const MapaGeolocalizacion: React.FC<Props> = ({ darkMode = true, puntoEnfocado }) => {
  const [elementos, setElementos] = useState<ElementoMap[]>([]);
  const [totalEmpresas, setTotalEmpresas] = useState<number>(0);
  const [totalEmpleadosCampo, setTotalEmpleadosCampo] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);

  const [regionesDinamicas, setRegionesDinamicas] = useState<RegionDinamica[]>([]);
  const [sidebarAbierta, setSidebarAbierta] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<ElementoMap | null>(null);

  const [idEmpleadoSolicitud, setIdEmpleadoSolicitud] = useState<number | "">("");
  const [idEmpresaSolicitud, setIdEmpresaSolicitud] = useState<number | "">("");
  const [viajeSolicitado, setViajeSolicitado] = useState<{ idEmpleado: number; idEmpresa: number } | null>(null);

  const [puntoNavegacionManual, setPuntoNavegacionManual] = useState<PuntoEnfocado | null>(null);
  const [posicionesEnVivo, setPosicionesEnVivo] = useState<PosicionEnVivo[]>([]);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const centroPorDefecto: [number, number] = [-31.4167, -64.1833];

  const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const cargarPosicionesEnVivo = async () => {
    try {
      const res = await api.get("/presencia", obtenerHeaders());
      const datos = Array.isArray(res.data) ? res.data : [];
      const procesadas: PosicionEnVivo[] = datos
        .filter((p: any) => p.latitud != null && p.longitud != null)
        .map((p: any) => {
          const segundos = Math.floor((Date.now() - new Date(p.ultimoHeartbeat).getTime()) / 1000);
          return {
            idUsuario: p.idUsuario,
            nombre: `${p.usuario?.nombre || ""} ${p.usuario?.apellido || ""}`.trim() || "Técnico",
            online: segundos <= 40,
            lat: p.latitud,
            lng: p.longitud,
            direccionAproximada: p.direccionAproximada || null,
            segundosDesdeUltimoDato: segundos
          };
        });
      setPosicionesEnVivo(procesadas);
    } catch {
      /* Sin permiso VER_PRESENCIA o sin datos aun: simplemente no se muestra la capa en vivo */
    }
  };

  useEffect(() => {
    cargarPosicionesEnVivo();
    const intervalo = setInterval(cargarPosicionesEnVivo, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const resolverCoordenadasDireccion = async (direccionText: string): Promise<[number, number] | null> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccionText)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (e) {
      console.error("Error geocodificando dirección:", e);
    }
    return null;
  };

  const cargarDatosGeolocalizados = async () => {
    setCargando(true);
    try {
      const [resEmpresas, resUsuarios] = await Promise.all([
        api.get("/empresas").catch(() => ({ data: [] })),
        api.get("/usuarios").catch(() => ({ data: [] }))
      ]);

      const listaProcesada: ElementoMap[] = [];
      const mapaRegiones = new Map<string, { latSum: number; lngSum: number; count: number }>();

      const dataEmpresas = Array.isArray(resEmpresas.data) ? resEmpresas.data : [];
      setTotalEmpresas(dataEmpresas.length);

      for (let i = 0; i < dataEmpresas.length; i++) {
        const e = dataEmpresas[i];
        let lat = Number(e.latitud || e.lat);
        let lng = Number(e.longitud || e.lng);

        if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && e.direccion) {
          const coords = await resolverCoordenadasDireccion(e.direccion);
          if (coords) {
            lat = coords[0];
            lng = coords[1];
          }
        }

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
          const nombreRegion = e.ciudad || e.provincia || (e.direccion.includes("Carlos Paz") ? "Villa Carlos Paz" : e.direccion.includes("Alta Gracia") ? "Alta Gracia" : "Córdoba");

          if (!mapaRegiones.has(nombreRegion)) {
            mapaRegiones.set(nombreRegion, { latSum: lat, lngSum: lng, count: 1 });
          } else {
            const reg = mapaRegiones.get(nombreRegion)!;
            reg.latSum += lat;
            reg.lngSum += lng;
            reg.count += 1;
          }

          listaProcesada.push({
            id: e.idEmpresa || e.id || i + 1,
            tipo: "EMPRESA",
            nombre: e.nombre || e.razonSocial || "Empresa",
            subtitulo: `CUIT: ${e.cuit || "Sin CUIT"}`,
            direccion: e.direccion || "Dirección Registrada",
            latitud: lat,
            longitud: lng,
            ciudad: nombreRegion
          });
        }
      }

      const regionesCalculadas: RegionDinamica[] = [];
      mapaRegiones.forEach((val, clave) => {
        regionesCalculadas.push({
          nombre: `🏢 ${clave} (${val.count})`,
          coords: [val.latSum / val.count, val.lngSum / val.count],
          zoom: 13,
          cantidad: val.count
        });
      });
      setRegionesDinamicas(regionesCalculadas);

      const dataUsuarios = Array.isArray(resUsuarios.data) ? resUsuarios.data : [];
      setTotalEmpleadosCampo(dataUsuarios.length);

      for (let i = 0; i < dataUsuarios.length; i++) {
        const u = dataUsuarios[i];
        let lat = Number(u.latitud || u.lat);
        let lng = Number(u.longitud || u.lng);

        if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && u.direccion) {
          const coords = await resolverCoordenadasDireccion(u.direccion);
          if (coords) {
            lat = coords[0];
            lng = coords[1];
          }
        }

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          lat = -31.4167 + (Math.sin(i + 1) * 0.015);
          lng = -64.1833 + (Math.cos(i + 1) * 0.015);
        }

        listaProcesada.push({
          id: u.idUsuario || u.id || i + 1,
          tipo: "EMPLEADO_CAMPO",
          nombre: `${u.nombre || "Empleado"} ${u.apellido || ""}`,
          subtitulo: u.tipoPersona?.nombre || "Técnico de Campo",
          direccion: u.direccion || "En campo",
          latitud: lat,
          longitud: lng
        });
      }

      setElementos(listaProcesada);
    } catch (err) {
      console.error("Error cargando puntos en el mapa:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosGeolocalizados();
  }, []);

  const handleSolicitarViaje = () => {
    if (!idEmpleadoSolicitud || !idEmpresaSolicitud) {
      alert("Elegí un empleado y una empresa destino.");
      return;
    }
    setViajeSolicitado({ idEmpleado: Number(idEmpleadoSolicitud), idEmpresa: Number(idEmpresaSolicitud) });

    const empresaDestino = elementos.find((e) => e.tipo === "EMPRESA" && e.id === Number(idEmpresaSolicitud));
    if (empresaDestino) {
      setPuntoNavegacionManual({ lat: empresaDestino.latitud, lng: empresaDestino.longitud, zoom: 12, timestamp: Date.now() });
    }
  };

  const cancelarViajeSolicitado = () => {
    setViajeSolicitado(null);
    setIdEmpleadoSolicitud("");
    setIdEmpresaSolicitud("");
  };

  const empleadoEnViaje = viajeSolicitado ? elementos.find((e) => e.tipo === "EMPLEADO_CAMPO" && e.id === viajeSolicitado.idEmpleado) || null : null;
  const empresaDelViaje = viajeSolicitado ? elementos.find((e) => e.tipo === "EMPRESA" && e.id === viajeSolicitado.idEmpresa) || null : null;
  const posicionEnVivoDelViaje = viajeSolicitado ? posicionesEnVivo.find((p) => p.idUsuario === viajeSolicitado.idEmpleado) || null : null;
  const distanciaRealRestanteKm = posicionEnVivoDelViaje && empresaDelViaje
    ? calcularDistanciaKm(posicionEnVivoDelViaje.lat, posicionEnVivoDelViaje.lng, empresaDelViaje.latitud, empresaDelViaje.longitud)
    : null;

  const enfocarElemento = (item: ElementoMap) => {
    setPuntoNavegacionManual({
      lat: item.latitud,
      lng: item.longitud,
      zoom: 17,
      timestamp: Date.now()
    });

    if (item.tipo === "EMPRESA") {
      setEmpresaSeleccionada(item);
    }

    const key = `${item.tipo}-${item.id}`;
    setTimeout(() => {
      if (markerRefs.current[key]) {
        markerRefs.current[key]?.openPopup();
      }
    }, 1200);
  };

  const elementosFiltrados = elementos.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.direccion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const empleadosCampo = elementos.filter(e => e.tipo === "EMPLEADO_CAMPO");
  const puntoCamaraActual = puntoNavegacionManual || puntoEnfocado;

  return (
    <div style={{ position: "relative", width: "100%", height: "calc(100vh - 120px)", borderRadius: "12px", overflow: "hidden", border: darkMode ? "1px solid #1E293B" : "1px solid #E2E8F0" }}>
          {}
          <div style={{ position: "absolute", top: "16px", left: "16px", right: sidebarAbierta ? "340px" : "60px", zIndex: 1000, display: "flex", gap: "10px", flexWrap: "wrap", pointerEvents: "none", transition: "all 0.3s ease" }}>

            <div style={{ pointerEvents: "auto", backgroundColor: darkMode ? "rgba(11, 19, 43, 0.92)" : "rgba(255, 255, 255, 0.95)", padding: "8px 14px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #10B981" }}>
              <Building2 size={18} color="#34D399" />
              <div>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: "bold" }}>EMPRESAS</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#10B981", fontWeight: "bold" }}>{totalEmpresas}</h3>
              </div>
            </div>

            <div style={{ pointerEvents: "auto", backgroundColor: darkMode ? "rgba(11, 19, 43, 0.92)" : "rgba(255, 255, 255, 0.95)", padding: "8px 14px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #3B82F6" }}>
              <Users size={18} color="#60A5FA" />
              <div>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: "bold" }}>EN CAMPO</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#3B82F6", fontWeight: "bold" }}>{totalEmpleadosCampo}</h3>
              </div>
            </div>

            <div style={{ pointerEvents: "auto", backgroundColor: darkMode ? "rgba(11, 19, 43, 0.92)" : "rgba(255, 255, 255, 0.95)", padding: "8px 14px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #22C55E" }}>
              <div className="marcador-en-vivo" style={{ position: "relative", top: 0 }} />
              <div>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: "bold" }}>EN VIVO</span>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#22C55E", fontWeight: "bold" }}>
                  {posicionesEnVivo.filter(p => p.online).length}
                </h3>
              </div>
            </div>

            <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", backgroundColor: darkMode ? "#0F172A" : "#FFFFFF", border: "1px solid #3B82F6", borderRadius: "8px", padding: "0 8px" }}>
              <Compass size={16} color="#3B82F6" style={{ marginRight: "6px" }} />
              <select
                onChange={(e) => {
                  const reg = regionesDinamicas.find(r => r.nombre === e.target.value);
                  if (reg) {
                    setPuntoNavegacionManual({ lat: reg.coords[0], lng: reg.coords[1], zoom: reg.zoom, timestamp: Date.now() });
                  }
                }}
                defaultValue=""
                style={{ backgroundColor: "transparent", color: darkMode ? "#F8FAFC" : "#0F172A", border: "none", padding: "8px 4px", fontWeight: "bold", fontSize: "0.78rem", outline: "none", cursor: "pointer" }}
              >
                <option value="" disabled>Sedes Registradas ({regionesDinamicas.length})...</option>
                {regionesDinamicas.map((reg) => (
                  <option key={reg.nombre} value={reg.nombre} style={{ backgroundColor: darkMode ? "#0F172A" : "#FFF" }}>
                    {reg.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" onClick={cargarDatosGeolocalizados} disabled={cargando} style={{ pointerEvents: "auto", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
              <RefreshCw size={15} className={cargando ? "icon-spin" : ""} />
            </button>
          </div>

          {}
          {viajeSolicitado && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              right: "20px",
              maxWidth: "460px",
              zIndex: 1000,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: `1px solid ${posicionEnVivoDelViaje ? "#22C55E" : "#F59E0B"}`,
              borderRadius: "12px",
              padding: "12px 18px",
              color: "#FFF",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)"
            }}>
              <Navigation2 size={24} color={posicionEnVivoDelViaje ? "#22C55E" : "#F59E0B"} className="icon-pulse" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: "0.85rem", display: "block", color: "#F8FAFC" }}>
                  Viaje solicitado: {empleadoEnViaje?.nombre || "Empleado"} ➔ {empresaDelViaje?.nombre || "Empresa"}
                </strong>
                {posicionEnVivoDelViaje && distanciaRealRestanteKm !== null ? (
                  <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                    Ubicación real hace {formatearTranscurrido(posicionEnVivoDelViaje.segundosDesdeUltimoDato)} | Distancia real: <strong style={{ color: "#22C55E" }}>{distanciaRealRestanteKm} KM</strong>
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "#F59E0B" }}>
                    Esperando la ubicación en vivo de {empleadoEnViaje?.nombre || "este empleado"}... (necesita tener la app abierta con el permiso de ubicación aceptado)
                  </span>
                )}
              </div>
              <button
                onClick={cancelarViajeSolicitado}
                style={{
                  backgroundColor: "#EF4444",
                  color: "#FFF",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0
                }}
              >
                <XCircle size={12} /> Cancelar
              </button>
            </div>
          )}

          {}
          <div style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            bottom: "16px",
            width: sidebarAbierta ? "310px" : "44px",
            backgroundColor: darkMode ? "rgba(11, 19, 43, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            borderRadius: "12px",
            border: darkMode ? "1px solid #1E293B" : "1px solid #CBD5E1",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ padding: "12px", borderBottom: darkMode ? "1px solid #1E293B" : "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {sidebarAbierta ? (
                <span style={{ fontWeight: "bold", fontSize: "0.85rem", color: darkMode ? "#38BDF8" : "#0284C7", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Navigation size={16} /> Monitor de Cobertura
                </span>
              ) : null}
              <button
                onClick={() => setSidebarAbierta(!sidebarAbierta)}
                style={{ backgroundColor: "transparent", border: "none", color: darkMode ? "#FFF" : "#000", cursor: "pointer", padding: "4px" }}
              >
                {sidebarAbierta ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>

            {sidebarAbierta && (
              <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
                <div style={{
                  backgroundColor: darkMode ? "#0F172A" : "#EFF6FF",
                  border: darkMode ? "1px solid #2563EB" : "1px solid #93C5FD",
                  borderRadius: "8px",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: "bold", color: darkMode ? "#60A5FA" : "#1D4ED8", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Send size={13} /> SOLICITAR VIAJE
                  </span>
                  <select
                    value={idEmpleadoSolicitud}
                    onChange={(e) => setIdEmpleadoSolicitud(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", padding: "6px", borderRadius: "5px", border: darkMode ? "1px solid #334155" : "1px solid #CBD5E1", backgroundColor: darkMode ? "#1E293B" : "#FFF", color: darkMode ? "#FFF" : "#0F172A", fontSize: "0.75rem" }}
                  >
                    <option value="">Elegí un empleado...</option>
                    {empleadosCampo.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                  </select>
                  <select
                    value={idEmpresaSolicitud}
                    onChange={(e) => setIdEmpresaSolicitud(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", padding: "6px", borderRadius: "5px", border: darkMode ? "1px solid #334155" : "1px solid #CBD5E1", backgroundColor: darkMode ? "#1E293B" : "#FFF", color: darkMode ? "#FFF" : "#0F172A", fontSize: "0.75rem" }}
                  >
                    <option value="">Elegí una empresa destino...</option>
                    {elementos.filter((e) => e.tipo === "EMPRESA").map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSolicitarViaje}
                    disabled={!idEmpleadoSolicitud || !idEmpresaSolicitud}
                    style={{
                      width: "100%", backgroundColor: (!idEmpleadoSolicitud || !idEmpresaSolicitud) ? "#64748B" : "#059669",
                      color: "#FFF", border: "none", borderRadius: "5px", padding: "7px", fontSize: "0.75rem", fontWeight: "bold",
                      cursor: (!idEmpleadoSolicitud || !idEmpresaSolicitud) ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"
                    }}
                  >
                    <Send size={12} /> Solicitar y Seguir en Vivo
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", backgroundColor: darkMode ? "#0F172A" : "#F1F5F9", borderRadius: "6px", padding: "0 8px", border: darkMode ? "1px solid #334155" : "1px solid #CBD5E1" }}>
                  <Search size={15} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Buscar entidad o dirección..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: "100%", padding: "8px", border: "none", background: "transparent", color: darkMode ? "#FFF" : "#000", fontSize: "0.8rem", outline: "none" }}
                  />
                </div>

                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {elementosFiltrados.map((item) => (
                    <div
                      key={`${item.tipo}-${item.id}`}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: darkMode ? "#1E293B" : "#F8FAFC",
                        borderLeft: item.tipo === "EMPRESA" ? "4px solid #10B981" : "4px solid #3B82F6",
                        border: darkMode ? "1px solid #334155" : "1px solid #E2E8F0"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong
                          onClick={() => enfocarElemento(item)}
                          style={{ fontSize: "0.82rem", color: darkMode ? "#FFF" : "#0F172A", cursor: "pointer" }}
                        >
                          {item.nombre}
                        </strong>
                        <span style={{ fontSize: "0.68rem", color: item.tipo === "EMPRESA" ? "#10B981" : "#3B82F6", fontWeight: "bold" }}>
                          {item.tipo === "EMPRESA" ? "SEDE" : "TÉCNICO"}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "#94A3B8", display: "block", marginTop: "2px" }}>
                        <MapPin size={11} style={{ display: "inline", marginRight: "3px" }} />
                        {item.direccion}
                      </span>

                      {}
                      {item.tipo === "EMPLEADO_CAMPO" && (
                        <button
                          onClick={() => setIdEmpleadoSolicitud(item.id)}
                          style={{
                            marginTop: "6px",
                            width: "100%",
                            backgroundColor: idEmpleadoSolicitud === item.id ? "#059669" : "#2563EB",
                            color: "#FFF",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px"
                          }}
                        >
                          <Send size={12} /> {idEmpleadoSolicitud === item.id ? "Seleccionado para viaje" : "Elegir para Solicitar Viaje"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <MapContainer
            center={puntoCamaraActual && puntoCamaraActual.lat ? [puntoCamaraActual.lat, puntoCamaraActual.lng] : centroPorDefecto}
            zoom={puntoCamaraActual && puntoCamaraActual.zoom ? puntoCamaraActual.zoom : 11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapController punto={puntoCamaraActual || null} />

            {}
            {viajeSolicitado && posicionEnVivoDelViaje && empresaDelViaje && (
              <Polyline
                positions={[[posicionEnVivoDelViaje.lat, posicionEnVivoDelViaje.lng], [empresaDelViaje.latitud, empresaDelViaje.longitud]]}
                pathOptions={{ color: "#22C55E", weight: 4, opacity: 0.85, dashArray: "8, 8" }}
              />
            )}

            {}
            {empresaSeleccionada && (
              <>
                <Circle
                  center={[empresaSeleccionada.latitud, empresaSeleccionada.longitud]}
                  radius={5000}
                  pathOptions={{ color: "#10B981", fillColor: "#10B981", fillOpacity: 0.12, weight: 2, dashArray: "6, 6" }}
                />

                {empleadosCampo.map((emp) => {
                  const dist = calcularDistanciaKm(empresaSeleccionada.latitud, empresaSeleccionada.longitud, emp.latitud, emp.longitud);
                  return (
                    <Polyline
                      key={`linea-${emp.id}`}
                      positions={[
                        [empresaSeleccionada.latitud, empresaSeleccionada.longitud],
                        [emp.latitud, emp.longitud]
                      ]}
                      pathOptions={{ color: dist <= 5 ? "#10B981" : "#3B82F6", weight: 2, opacity: 0.75, dashArray: "4, 6" }}
                    >
                      <Popup>
                        <div style={{ padding: "2px", fontWeight: "bold", fontSize: "0.8rem" }}>
                          📏 Distancia: <span style={{ color: "#2563EB" }}>{dist} KM</span>
                        </div>
                      </Popup>
                    </Polyline>
                  );
                })}
              </>
            )}

            {elementos.map((item) => {
              const key = `${item.tipo}-${item.id}`;
              return (
                <Marker
                  key={key}
                  ref={(ref) => { markerRefs.current[key] = ref; }}
                  position={[item.latitud, item.longitud]}
                  icon={item.tipo === "EMPRESA" ? iconoEmpresa : iconoEmpleado}
                  eventHandlers={{
                    click: () => {
                      if (item.tipo === "EMPRESA") setEmpresaSeleccionada(item);
                    }
                  }}
                >
                  <Popup>
                    <div style={{ padding: "4px", minWidth: "160px" }}>
                      <strong style={{ color: item.tipo === "EMPRESA" ? "#059669" : "#2563EB", display: "block", fontSize: "0.9rem" }}>
                        {item.nombre}
                      </strong>
                      <small style={{ color: "#64748B", fontWeight: "600" }}>{item.subtitulo}</small>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#334155" }}>{item.direccion}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {}
            {posicionesEnVivo.map((pos) => (
              <Marker
                key={`en-vivo-${pos.idUsuario}`}
                position={[pos.lat, pos.lng]}
                icon={crearIconoEnVivo(pos.online)}
                zIndexOffset={1000}
              >
                <Popup>
                  <div style={{ padding: "4px", minWidth: "180px" }}>
                    <strong style={{ color: pos.online ? "#16A34A" : "#64748B", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
                      {pos.online ? "🟢 En vivo" : "⚪ Última posición"} — {pos.nombre}
                    </strong>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "#334155" }}>
                      {pos.direccionAproximada || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`}
                    </p>
                    <small style={{ color: "#94A3B8" }}>
                      {pos.online ? "Actualizado" : "Visto"} {formatearTranscurrido(pos.segundosDesdeUltimoDato)}
                    </small>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
    </div>
  );
};

export default MapaGeolocalizacion;
