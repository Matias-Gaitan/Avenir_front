export interface RegistroAsistencia {
    idAsistencia?: number;
    usuario: { idUsuario: number; nombre: string; apellido: string; email: string };
    fecha: string;
    horaIngreso: string;
    horaEgreso: string | null;
    latitudIngreso?: number | null;
    longitudIngreso?: number | null;
    latitudEgreso?: number | null;
    longitudEgreso?: number | null;
    observaciones?: string;
}
