export interface ChecklistItemTarea {
    idItem: number;
    tipo: "INSUMO" | "PASO";
    descripcion: string;
    completado: boolean;
    orden?: number;
}

export interface TareaAsignada {
    idTarea: number;
    empresa: { idEmpresa: number; nombre: string };
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string };
    descripcionTarea: string;
    fecha: string;
    direccionExacta?: string;
    barrioZona?: string;
    estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | string;
    activo?: boolean;
    checklist: ChecklistItemTarea[];
}
