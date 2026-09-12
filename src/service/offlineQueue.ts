// Cola de fichajes (Ingreso/Egreso) pendientes de sincronizar cuando no hay conexión.
// Se guarda en localStorage para sobrevivir a que se cierre la app/pestaña mientras
// el dispositivo está sin señal; se vacía sola apenas vuelve la conexión.

export interface FichajePendiente {
    id: string;
    tipo: "ingreso" | "egreso";
    payload: Record<string, unknown>;
    creadoEn: string;
}

const CLAVE = "avenir_fichajes_pendientes";

export function obtenerPendientes(): FichajePendiente[] {
    try {
        const raw = localStorage.getItem(CLAVE);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function guardar(lista: FichajePendiente[]) {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function encolarFichaje(tipo: "ingreso" | "egreso", payload: Record<string, unknown>): FichajePendiente {
    const item: FichajePendiente = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tipo,
        payload,
        creadoEn: new Date().toISOString()
    };
    const lista = obtenerPendientes();
    lista.push(item);
    guardar(lista);
    return item;
}

export function quitarPendiente(id: string) {
    guardar(obtenerPendientes().filter((p) => p.id !== id));
}

export function contarPendientes(): number {
    return obtenerPendientes().length;
}

// Un fallo de red (sin respuesta del servidor) se trata como "estamos offline";
// un error real del backend (validaciones, permisos) NO se debe encolar de nuevo.
export function esErrorDeRed(err: any): boolean {
    return !!err?.request && !err?.response;
}
