import api from './api';

// 🌟 El "type" acá es OBLIGATORIO para que Vite no busque exports en runtime
import type {
  IPERFormulario,
  TipoRiesgo,
  CategoriaRiesgo,
  CausaRiesgo,
  Estado,
  ProbabilidadPrioridad,
} from '../types/iper';

// ... resto de tus endpoints ...

// ==========================================
// 1. TIPO DE RIESGO
// ==========================================

export const getTiposRiesgo = async (): Promise<TipoRiesgo[]> => {
  const response = await api.get('/tipo-riesgo');
  return response.data;
};

export const getTiposRiesgoActivos = async (): Promise<TipoRiesgo[]> => {
  const response = await api.get('/tipo-riesgo/activos');
  return response.data;
};

export const crearTipoRiesgo = async (data: TipoRiesgo): Promise<TipoRiesgo> => {
  const response = await api.post('/tipo-riesgo', data);
  return response.data;
};

export const actualizarTipoRiesgo = async (id: number, data: TipoRiesgo): Promise<TipoRiesgo> => {
  const response = await api.put(`/tipo-riesgo/${id}`, data);
  return response.data;
};

export const desactivarTipoRiesgo = async (id: number): Promise<void> => {
  await api.patch(`/tipo-riesgo/${id}/desactivar`);
};

// ==========================================
// 2. CATEGORÍA DE RIESGO
// ==========================================

export const getCategoriasRiesgo = async (): Promise<CategoriaRiesgo[]> => {
  const response = await api.get('/categoria-riesgo');
  return response.data;
};

export const getCategoriasRiesgoActivas = async (): Promise<CategoriaRiesgo[]> => {
  const response = await api.get('/categoria-riesgo/activos');
  return response.data;
};

export const crearCategoriaRiesgo = async (data: CategoriaRiesgo): Promise<CategoriaRiesgo> => {
  const response = await api.post('/categoria-riesgo', data);
  return response.data;
};

export const actualizarCategoriaRiesgo = async (id: number, data: CategoriaRiesgo): Promise<CategoriaRiesgo> => {
  const response = await api.put(`/categoria-riesgo/${id}`, data);
  return response.data;
};

export const desactivarCategoriaRiesgo = async (id: number): Promise<void> => {
  await api.patch(`/categoria-riesgo/${id}/desactivar`);
};

// ==========================================
// 3. CAUSA DE RIESGO
// ==========================================

export const getCausasRiesgo = async (): Promise<CausaRiesgo[]> => {
  const response = await api.get('/causa-riesgo');
  return response.data;
};

export const getCausasRiesgoActivas = async (): Promise<CausaRiesgo[]> => {
  const response = await api.get('/causa-riesgo/activos');
  return response.data;
};

export const crearCausaRiesgo = async (data: CausaRiesgo): Promise<CausaRiesgo> => {
  const response = await api.post('/causa-riesgo', data);
  return response.data;
};

export const actualizarCausaRiesgo = async (id: number, data: CausaRiesgo): Promise<CausaRiesgo> => {
  const response = await api.put(`/causa-riesgo/${id}`, data);
  return response.data;
};

export const desactivarCausaRiesgo = async (id: number): Promise<void> => {
  await api.patch(`/causa-riesgo/${id}/desactivar`);
};

// ==========================================
// 4. ESTADOS
// ==========================================

export const getEstados = async (): Promise<Estado[]> => {
  const response = await api.get('/estado');
  return response.data;
};

export const getEstadosActivos = async (): Promise<Estado[]> => {
  const response = await api.get('/estado/activos');
  return response.data;
};

export const crearEstado = async (data: Estado): Promise<Estado> => {
  const response = await api.post('/estado', data);
  return response.data;
};

export const actualizarEstado = async (id: number, data: Estado): Promise<Estado> => {
  const response = await api.put(`/estado/${id}`, data);
  return response.data;
};

export const desactivarEstado = async (id: number): Promise<void> => {
  await api.patch(`/estado/${id}/desactivar`);
};

// ==========================================
// 5. PROBABILIDAD / PRIORIDAD
// ==========================================

export const getProbabilidades = async (): Promise<ProbabilidadPrioridad[]> => {
  const response = await api.get('/probabilidad-prioridad');
  return response.data;
};

export const getProbabilidadesActivas = async (): Promise<ProbabilidadPrioridad[]> => {
  const response = await api.get('/probabilidad-prioridad/activos');
  return response.data;
};

export const crearProbabilidad = async (data: ProbabilidadPrioridad): Promise<ProbabilidadPrioridad> => {
  const response = await api.post('/probabilidad-prioridad', data);
  return response.data;
};

export const actualizarProbabilidad = async (id: number, data: ProbabilidadPrioridad): Promise<ProbabilidadPrioridad> => {
  const response = await api.put(`/probabilidad-prioridad/${id}`, data);
  return response.data;
};

export const desactivarProbabilidad = async (id: number): Promise<void> => {
  await api.patch(`/probabilidad-prioridad/${id}/desactivar`);
};

// ==========================================
// 6. CRUD FORMULARIO IPER
// ==========================================

// Obtener todos los formularios
export const getFormulariosIPER = async (): Promise<IPERFormulario[]> => {
  const response = await api.get('/iper');
  return response.data;
};

// Obtener sólo activos
export const getFormulariosIPERActivos = async (): Promise<IPERFormulario[]> => {
  const response = await api.get('/iper/activos');
  return response.data;
};

// Obtener por ID
export const getIPERPorId = async (id: number): Promise<IPERFormulario> => {
  const response = await api.get(`/iper/${id}`);
  return response.data;
};

// Obtener por empresa
export const getIPERPorEmpresa = async (empresa: string): Promise<IPERFormulario[]> => {
  const response = await api.get(`/iper/empresa/${empresa}`);
  return response.data;
};

// Guardar nuevo formulario IPER
export const crearIPER = async (iperData: IPERFormulario): Promise<IPERFormulario> => {
  const response = await api.post('/iper', iperData);
  return response.data;
};

// Editar formulario existente
export const actualizarIPER = async (id: number, iperData: IPERFormulario): Promise<IPERFormulario> => {
  const response = await api.put(`/iper/${id}`, iperData);
  return response.data;
};

// Dar de baja (Soft Delete)
export const darDeBajaIPER = async (id: number): Promise<void> => {
  await api.patch(`/iper/${id}/desactivar`);
};