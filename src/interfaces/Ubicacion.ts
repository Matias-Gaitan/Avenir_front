export interface UbicacionGeografica {
  pais?: string;
  provincia?: string;
  ciudad?: string;
  barrio?: string;
  calle?: string;
  numero?: string;
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
}

export interface Usuario extends UbicacionGeografica {
  idUsuario?: number;
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasena?: string;
  estado?: boolean;
  activo?: boolean;
  tipoPersona?: { idTipoPersona: number; nombre: string };
}

export interface Empresa extends UbicacionGeografica {
  idEmpresa?: number;
  id?: number;
  cuit: string;
  nombre: string;
  direccion: string; // Se mantiene para fallback/compatibilidad
  activo?: boolean;
}