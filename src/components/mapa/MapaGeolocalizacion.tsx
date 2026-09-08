import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Globe from "globe.gl";
import api from "../../service/api";
import {
  Building2,
  Users,
  RefreshCw,
  Compass,
  Search,
  Globe2,
  Map as MapIcon,
  ChevronRight,
  ChevronLeft,
  Navigation,
  MapPin,
  Flame,
  Layers,
  Play,
  Square,
  Navigation2
} from "lucide-react";

// Íconos de Leaflet 2D
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

const iconoVehiculoSimulado = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
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

interface Props {
  darkMode?: boolean;
  puntoEnfocado?: PuntoEnfocado | null;
}

// 📐 Fórmula de Haversine para distancias en KM
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

// 🎯 Controlador de animación para el Mapa 2D
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

// ☄️ GLOBO 3D ULTRA ESTABLE
const VisorGlobo3DPro: React.FC<{ elementos: ElementoMap[]; onVolver2D: () => void }> = ({ elementos, onVolver2D }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeInstanceRef = useRef<any>(null);
  const [filtro3D, setFiltro3D] = useState<"TODOS" | "EMPRESAS" | "EMPLEADOS">("TODOS");

  useEffect(() => {
    if (!containerRef.current) return;

    const world = Globe()(containerRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .arcStartLat((d: any) => d.startLat)
      .arcStartLng((d: any) => d.startLng)
      .arcEndLat((d: any) => d.endLat)
      .arcEndLng((d: any) => d.endLng)
      .arcColor((d: any) => d.color)
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(1500)
      .arcAltitude(0.4)
      .ringColor((d: any) => d.color)
      .ringMaxRadius((d: any) => d.maxR)
      .ringPropagationSpeed((d: any) => d.propagationSpeed)
      .ringRepeatPeriod((d: any) => d.repeatPeriod)
      .htmlElement((d: any) => {
        const el = document.createElement("div");
        el.title = `${d.nombre}\n📍 ${d.direccion}`;
        el.innerHTML = `
          <div style="
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(15, 23, 42, 0.88);
            border: 1px solid ${d.color};
            padding: 3px 8px;
            border-radius: 12px;
            color: #FFF;
            font-size: 10px;
            font-weight: bold;
            box-shadow: 0 0 10px ${d.color};
            backdrop-filter: blur(4px);
            white-space: nowrap;
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.15)'; this.style.zIndex='9999';" onmouseout="this.style.transform='translate(-50%, -50%) scale(1)';">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${d.color}; display: inline-block; flex-shrink: 0; box-shadow: 0 0 6px ${d.color};"></span>
            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${d.icono} ${d.nombre}</span>
          </div>
        `;
        return el;
      });

    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.6;
    world.pointOfView({ lat: -31.4167, lng: -64.1833, altitude: 1.8 }, 2000);

    globeInstanceRef.current = world;

    const handleResize = () => {
      if (containerRef.current && globeInstanceRef.current) {
        globeInstanceRef.current.width(containerRef.current.clientWidth);
        globeInstanceRef.current.height(containerRef.current.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) containerRef.current.innerHTML = "";
      globeInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!globeInstanceRef.current) return;

    const filtrados = elementos.filter((item) => {
      if (filtro3D === "EMPRESAS") return item.tipo === "EMPRESA";
      if (filtro3D === "EMPLEADOS") return item.tipo === "EMPLEADO_CAMPO";
      return true;
    });

    const meteoritosData = filtrados.map((el) => ({
      startLat: el.latitud + (Math.sin(el.id) * 12),
      startLng: el.longitud + (Math.cos(el.id) * 15),
      endLat: el.latitud,
      endLng: el.longitud,
      color: el.tipo === "EMPRESA" ? ["#FF4500", "#10B981"] : ["#FFA500", "#3B82F6"]
    }));

    const anillosImpactoData = filtrados.map((el) => ({
      lat: el.latitud,
      lng: el.longitud,
      color: el.tipo === "EMPRESA" ? "#10B981" : "#3B82F6",
      maxR: 10,
      propagationSpeed: 3,
      repeatPeriod: 1200
    }));

    const puntosGlobe = filtrados.map((el) => ({
      lat: el.latitud,
      lng: el.longitud,
      color: el.tipo === "EMPRESA" ? "#10B981" : "#3B82F6",
      nombre: el.nombre,
      direccion: el.direccion,
      icono: el.tipo === "EMPRESA" ? "🏢" : "👷"
    }));

    globeInstanceRef.current
      .arcsData(meteoritosData)
      .ringsData(anillosImpactoData)
      .htmlElementsData(puntosGlobe);

  }, [elementos, filtro3D]);

  const totalFiltrados = elementos.filter((i) => {
    if (filtro3D === "EMPRESAS") return i.tipo === "EMPRESA";
    if (filtro3D === "EMPLEADOS") return i.tipo === "EMPLEADO_CAMPO";
    return true;
  }).length;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "20px", left: "20px", right: "20px", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", pointerEvents: "none" }}>
        <button
          onClick={onVolver2D}
          style={{
            pointerEvents: "auto",
            backgroundColor: "#3B82F6",
            color: "#FFF",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.5)"
          }}
        >
          <MapIcon size={18} /> Volver a Mapa 2D
        </button>

        <div style={{
          pointerEvents: "auto",
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          border: "1px solid #334155",
          padding: "4px",
          borderRadius: "10px",
          display: "flex",
          gap: "4px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}>
          <button
            onClick={() => setFiltro3D("TODOS")}
            style={{
              backgroundColor: filtro3D === "TODOS" ? "#334155" : "transparent",
              color: "#FFF",
              border: "none",
              padding: "7px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            <Layers size={14} /> Todos ({elementos.length})
          </button>

          <button
            onClick={() => setFiltro3D("EMPRESAS")}
            style={{
              backgroundColor: filtro3D === "EMPRESAS" ? "#059669" : "transparent",
              color: filtro3D === "EMPRESAS" ? "#FFF" : "#34D399",
              border: "none",
              padding: "7px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            🏢 Empresas ({elementos.filter(e => e.tipo === "EMPRESA").length})
          </button>

          <button
            onClick={() => setFiltro3D("EMPLEADOS")}
            style={{
              backgroundColor: filtro3D === "EMPLEADOS" ? "#2563EB" : "transparent",
              color: filtro3D === "EMPLEADOS" ? "#FFF" : "#60A5FA",
              border: "none",
              padding: "7px 14px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            👷 Empleados ({elementos.filter(e => e.tipo === "EMPLEADO_CAMPO").length})
          </button>
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        backgroundColor: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(8px)",
        color: "#FFF",
        padding: "8px 18px",
        borderRadius: "30px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        border: "1px solid #334155",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F59E0B" }}>
          <Flame size={16} />
          <span>Meteoritos Visibles: <strong>{totalFiltrados}</strong></span>
        </div>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export const MapaGeolocalizacion: React.FC<Props> = ({ darkMode = true, puntoEnfocado }) => {
  const [elementos, setElementos] = useState<ElementoMap[]>([]);
  const [totalEmpresas, setTotalEmpresas] = useState<number>(0);
  const [totalEmpleadosCampo, setTotalEmpleadosCampo] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);
  const [modoGlobo3D, setModoGlobo3D] = useState<boolean>(false);

  const [regionesDinamicas, setRegionesDinamicas] = useState<RegionDinamica[]>([]);
  const [sidebarAbierta, setSidebarAbierta] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>("");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<ElementoMap | null>(null);

  // 🚗 ESTADOS DE LA SIMULACIÓN DE VIAJE GPS EN TIEMPO REAL
  const [simulando, setSimulando] = useState<boolean>(false);
  const [progresoViaje, setProgresoViaje] = useState<number>(0); // 0 a 100%
  const [posicionSimulada, setPosicionSimulada] = useState<[number, number] | null>(null);
  const [puntosRutaSimulada, setPuntosRutaSimulada] = useState<[number, number][]>([]);
  const [empleadoEnViaje, setEmpleadoEnViaje] = useState<ElementoMap | null>(null);
  const [destinoViaje, setDestinoViaje] = useState<ElementoMap | null>(null);
  const [distanciaRestanteKm, setDistanciaRestanteKm] = useState<number>(0);

  const [puntoNavegacionManual, setPuntoNavegacionManual] = useState<PuntoEnfocado | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const centroPorDefecto: [number, number] = [-31.4167, -64.1833];

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

  // 🚗 LÓGICA DEL MOTOR DE SIMULACIÓN DE VIAJE PASO A PASO
  const iniciarSimulacionViaje = (empleado: ElementoMap) => {
    // Buscar la empresa más cercana como destino
    const empresasList = elementos.filter((e) => e.tipo === "EMPRESA");
    if (empresasList.length === 0) {
      alert("No hay empresas cargadas para simular el destino.");
      return;
    }

    let empresaDestino = empresasList[0];
    let menorDistancia = Infinity;

    empresasList.forEach((emp) => {
      const d = calcularDistanciaKm(empleado.latitud, empleado.longitud, emp.latitud, emp.longitud);
      if (d < menorDistancia) {
        menorDistancia = d;
        empresaDestino = emp;
      }
    });

    // Crear 50 puntos intermedios en la ruta simulada
    const pasos = 50;
    const ruta: [number, number][] = [];
    for (let i = 0; i <= pasos; i++) {
      const ratio = i / pasos;
      const latIntermedia = empleado.latitud + (empresaDestino.latitud - empleado.latitud) * ratio;
      const lngIntermedia = empleado.longitud + (empresaDestino.longitud - empleado.longitud) * ratio;
      ruta.push([latIntermedia, lngIntermedia]);
    }

    setEmpleadoEnViaje(empleado);
    setDestinoViaje(empresaDestino);
    setPuntosRutaSimulada(ruta);
    setPosicionSimulada(ruta[0]);
    setProgresoViaje(0);
    setSimulando(true);

    // Hacer zoom sobre el inicio del trayecto
    setPuntoNavegacionManual({
      lat: empleado.latitud,
      lng: empleado.longitud,
      zoom: 14,
      timestamp: Date.now()
    });
  };

  // Cronómetro de animación de movimiento GPS
  useEffect(() => {
    if (!simulando || puntosRutaSimulada.length === 0 || !destinoViaje) return;

    let indexActual = 0;
    const totalPasos = puntosRutaSimulada.length;

    const interval = setInterval(() => {
      indexActual++;
      if (indexActual < totalPasos) {
        const nuevaPos = puntosRutaSimulada[indexActual];
        setPosicionSimulada(nuevaPos);
        setProgresoViaje(Math.round((indexActual / (totalPasos - 1)) * 100));

        const distRestante = calcularDistanciaKm(nuevaPos[0], nuevaPos[1], destinoViaje.latitud, destinoViaje.longitud);
        setDistanciaRestanteKm(distRestante);
      } else {
        clearInterval(interval);
        setSimulando(false);
        alert(`🎉 ¡${empleadoEnViaje?.nombre} llegó exitosamente a la sede ${destinoViaje.nombre}!`);
      }
    }, 250); // Mueve el vehículo cada 250ms

    return () => clearInterval(interval);
  }, [simulando, puntosRutaSimulada, destinoViaje, empleadoEnViaje]);

  const detenerSimulacion = () => {
    setSimulando(false);
    setPosicionSimulada(null);
    setPuntosRutaSimulada([]);
    setEmpleadoEnViaje(null);
    setDestinoViaje(null);
  };

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

      {/* RENDERIZADO DEL GLOBO 3D INTERACTIVO */}
      {modoGlobo3D ? (
        <VisorGlobo3DPro elementos={elementos} onVolver2D={() => setModoGlobo3D(false)} />
      ) : (
        <>
          {/* BARRA SUPERIOR DE CONTROLES */}
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

            <button
              type="button"
              onClick={() => setModoGlobo3D(true)}
              style={{ pointerEvents: "auto", backgroundColor: "#8B5CF6", color: "#FFF", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)" }}
            >
              <Globe2 size={16} /> Globo 3D
            </button>

            <button type="button" onClick={cargarDatosGeolocalizados} disabled={cargando} style={{ pointerEvents: "auto", backgroundColor: "#1E293B", color: "#FFF", border: "1px solid #334155", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
              <RefreshCw size={15} className={cargando ? "icon-spin" : ""} />
            </button>
          </div>

          {/* 🚗 CARTEL DE PANEL FLOTANTE EN VIVO CUANDO LA SIMULACIÓN DE TRAYECTO ESTÁ ACTIVA */}
          {simulando && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 1000,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid #EF4444",
              borderRadius: "12px",
              padding: "12px 18px",
              color: "#FFF",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
            }}>
              <Navigation2 size={24} color="#EF4444" className="icon-pulse" />
              <div>
                <strong style={{ fontSize: "0.88rem", display: "block", color: "#F8FAFC" }}>
                  🚘 En Viaje: {empleadoEnViaje?.nombre} ➔ {destinoViaje?.nombre}
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                  Progreso: <strong style={{ color: "#38BDF8" }}>{progresoViaje}%</strong> | Falta: <strong style={{ color: "#EF4444" }}>{distanciaRestanteKm} KM</strong>
                </span>
              </div>
              <button
                onClick={detenerSimulacion}
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
                  gap: "4px"
                }}
              >
                <Square size={12} /> Detener
              </button>
            </div>
          )}

          {/* PANEL LATERAL DE BÚSQUEDA */}
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

                      {/* 🚘 BOTÓN PARA DISPARAR LA SIMULACIÓN DE TRAYECTO SI ES EMPLEADO */}
                      {item.tipo === "EMPLEADO_CAMPO" && (
                        <button
                          onClick={() => iniciarSimulacionViaje(item)}
                          disabled={simulando}
                          style={{
                            marginTop: "6px",
                            width: "100%",
                            backgroundColor: "#2563EB",
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
                          <Play size={12} /> Simular Viaje a Sede
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAPA LEAFLET 2D CON TRAYECTORIA Y VEHÍCULO SIMULADO EN VIVO */}
          <MapContainer
            center={puntoCamaraActual && puntoCamaraActual.lat ? [puntoCamaraActual.lat, puntoCamaraActual.lng] : centroPorDefecto}
            zoom={puntoCamaraActual && puntoCamaraActual.zoom ? puntoCamaraActual.zoom : 11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapController punto={puntoCamaraActual || null} />

            {/* 🛣️ RENDERIZADO DE RUTA EN VIVO DEL VEHÍCULO EN TRAYECTO */}
            {simulando && puntosRutaSimulada.length > 0 && (
              <>
                <Polyline
                  positions={puntosRutaSimulada}
                  pathOptions={{ color: "#EF4444", weight: 4, opacity: 0.8, dashArray: "6, 8" }}
                />
                {posicionSimulada && (
                  <Marker position={posicionSimulada} icon={iconoVehiculoSimulado}>
                    <Popup>
                      <div style={{ padding: "4px", fontWeight: "bold" }}>
                        🚘 {empleadoEnViaje?.nombre} (En camino)<br />
                        <small style={{ color: "#EF4444" }}>Falta: {distanciaRestanteKm} KM</small>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </>
            )}

            {/* RADIO Y MATRIZ DE PROXIMIDAD SI HAY EMPRESA SELECCIONADA */}
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
                  ref={(ref) => (markerRefs.current[key] = ref)}
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
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default MapaGeolocalizacion;