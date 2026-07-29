interface UsuarioSesion {
    username?: string;
    rol?: string;
    permisos?: string[];
}

export const tienePermiso = (permisoBuscado: string): boolean => {
    try {
        const usuarioStorage = localStorage.getItem("usuario");
        if (!usuarioStorage) return false;

        const usuario: UsuarioSesion = JSON.parse(usuarioStorage);

        // 🌟 EVALUACIÓN SUPREMA: Normalizamos a mayúsculas para evitar fallos por minúsculas
        const rolUsuario = usuario.rol ? usuario.rol.trim().toUpperCase() : "";

        if (rolUsuario === "ADMINISTRADOR") {
            return true; // Acceso total habilitado
        }

        // Para el resto de los roles, se evalúan los permisos otorgados
        const permisos: string[] = usuario.permisos || [];
        return permisos.includes(permisoBuscado);
    } catch (error) {
        console.error("Error al evaluar permisos:", error);
        return false;
    }
};