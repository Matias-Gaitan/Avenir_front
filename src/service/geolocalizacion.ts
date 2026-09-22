export interface UbicacionValidada {
    latitud: number;
    longitud: number;
    precision: number;
}

export function obtenerUbicacionValidada(opciones?: PositionOptions): Promise<UbicacionValidada> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Este navegador no soporta geolocalización. Probá con Chrome o Safari actualizados."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;

                if (typeof latitude !== "number" || typeof longitude !== "number" || isNaN(latitude) || isNaN(longitude)) {
                    reject(new Error("Las coordenadas recibidas no son válidas. Volvé a intentar."));
                    return;
                }
                if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || (latitude === 0 && longitude === 0)) {
                    reject(new Error("Las coordenadas recibidas están fuera de rango. Volvé a intentar."));
                    return;
                }

                resolve({ latitud: latitude, longitud: longitude, precision: accuracy });
            },
            (err) => {
                let mensaje = "No se pudo obtener tu ubicación actual.";
                if (err.code === err.PERMISSION_DENIED) {
                    mensaje = "Permiso de ubicación denegado. Habilitalo en la configuración del navegador (ícono de candado/ubicación en la barra de direcciones) y volvé a intentar.";
                } else if (err.code === err.TIMEOUT) {
                    mensaje = "Se agotó el tiempo esperando el GPS. Probá cerca de una ventana o al aire libre, con buena señal, y volvé a intentar.";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    mensaje = "No se pudo determinar tu posición. Verificá que el GPS/ubicación del dispositivo esté activado.";
                }
                reject(new Error(mensaje));
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...opciones }
        );
    });
}
