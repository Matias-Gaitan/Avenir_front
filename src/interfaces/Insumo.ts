export interface Insumo {
    idInsumo?: number;
    nombre: string;
    categoria: "EPP" | "SEÑALIZACION" | "EMERGENCIA" | "MEDICION" | "HIGIENE" | string;
    unidadMedida: string;
    stockActual: number;
    stockMinimo: number;
    costoUnitario: number;
    activo?: boolean;
}

export interface EntregaInsumo {
    idEntrega?: number;
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string };
    insumo: Insumo;
    cantidad: number;
    fechaEntrega: string;
    observaciones?: string;
}
