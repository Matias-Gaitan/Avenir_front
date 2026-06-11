export interface Usuario{
    id?: number,
    nombre: string,
    apellido: string,
    email: string,
    contrasena: string,
    activo: boolean,
    tipoPersona: string
}