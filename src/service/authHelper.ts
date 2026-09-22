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

        const rolUsuario = usuario.rol ? usuario.rol.trim().toUpperCase() : "";

        if (rolUsuario === "ADMINISTRADOR") {
            return true;
        }

        const permisos: string[] = usuario.permisos || [];
        return permisos.includes(permisoBuscado);
    } catch (error) {
        console.error("Error al evaluar permisos:", error);
        return false;
    }
};
