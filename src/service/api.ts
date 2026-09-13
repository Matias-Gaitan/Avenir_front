import axios from "axios";


// En producción (Vercel) se define VITE_API_BASE_URL apuntando al backend de Railway.
// En desarrollo local, si no está definida, usa la IP de la red local para poder
// probar desde el celular.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.1.3:8082/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor: Agrega el Bearer Token automáticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;