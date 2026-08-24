import api from "./api";

export interface PasoAts {
  paso: number;
  descripcion: string;
  peligro: string;
  riesgo: string;
  medidaControl: string;
}

export interface AtsDTO {
  idAts?: number;
  empresaId: number;
  usuarioAuditorEmail: string;
  fechaRealizacion?: string;
  ubicacionSector: string;
  tareaARealizar: string;
  tipoRiesgoId: number;
  categoriaRiesgoId: number;
  causaRiesgoId: number;
  probabilidadId: number;
  estado?: string;
  pasosTarea: PasoAts[];
}

// 🟢 ENDPOINT POST: Guardar nuevo ATS
export const guardarAts = async (atsData: AtsDTO) => {
  const response = await api.post("/ats", atsData);
  return response.data;
};

// 🟢 ENDPOINT GET: Listar todos los ATS
export const listarAts = async (): Promise<AtsDTO[]> => {
  const response = await api.get("/ats");
  return response.data;
};