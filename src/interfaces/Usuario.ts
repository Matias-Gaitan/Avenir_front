export interface Usuario {
    idUsuario?: number,
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    activo: boolean,
    tipoPersona: { idTipoPersona: number } // <-- ESTE ES EL CAMBIO
}