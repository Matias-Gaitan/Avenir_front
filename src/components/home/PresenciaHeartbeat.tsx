import { useEffect, useRef } from "react";
import api from "../../service/api";

const obtenerHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const detectarPlataforma = (): string => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return "iPhone";
    if (/Android/.test(ua)) return "Android";
    return "PC";
};

const calcularDistanciaMetros = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`, {
            headers: { "Accept-Language": "es" }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.display_name || null;
    } catch {
        return null;
    }
};

const CLAVE_ULTIMA_UBICACION = "avenir_ultima_ubicacion_conocida";

const PresenciaHeartbeat: React.FC = () => {
    const posicionActualRef = useRef<{ lat: number; lng: number; precision: number } | null>(null);
    const ultimaGeocodificadaRef = useRef<{ lat: number; lng: number; direccion: string; timestamp: number } | null>(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        const guardarUltimaUbicacionLocal = (lat: number, lng: number, direccion: string | null) => {
            try {
                localStorage.setItem(CLAVE_ULTIMA_UBICACION, JSON.stringify({
                    lat, lng, direccion, timestamp: new Date().toISOString()
                }));
            } catch { /* localStorage puede fallar en modo privado; no es critico */ }
        };

        const enviarHeartbeat = async () => {
            if (!navigator.onLine) return;

            const payload: Record<string, unknown> = { plataforma: detectarPlataforma() };
            const posicion = posicionActualRef.current;

            if (posicion) {
                payload.latitud = posicion.lat;
                payload.longitud = posicion.lng;

                const ultima = ultimaGeocodificadaRef.current;
                const haceMasDeDosMinutos = !ultima || (Date.now() - ultima.timestamp) > 120000;
                const seMovioMasDeCienMetros = ultima && calcularDistanciaMetros(ultima.lat, ultima.lng, posicion.lat, posicion.lng) > 100;

                if (haceMasDeDosMinutos || seMovioMasDeCienMetros) {
                    const direccion = await reverseGeocode(posicion.lat, posicion.lng);
                    if (direccion) {
                        ultimaGeocodificadaRef.current = { lat: posicion.lat, lng: posicion.lng, direccion, timestamp: Date.now() };
                        payload.direccionAproximada = direccion;
                        guardarUltimaUbicacionLocal(posicion.lat, posicion.lng, direccion);
                    }
                } else if (ultima) {
                    payload.direccionAproximada = ultima.direccion;
                    guardarUltimaUbicacionLocal(posicion.lat, posicion.lng, ultima.direccion);
                }
            }

            api.post("/presencia/heartbeat", payload, obtenerHeaders()).catch(() => {
                if (posicionActualRef.current) {
                    const p = posicionActualRef.current;
                    const direccionConocida = ultimaGeocodificadaRef.current?.direccion || null;
                    guardarUltimaUbicacionLocal(p.lat, p.lng, direccionConocida);
                }
            });
        };

        enviarHeartbeat();
        const intervalo = setInterval(enviarHeartbeat, 20000);

        const alVolverAEstarVisible = () => { if (document.visibilityState === "visible") enviarHeartbeat(); };
        document.addEventListener("visibilitychange", alVolverAEstarVisible);
        window.addEventListener("online", enviarHeartbeat);

        let watchId: number | null = null;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    posicionActualRef.current = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        precision: pos.coords.accuracy
                    };
                },
                () => {
                    if (posicionActualRef.current) {
                        const p = posicionActualRef.current;
                        const direccionConocida = ultimaGeocodificadaRef.current?.direccion || null;
                        guardarUltimaUbicacionLocal(p.lat, p.lng, direccionConocida);
                    }
                },
                { enableHighAccuracy: false, maximumAge: 15000, timeout: 10000 }
            );
        }

        const alPerderConexion = () => {
            const p = posicionActualRef.current;
            if (p) {
                const direccionConocida = ultimaGeocodificadaRef.current?.direccion || null;
                guardarUltimaUbicacionLocal(p.lat, p.lng, direccionConocida);
            }
        };
        window.addEventListener("offline", alPerderConexion);

        return () => {
            clearInterval(intervalo);
            document.removeEventListener("visibilitychange", alVolverAEstarVisible);
            window.removeEventListener("online", enviarHeartbeat);
            window.removeEventListener("offline", alPerderConexion);
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return null;
};

export default PresenciaHeartbeat;
