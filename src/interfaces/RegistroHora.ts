// Esta interfaz es para leer los datos que vienen del backend
export interface RegistroHora {
    idRegistro?: number;
    empresa: { idEmpresa: number; nombre: string; cuit: string };
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string };
    fecha: string;
    horasDedicadas: number;
    tareasRealizadas: string;
}

// Esta interfaz es para enviar los datos al backend (Payload)
export interface RegistroHoraPayload {
    idEmpresa: number;
    idUsuario: number;
    fecha: string;
    horasDedicadas: number;
    tareasRealizadas: string;
}