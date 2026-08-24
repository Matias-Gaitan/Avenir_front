import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

// 🌟 Nombre sin acentos para evitar el SyntaxError
export interface UbicacionSeleccionada {
  direccionCompleta: string;
  pais: string;
  provincia: string;
  ciudad: string;
  barrio: string;
  calle: string;
  numero: string;
  latitud: number;
  longitud: number;
}

interface Props {
  value?: string;
  onSelectAddress: (data: UbicacionSeleccionada) => void;
  placeholder?: string;
}

export const AddressAutocomplete: React.FC<Props> = ({
  value = "",
  onSelectAddress,
  placeholder = "Escribí una dirección..."
}) => {
  const [query, setQuery] = useState(value);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 3) {
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5&countrycodes=ar`
        );
        const data = await response.json();
        setSugerencias(data || []);
        setMostrarDropdown(true);
      } catch (error) {
        console.error("Error buscando dirección:", error);
      } finally {
        setCargando(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSeleccionar = (item: any) => {
    const addr = item.address || {};

    const datosFormateados: UbicacionSeleccionada = {
      direccionCompleta: item.display_name,
      pais: addr.country || "Argentina",
      provincia: addr.state || addr.region || "",
      ciudad: addr.city || addr.town || addr.village || addr.municipality || "",
      barrio: addr.suburb || addr.neighbourhood || addr.quarter || "",
      calle: addr.road || addr.street || "",
      numero: addr.house_number || "",
      latitud: parseFloat(item.lat),
      longitud: parseFloat(item.lon)
    };

    setQuery(item.display_name);
    setMostrarDropdown(false);
    onSelectAddress(datosFormateados);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMostrarDropdown(true);
          }}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "10px 38px 10px 12px",
            borderRadius: "6px",
            backgroundColor: "#1E293B",
            border: "1px solid #334155",
            color: "#F8FAFC",
            fontSize: "0.875rem",
            outline: "none"
          }}
        />
        <div style={{ position: "absolute", right: "12px", color: "#38BDF8", display: "flex", alignItems: "center" }}>
          {cargando ? <Loader2 size={18} className="icon-spin-hover" /> : <MapPin size={18} />}
        </div>
      </div>

      {mostrarDropdown && sugerencias.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "#0F172A",
            border: "1px solid #334155",
            borderRadius: "6px",
            marginTop: "4px",
            padding: 0,
            listStyle: "none",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }}
        >
          {sugerencias.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSeleccionar(item)}
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #1E293B",
                cursor: "pointer",
                fontSize: "0.82rem",
                color: "#E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E293B")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <MapPin size={14} color="#10B981" style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};