import React from 'react';
import { Check, X, Hash, Type } from 'lucide-react';

interface Props {
  contrasena: string;
}

export const PasswordMatrix: React.FC<Props> = ({ contrasena }) => {
  if (!contrasena) return null;

  const tieneMinimo = contrasena.length >= 6;
  const tieneNumero = /\d/.test(contrasena);
  const tieneMayus = /[A-Z]/.test(contrasena);

  return (
    <div
      style={{
        marginTop: "8px",
        padding: "12px 14px",
        backgroundColor: "#0B132B",
        borderRadius: "8px",
        border: "1px solid #1E293B",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
        boxSizing: "border-box",
        width: "100%"
      }}
    >
      {/* 🌟 Casillas de Validación Individual por Carácter */}
      <div style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        alignItems: "center",
        minHeight: "32px",
        maxHeight: "80px",
        overflowY: "auto"
      }}>
        {contrasena.split("").map((char, index) => {
          const esNumero = /\d/.test(char);
          const esMayus = /[A-Z]/.test(char);
          const esMinus = /[a-z]/.test(char);

          // 💡 Regla de validez del carácter:
          // Es válido si es número, mayúscula, o si ya se alcanzaron los 6 caracteres.
          const esCaracterValido = esNumero || esMayus || tieneMinimo;

          return (
            <div
              key={index}
              className="char-badge-anim"
              title={`Carácter ${index + 1}: ${esMayus ? 'Mayúscula (✓)' : esNumero ? 'Número (✓)' : esCaracterValido ? 'Válido (✓)' : 'Falta mayúscula/número o min 6 chars (✕)'}`}
              style={{
                width: "30px",
                height: "32px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: esCaracterValido ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                border: `1px solid ${esCaracterValido ? "#10B981" : "#EF4444"}`,
                color: esCaracterValido ? "#34D399" : "#F87171",
                transition: "all 0.2s ease"
              }}
            >
              {esCaracterValido ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <X size={14} strokeWidth={2.5} />
              )}
            </div>
          );
        })}
      </div>

      {/* 📊 Resumen Global de Reglas */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid #1E293B",
        paddingTop: "8px",
        fontSize: "0.75rem"
      }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: tieneMinimo ? "#34D399" : "#EF4444",
            fontWeight: "600"
          }}>
            <Check size={12} style={{ opacity: tieneMinimo ? 1 : 0.4 }} /> 6+ chars
          </span>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: tieneMayus ? "#34D399" : "#64748B",
            fontWeight: "600"
          }}>
            <Check size={12} style={{ opacity: tieneMayus ? 1 : 0.4 }} /> Mayús
          </span>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: tieneNumero ? "#34D399" : "#64748B",
            fontWeight: "600"
          }}>
            <Check size={12} style={{ opacity: tieneNumero ? 1 : 0.4 }} /> Núm
          </span>
        </div>

        <span style={{ color: "#64748B", fontWeight: "600", fontSize: "0.7rem" }}>
          {contrasena.length} / 6+
        </span>
      </div>
    </div>
  );
};