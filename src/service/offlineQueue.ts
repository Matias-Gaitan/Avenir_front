
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

export function esErrorDeRed(err: any): boolean {
    return !!err?.request && !err?.response;
}

export function formatearFechaLocalISO(fecha: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
}
