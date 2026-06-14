export interface Usuario {
    id?: number,
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    activo: boolean,
    tipoPersona: { idTipoPersona: number } // <-- ESTE ES EL CAMBIO
}