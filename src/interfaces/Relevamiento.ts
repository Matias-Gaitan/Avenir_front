import type { Empresa } from "./Empresa";

export interface TipoRiesgo {
    id: number;
    nombre: string;
    activo?: boolean;
}

export interface Hallazgo {
    idHallazgo?: number;
    tipoRiesgo?: TipoRiesgo | null;
    descripcion: string;
    estado: "ENCONTRADO" | "RESUELTO";
    fechaDeteccion: string;
    fechaResolucion?: string | null;
}

export interface ArchivoRelevamiento {
    idArchivo?: number;
    nombreArchivo: string;
    url: string;
    tipoContenido?: string;
    fechaCarga?: string;
}

export interface Relevamiento {
    idRelevamiento?: number;
    empresa: Empresa;
    tecnico?: { idUsuario: number; nombre: string; apellido: string } | null;
    fecha: string;
    observaciones?: string;
    estado: "PENDIENTE" | "EN_PROGRESO" | "CERRADO";
    activo?: boolean;
    hallazgos: Hallazgo[];
    archivos: ArchivoRelevamiento[];
}
