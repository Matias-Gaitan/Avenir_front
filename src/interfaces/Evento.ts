export interface Evento {
    idEvento?: number;
    titulo: string;
    fecha: string;
    hora?: string | null;
    tipo: "AUDITORIA" | "CAPACITACION" | "REUNION" | "MANTENIMIENTO" | "OTRO" | string;
    descripcion?: string;
    recordatorio?: boolean;
    usuario?: { idUsuario: number; nombre: string; apellido: string } | null;
    empresa?: { idEmpresa: number; nombre: string } | null;
}
