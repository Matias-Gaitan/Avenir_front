export interface ArticuloAyuda {
    modulo: string;
    titulo: string;
    pasos: string[];
}

export const articulosAyuda: ArticuloAyuda[] = [
    {
        modulo: "Usuarios",
        titulo: "Aprobar o dar de alta un nuevo usuario",
        pasos: [
            "Un usuario nuevo se registra desde la pantalla de Login con \"Registrarse\", y su cuenta queda PENDIENTE hasta que un administrador la active.",
            "Andá a Usuarios, buscalo en el listado (filtro \"Pendientes de Aprobación\") y asignale un Rol para activarlo.",
            "Si necesitás crear directamente una cuenta de Administrador, usás la clave de acceso maestra al registrarte; nace activa."
        ]
    },
    {
        modulo: "Permisos Empleado",
        titulo: "Dar un permiso puntual a un solo empleado (sin cambiarle el rol)",
        pasos: [
            "Andá a Permisos Empleado y seleccioná al empleado en el desplegable.",
            "Tildá \"Usar permisos personalizados para este usuario\": esto reemplaza los permisos de su rol por un set propio.",
            "Marcá únicamente los permisos que necesitás darle (por módulo) y guardá. El resto de los empleados con ese mismo rol no se ven afectados.",
            "Para volver a que use los permisos normales de su rol, destildá la casilla y guardá de nuevo."
        ]
    },
    {
        modulo: "Permisos Empleado",
        titulo: "Definir si un empleado tiene horario laboral fijo",
        pasos: [
            "Andá a Permisos Empleado, seleccioná al empleado.",
            "En \"Horario Laboral Asignado\", tildá la casilla y escribí el horario (ej. \"Lunes a Viernes de 08:00 a 17:00\").",
            "Guardá el horario. Si el empleado no tiene un horario fijo, dejá la casilla destildada."
        ]
    },
    {
        modulo: "Roles",
        titulo: "Crear o editar un rol y sus permisos",
        pasos: [
            "Andá a Roles y creá uno nuevo con un nombre (ej. \"Supervisor\").",
            "Tildá los permisos por módulo que va a tener ese rol; podés usar \"Marcar Módulo\" para tildar todos los de una categoría de una vez.",
            "Todo usuario al que le asignes ese rol hereda esos permisos, salvo que tenga permisos personalizados propios."
        ]
    },
    {
        modulo: "Empresas",
        titulo: "Cargar una empresa cliente con su ubicación",
        pasos: [
            "Andá a Empresas y completá el CUIT y el nombre.",
            "En el campo de dirección, empezá a escribir y elegí una opción del autocompletado: esto guarda automáticamente la dirección, el barrio, la ciudad y las coordenadas.",
            "Esa ubicación se reutiliza después en ATS, Ingreso y Egreso, y Asignación de Tareas para autocompletar direcciones."
        ]
    },
    {
        modulo: "Horarios",
        titulo: "Cómo se cargan las horas trabajadas",
        pasos: [
            "El empleado NO carga las horas a mano: se calculan solas al marcar el egreso de una visita a una empresa (ver \"Ingreso y Egreso\").",
            "El registro de horas queda en estado PENDIENTE hasta que alguien con permiso de aprobación lo apruebe o rechace en Horarios.",
            "Solo quien tiene el permiso APROBAR_HORARIOS puede cargar horas manualmente, para corregir un caso puntual."
        ]
    },
    {
        modulo: "Ingreso y Egreso",
        titulo: "Fichar entrada y salida de una visita a una empresa",
        pasos: [
            "Al hacer login, el sistema pide tu ubicación (geolocalización) para poder calcular los kilómetros después.",
            "En Ingreso y Egreso, elegí la empresa que vas a visitar y marcá \"Ingreso\".",
            "Al terminar la visita, marcá \"Egreso\": ahí se calculan solas las horas trabajadas y, si corresponde, el viático por kilómetros recorridos."
        ]
    },
    {
        modulo: "Insumos",
        titulo: "Cargar un insumo nuevo al catálogo",
        pasos: [
            "Andá a Insumos → pestaña Catálogo y completá nombre, categoría, unidad, stock inicial, stock mínimo y costo unitario.",
            "Si la categoría que necesitás no existe, abrí el panel \"Categorías\" (arriba a la derecha), escribila y agregala antes de cargar el insumo.",
            "El stock baja solo cuando registrás una entrega a un empleado desde la pestaña \"Entregas a Empleados\"."
        ]
    },
    {
        modulo: "Insumos",
        titulo: "Dar de baja o reactivar un insumo o categoría",
        pasos: [
            "En la tabla del catálogo, usá el botón \"Dar de Baja\" para desactivar un insumo sin borrarlo (por ejemplo, si se descontinuó).",
            "Podés filtrar por \"Dados de Baja\" para verlos y reactivarlos si hace falta.",
            "Lo mismo aplica para las categorías, desde el panel \"Categorías\"."
        ]
    },
    {
        modulo: "Viáticos",
        titulo: "Cómo se calculan los kilómetros y quién puede cargarlos a mano",
        pasos: [
            "Los kilómetros se calculan solos: se usa tu ubicación al hacer login como punto de partida y la ubicación de la empresa visitada como destino.",
            "El viático queda PENDIENTE hasta que alguien con permiso de aprobación lo valide.",
            "Un empleado normal NO puede cargar ni editar kilómetros a mano. Si necesitás habilitarle esa opción a alguien puntual, dale el permiso APROBAR_VIATICOS desde Permisos Empleado (sin necesidad de hacerlo administrador)."
        ]
    },
    {
        modulo: "Viáticos",
        titulo: "Definir la tarifa por kilómetro de un empleado",
        pasos: [
            "Quien tiene permiso para editar usuarios ve, arriba de la pantalla de Viáticos, un formulario \"Tarifa por Kilómetro\".",
            "Elegí el empleado y escribí el nuevo valor por km; se usa automáticamente en el próximo viático que se le calcule."
        ]
    },
    {
        modulo: "Asignación de Tareas",
        titulo: "Asignar una tarea con checklist a un empleado",
        pasos: [
            "Andá a Asignación de Tareas, elegí el empleado y la empresa: la dirección y el barrio se autocompletan solos con los datos de esa empresa.",
            "Describí la tarea, tildá los insumos que va a necesitar llevar y agregá los pasos genéricos de preparación que quieras (por ejemplo \"Verificar EPP completo\").",
            "Al asignarla, el empleado la ve en \"Mis Tareas Asignadas\" y puede ir tildando el checklist a medida que lo cumple; la tarea pasa sola de Pendiente a En Progreso y a Completada."
        ]
    },
    {
        modulo: "Documentos",
        titulo: "Subir y versionar un documento",
        pasos: [
            "Andá a Documentos, completá los datos del documento (tipo, empresa relacionada si corresponde) y adjuntá el archivo.",
            "Si ya existe un documento del mismo tipo, podés subir una nueva versión sin perder el historial de versiones anteriores."
        ]
    },
    {
        modulo: "Cronograma",
        titulo: "Cargar un evento en el cronograma",
        pasos: [
            "Andá a Cronograma y creá un evento con fecha, título y descripción.",
            "Los eventos quedan visibles para todo el equipo con permiso de ver el cronograma."
        ]
    },
    {
        modulo: "IPER",
        titulo: "Cargar los catálogos base de IPER (tipos de riesgo, causas, etc.)",
        pasos: [
            "Andá a Parámetros IPER para cargar los catálogos reutilizables: tipos de riesgo, categorías de riesgo, causas y niveles de probabilidad/prioridad.",
            "Estos catálogos son los que después aparecen como opciones al completar un Formulario IPER."
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
    {
        modulo: "ATS",
        titulo: "Completar un Análisis de Trabajo Seguro (ATS)",
        pasos: [
            "Andá a ATS Campo, elegí la empresa: la ubicación se autocompleta con la dirección guardada de esa empresa.",
            "Describí la tarea específica, el riesgo, la categoría, la causa y el nivel de criticidad.",
            "Agregá los pasos de la tarea con su peligro, riesgo/impacto y medida de control asociada, y guardá el análisis."
        ]
    },
    {
        modulo: "Mapa 2D",
        titulo: "Ver la ubicación de empresas y empleados",
        pasos: [
            "Andá a Mapa 2D para ver en el mapa las empresas cargadas y, si tenés el permiso correspondiente, la posición de los empleados.",
            "Podés hacer clic en un usuario desde Usuarios o Empresas para verlo directamente ubicado en el mapa."
        ]
    }
];
