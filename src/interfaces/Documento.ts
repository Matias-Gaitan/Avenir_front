export interface Documento {
    idDocumento?: number;
    nombre: string;
    categoria: "MATRICULACION" | "APTO_MEDICO" | "SEGURO_ART" | "CERTIFICADO_CAPACITACION" | "CONTRATO" | "PROTOCOLO" | "OTRO" | string;
    usuario?: { idUsuario: number; nombre: string; apellido: string } | null;
    empresa?: { idEmpresa: number; nombre: string } | null;
    fechaVencimiento?: string | null;
    versionActual: number;
    activo?: boolean;
    estadoVencimiento?: "VENCIDO" | "POR_VENCER" | "VIGENTE" | "SIN_VENCIMIENTO" | string;
}

export interface DocumentoVersion {
    idVersion?: number;
    numeroVersion: number;
    nombreArchivo: string;
    tipoContenido?: string;
    fechaCarga: string;
    subidoPor?: string;
}
