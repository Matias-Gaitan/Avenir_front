export interface RegistroViatico {
    idViatico?: number;
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string; tarifaPorKm?: number };
    empresa?: { idEmpresa: number; nombre: string } | null;
    fecha: string;
    kilometros: number;
    tarifaPorKmAplicada: number;
    montoAPagar: number;
    observaciones?: string;
    estado?: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "PAGADO" | string;
}
