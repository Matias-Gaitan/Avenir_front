import { useState, useMemo, useEffect } from "react";

export function usePaginacion<T>(items: T[], porPagina = 8) {
    const [pagina, setPagina] = useState(1);
    const totalPaginas = Math.max(1, Math.ceil(items.length / porPagina));

    useEffect(() => {
        if (pagina > totalPaginas) setPagina(1);
    }, [items.length, totalPaginas]);

    const itemsPagina = useMemo(() => {
        const inicio = (pagina - 1) * porPagina;
        return items.slice(inicio, inicio + porPagina);
    }, [items, pagina, porPagina]);

    return { itemsPagina, pagina, totalPaginas, setPagina, totalItems: items.length, porPagina };
}
