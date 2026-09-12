export interface ArticuloAyuda {
    modulo: string;
    titulo: string;
    pasos: string[];
}

// Relaciona cada pantalla del sistema (vistaActiva en home.tsx) con su nombre de
// módulo en el Centro de Ayuda, para poder mostrar la ayuda contextual correcta.
export const vistaAModulo: Record<string, string> = {
    "usuarios": "Usuarios",
    "permisos-usuario": "Permisos Empleado",
    "roles": "Roles",
    "empresas": "Empresas",
    "horarios": "Horarios",
    "asistencia": "Ingreso y Egreso",
    "insumos": "Insumos",
    "viaticos": "Viáticos",
    "tareas": "Asignación de Tareas",
    "documentos": "Documentos",
    "cronograma": "Cronograma",
    "iper": "IPER",
    "iper-form": "IPER",
    "iper-historial": "IPER",
    "ats": "ATS",
    "mapa": "Mapa 2D",
    "mi-perfil": "Mi Perfil",
    "estado-sistema": "Estado del Sistema",
    "presencia": "Usuarios Conectados"
};

export const articulosAyuda: ArticuloAyuda[] = [
    // ───────────────────────── USUARIOS ─────────────────────────
    {
        modulo: "Usuarios",
        titulo: "Aprobar o habilitar un usuario nuevo",
        pasos: [
            "Un usuario nuevo se registra desde \"Registrarse\" en el Login y su cuenta queda PENDIENTE hasta que un administrador la habilita.",
            "Andá a Usuarios, filtrá por \"Pendientes de Aprobación\" para encontrarlo rápido.",
            "Hacé clic en \"Editar\", asignale un Rol (Empleado, Gerente, Administrador) y guardá: al tener un rol asignado y quedar activo, ya puede iniciar sesión.",
            "Si necesitás crear directamente una cuenta de Administrador, se usa la clave de acceso maestra al registrarse; esa cuenta nace activa sin necesitar aprobación."
        ]
    },
    {
        modulo: "Usuarios",
        titulo: "Editar los datos de un usuario (nombre, dirección, rol)",
        pasos: [
            "En el listado de Usuarios, hacé clic en \"Editar\" sobre la fila del usuario.",
            "Podés cambiar nombre, apellido, rol y la dirección: al escribir en el campo de dirección aparecen sugerencias y, al elegir una, se guardan automáticamente barrio, ciudad y coordenadas.",
            "Guardá los cambios. Si en cambio el usuario quiere editar sus PROPIOS datos, lo hace desde \"Mi Perfil\", no desde acá."
        ]
    },
    {
        modulo: "Usuarios",
        titulo: "Dar de baja o reactivar un usuario",
        pasos: [
            "En el listado, el botón junto a cada usuario dice \"Baja\" si está activo, o \"Alta\" si ya está dado de baja.",
            "Dar de baja bloquea su acceso al sistema (no puede iniciar sesión) pero conserva todo su historial: horas, viáticos, tareas, documentos.",
            "No existe un borrado definitivo del usuario; la baja es la forma correcta de removerlo del sistema sin perder trazabilidad."
        ]
    },

    // ───────────────────────── PERMISOS EMPLEADO ─────────────────────────
    {
        modulo: "Permisos Empleado",
        titulo: "Dar un permiso puntual a un solo empleado (sin cambiarle el rol)",
        pasos: [
            "Andá a Permisos Empleado y seleccioná al empleado en el desplegable.",
            "Tildá \"Usar permisos personalizados para este usuario\": esto reemplaza los permisos de su rol por un set propio, elegido a mano.",
            "Marcá únicamente los permisos que necesitás darle, agrupados por módulo, y guardá. El resto de los empleados con ese mismo rol no se ven afectados.",
            "Ejemplo típico: darle APROBAR_VIATICOS solo a un empleado puntual, sin convertirlo en administrador ni darle el resto de los permisos de aprobación.",
            "Para que vuelva a usar los permisos normales de su rol, destildá la casilla y guardá de nuevo."
        ]
    },
    {
        modulo: "Permisos Empleado",
        titulo: "Definir si un empleado tiene horario laboral fijo",
        pasos: [
            "Andá a Permisos Empleado, seleccioná al empleado.",
            "En \"Horario Laboral Asignado\", tildá la casilla y escribí el horario (ej. \"Lunes a Viernes de 08:00 a 17:00\").",
            "Guardá el horario. Si el empleado no tiene un horario fijo (por ejemplo, trabaja por visitas sueltas), dejá la casilla destildada."
        ]
    },

    // ───────────────────────── ROLES ─────────────────────────
    {
        modulo: "Roles",
        titulo: "Crear un rol nuevo con sus permisos",
        pasos: [
            "Andá a Roles y escribí un nombre para el nuevo rol (ej. \"Supervisor\").",
            "Tildá los permisos por módulo que va a tener ese rol; usá \"Marcar Módulo\" para tildar todos los de una categoría de una sola vez, o \"Marcar Todo el Sistema\" para dárselos todos.",
            "Guardá el rol. Todo usuario al que le asignes ese rol hereda automáticamente esos permisos, salvo que tenga permisos personalizados propios (ver Permisos Empleado)."
        ]
    },
    {
        modulo: "Roles",
        titulo: "Editar los permisos de un rol existente",
        pasos: [
            "En el listado de Roles, elegí el rol y tildá o destildá los permisos que quieras cambiar.",
            "Guardá: el cambio impacta a TODOS los usuarios que tengan ese rol (excepto quienes tengan permisos personalizados propios)."
        ]
    },
    {
        modulo: "Roles",
        titulo: "Eliminar un rol",
        pasos: [
            "Un rol solo se puede eliminar si ningún usuario lo tiene asignado actualmente.",
            "Si el sistema no te deja eliminarlo, reasigná primero a los usuarios que lo usan a otro rol, y después eliminalo."
        ]
    },

    // ───────────────────────── EMPRESAS ─────────────────────────
    {
        modulo: "Empresas",
        titulo: "Cargar una empresa cliente con su ubicación",
        pasos: [
            "Andá a Empresas y completá el CUIT y el nombre.",
            "En el campo de dirección, empezá a escribir y elegí una opción del autocompletado: esto guarda automáticamente dirección, barrio, ciudad y coordenadas.",
            "Esa ubicación se reutiliza después en ATS, Ingreso y Egreso, y Asignación de Tareas para autocompletar direcciones, así no se vuelve a tipear."
        ]
    },
    {
        modulo: "Empresas",
        titulo: "Editar o dar de baja una empresa",
        pasos: [
            "En el listado, usá \"Editar\" para corregir datos o actualizar la dirección.",
            "Usá \"Dar de Baja\" cuando la empresa deja de ser cliente activo; no borra el historial de visitas, tareas o documentos ya cargados para ella.",
            "Una empresa dada de baja se puede reactivar (\"Dar de Alta\") en cualquier momento."
        ]
    },

    // ───────────────────────── HORARIOS ─────────────────────────
    {
        modulo: "Horarios",
        titulo: "Cómo se cargan y aprueban las horas trabajadas",
        pasos: [
            "El empleado NO carga las horas a mano: se calculan solas al marcar el egreso de una visita a una empresa (ver módulo Ingreso y Egreso).",
            "El registro queda en estado PENDIENTE hasta que alguien con permiso de aprobación (APROBAR_HORARIOS) lo apruebe o rechace desde Horarios.",
            "Solo quien tiene ese permiso ve además un formulario de carga manual, reservado para corregir casos puntuales (por ejemplo, trabajo administrativo sin visita a una empresa)."
        ]
    },

    // ───────────────────────── INGRESO Y EGRESO ─────────────────────────
    {
        modulo: "Ingreso y Egreso",
        titulo: "Fichar entrada y salida de una visita a una empresa",
        pasos: [
            "Al hacer login, el sistema pide tu ubicación (geolocalización) para poder calcular los kilómetros después; hay que aceptar el permiso del navegador.",
            "En Ingreso y Egreso, elegí (opcional) la empresa que vas a visitar y marcá \"Ingreso\".",
            "Al terminar la visita, marcá \"Egreso\": ahí se calculan solas las horas trabajadas y, si elegiste una empresa, el viático por kilómetros recorridos desde tu ubicación de login.",
            "No podés volver a marcar Ingreso si ya tenés uno abierto sin su Egreso correspondiente."
        ]
    },

    // ───────────────────────── INSUMOS ─────────────────────────
    {
        modulo: "Insumos",
        titulo: "Cargar un insumo nuevo al catálogo",
        pasos: [
            "Andá a Insumos → pestaña Catálogo y completá nombre, categoría, unidad, stock inicial, stock mínimo y costo unitario.",
            "Si la categoría que necesitás no existe, abrí el panel \"Categorías\" (arriba a la derecha), escribila y agregala antes de cargar el insumo."
        ]
    },
    {
        modulo: "Insumos",
        titulo: "Editar, dar de baja o reactivar un insumo o categoría",
        pasos: [
            "En la tabla del catálogo, usá \"Editar\" para corregir stock, costo o categoría de un insumo.",
            "Usá \"Dar de Baja\" para desactivarlo sin borrarlo (por ejemplo, si se descontinuó); podés filtrar por \"Dados de Baja\" para verlos y reactivarlos.",
            "Lo mismo aplica para las categorías desde el panel \"Categorías\": se pueden agregar y dar de baja."
        ]
    },
    {
        modulo: "Insumos",
        titulo: "Registrar la entrega de un insumo a un empleado",
        pasos: [
            "Andá a la pestaña \"Entregas a Empleados\", elegí el empleado, el insumo y la cantidad.",
            "Al guardar, el stock del insumo se descuenta automáticamente; la entrega queda registrada con fecha para trazabilidad de EPP."
        ]
    },

    // ───────────────────────── VIÁTICOS ─────────────────────────
    {
        modulo: "Viáticos",
        titulo: "Cómo se calculan los kilómetros y quién puede cargarlos a mano",
        pasos: [
            "Los kilómetros se calculan solos: se usa tu ubicación al hacer login como punto de partida y la ubicación de la empresa visitada como destino.",
            "El viático queda PENDIENTE hasta que alguien con permiso de aprobación (APROBAR_VIATICOS) lo valide, rechace o marque como pagado.",
            "Un empleado normal NO puede cargar ni editar kilómetros a mano; esto es intencional, para evitar que se carguen kilómetros falsos.",
            "Si necesitás habilitarle esa opción a alguien puntual, dale el permiso APROBAR_VIATICOS desde Permisos Empleado, sin necesidad de hacerlo administrador."
        ]
    },
    {
        modulo: "Viáticos",
        titulo: "Definir la tarifa por kilómetro de un empleado",
        pasos: [
            "Quien tiene permiso para editar usuarios ve, arriba de la pantalla de Viáticos, un formulario \"Tarifa por Kilómetro\".",
            "Elegí el empleado y escribí el nuevo valor por km; se usa automáticamente en el próximo viático que se le calcule (los ya generados no se recalculan solos)."
        ]
    },
    {
        modulo: "Viáticos",
        titulo: "Dar de baja o reactivar un registro de viático",
        pasos: [
            "Quien aprueba viáticos puede dar de baja un registro erróneo o duplicado sin borrarlo del historial.",
            "Se puede filtrar por \"Dados de Baja\" y reactivarlo si hizo falta por error."
        ]
    },

    // ───────────────────────── ASIGNACIÓN DE TAREAS ─────────────────────────
    {
        modulo: "Asignación de Tareas",
        titulo: "Asignar una tarea con checklist a un empleado",
        pasos: [
            "Andá a Asignación de Tareas, elegí el empleado y la empresa: la dirección y el barrio se autocompletan solos con los datos de esa empresa.",
            "Describí la tarea, tildá los insumos que va a necesitar llevar y agregá los pasos genéricos de preparación que quieras (por ejemplo \"Verificar EPP completo\").",
            "Al asignarla, el empleado la ve en \"Mis Tareas Asignadas\" y va tildando el checklist a medida que lo cumple; la tarea pasa sola de Pendiente a En Progreso y a Completada según el avance."
        ]
    },
    {
        modulo: "Asignación de Tareas",
        titulo: "Dar de baja una tarea asignada",
        pasos: [
            "Quien tiene permiso de eliminar tareas puede darla de baja desde \"Todas las Tareas Asignadas\" (por ejemplo, si se asignó por error o la visita se canceló).",
            "Se puede reactivar después si hizo falta."
        ]
    },

    // ───────────────────────── DOCUMENTOS ─────────────────────────
    {
        modulo: "Documentos",
        titulo: "Para qué se usa el módulo de Documentos",
        pasos: [
            "Es el archivo centralizado de la documentación legal y de cumplimiento de cada empleado o empresa: matriculación profesional, apto médico, seguro ART, certificados de capacitación, contratos y protocolos de seguridad.",
            "Sirve para tener todo a mano ante una auditoría o inspección, sin depender de carpetas físicas o archivos sueltos.",
            "Cada documento queda vinculado a la empresa y/o empleado correspondiente, según a quién le corresponda ese papel."
        ]
    },
    {
        modulo: "Documentos",
        titulo: "Subir un documento y sus nuevas versiones",
        pasos: [
            "Andá a Documentos, elegí la categoría (Apto Médico, Seguro ART, Certificado de Capacitación, etc.), completá los datos y adjuntá el archivo.",
            "Si un documento vence y hay que renovarlo (ej. un apto médico nuevo), subilo como nueva versión del mismo documento en vez de crear uno aparte: así se conserva el historial completo de versiones anteriores."
        ]
    },

    // ───────────────────────── CRONOGRAMA ─────────────────────────
    {
        modulo: "Cronograma",
        titulo: "Para qué se usa el Cronograma y cómo cargar un evento",
        pasos: [
            "Es la agenda compartida del equipo: auditorías, capacitaciones, reuniones y mantenimientos programados, cada uno con fecha, hora y descripción.",
            "Se puede vincular un evento a una empresa (ej. una auditoría en un cliente puntual) y/o a un empleado responsable.",
            "Andá a Cronograma, elegí el tipo de evento, completá los datos y activá el recordatorio si corresponde.",
            "Todo el equipo con permiso de ver el cronograma ve los mismos eventos, para coordinar visitas y evitar superposiciones."
        ]
    },

    // ───────────────────────── IPER ─────────────────────────
    {
        modulo: "IPER",
        titulo: "Cargar los catálogos base (tipos de riesgo, causas, etc.)",
        pasos: [
            "Andá a Parámetros IPER para cargar los catálogos reutilizables: tipos de riesgo, categorías de riesgo, causas y niveles de probabilidad/prioridad.",
            "Estos catálogos son los que después aparecen como opciones al completar un Formulario IPER; conviene cargarlos antes de empezar a hacer formularios."
        ]
    },
    {
        modulo: "IPER",
        titulo: "Completar el formulario IPER de una tarea",
        pasos: [
            "Andá a Formulario IPER y seguí el asistente paso a paso: datos generales, empresa, riesgo identificado (usando los catálogos cargados) y acciones correctivas.",
            "Al finalizar, el formulario se guarda y queda disponible para verlo o descargarlo desde Historial IPER."
        ]
    },

    // ───────────────────────── ATS ─────────────────────────
    {
        modulo: "ATS",
        titulo: "Completar un Análisis de Trabajo Seguro (ATS)",
        pasos: [
            "Andá a ATS Campo, elegí la empresa: la ubicación se autocompleta con la dirección guardada de esa empresa.",
            "Describí la tarea específica, el riesgo, la categoría, la causa y el nivel de criticidad.",
            "Agregá los pasos de la tarea con su peligro, riesgo/impacto y medida de control asociada, y guardá el análisis."
        ]
    },

    // ───────────────────────── MAPA 2D ─────────────────────────
    {
        modulo: "Mapa 2D",
        titulo: "Ver la ubicación de empresas y empleados",
        pasos: [
            "Andá a Mapa 2D para ver en el mapa las empresas cargadas y, si tenés el permiso correspondiente, la posición de los empleados.",
            "Podés hacer clic en un usuario o empresa desde sus respectivas pantallas para verlo directamente ubicado en el mapa."
        ]
    },

    // ───────────────────────── MI PERFIL ─────────────────────────
    {
        modulo: "Mi Perfil",
        titulo: "Editar mis propios datos",
        pasos: [
            "Andá a Mi Perfil para cambiar tu nombre, apellido, teléfono, dirección o email.",
            "Si querés cambiar tu contraseña, completá el campo de nueva contraseña; si lo dejás vacío, se mantiene la actual.",
            "Desde acá NO se puede cambiar el propio rol, tarifa por km ni el estado activo/inactivo; eso solo lo puede hacer un administrador desde Usuarios."
        ]
    },

    // ───────────────────────── ESTADO DEL SISTEMA ─────────────────────────
    {
        modulo: "Estado del Sistema",
        titulo: "Qué muestra esta pantalla",
        pasos: [
            "Es un panel informativo con el estado general del sistema, útil para verificar rápidamente que todo esté funcionando antes de una jornada de trabajo."
        ]
    },

    // ───────────────────────── USUARIOS CONECTADOS ─────────────────────────
    {
        modulo: "Usuarios Conectados",
        titulo: "Para qué sirve y qué límite real tiene",
        pasos: [
            "Muestra quién tiene la app abierta ahora mismo (celular o PC), avisando cada tanto \"sigo acá\" en segundo plano.",
            "Cuando alguien deja de avisar por más de 40 segundos, se lo marca como desconectado y aparece un aviso arriba.",
            "Importante: mientras un dispositivo esté realmente sin señal, no hay forma de saber en vivo qué está haciendo. Esto solo puede notar la AUSENCIA de aviso, no ver a alguien offline en tiempo real; recién se actualiza cuando ese dispositivo recupera conexión."
        ]
    }
];
