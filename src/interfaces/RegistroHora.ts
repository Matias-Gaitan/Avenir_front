
export interface RegistroHora {
    idRegistro?: number;
    empresa: { idEmpresa: number; nombre: string; cuit: string };
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string };
    fecha: string;
    horasDedicadas: number;
    tareasRealizadas: string;
    generadoAutomaticamente?: boolean;
}

export interface RegistroHoraPayload {
    idEmpresa: number;
    idUsuario: number;
    fecha: string;
    horasDedicadas: number;
    tareasRealizadas: string;
}
