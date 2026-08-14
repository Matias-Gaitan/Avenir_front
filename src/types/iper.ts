// ==========================================
// INTERFACES PARA PARÁMETROS / CATÁLOGOS
// ==========================================

export interface CategoriaRiesgo {
  id?: number;
  nombre: string;
  activo?: boolean;
}

export interface CausaRiesgo {
  id?: number;
  nombre: string;
  estado?: boolean;
}

export interface Estado {
  id?: number;
  nombre: string;
  activo?: boolean;
}

export interface ProbabilidadPrioridad {
  id?: number;
  nombre: string;
  activo?: boolean;
}

export interface TipoRiesgo {
  id?: number;
  nombre: string;
  activo?: boolean;
}

// ==========================================
// INTERFAZ PRINCIPAL FORMULARIO IPER
// ==========================================

export interface IPERFormulario {
  id?: number;
  idresponsable: number;
  fecha?: string;
  turno?: string;
  empresa?: string;
  estado?: string;
  tipoRiesgo?: string;
  descripcionRiesgo?: string;
  causaRiesgo?: string;
  sector?: string;
  categoriaRiesgo?: string;
  nivelRiesgo?: string;
  existenMedidas?: boolean;
  descripcionMedidas?: string;
  impactoPotencialRiesgo?: string;
  probabilidadOcurrencia?: string;
  prioridadRiesgo?: string;
  accionesSugeridas?: string;
  responsableDeAcciones?: string;
  fechaAlternativaImplementacion?: string;
  riesgoEliminado?: string;
  impactoResidual?: string;
  comentario?: string;
  fechaCierre?: string;
  nombreArchivo?: string;
  contenidoArchivo?: string;
}