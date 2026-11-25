const RUTA_PRODUCTOS = new URL("../../data/productos.json", import.meta.url);
const RUTA_SERVICIOS = new URL("../../data/servicios.json", import.meta.url);

async function cargarLista(ruta, fetchFn, queCargamos) {
    try {
        const respuesta = await fetchFn(ruta);

        // fetch NO lanza error ante un 404 o 500: hay que revisar "ok".
        if (!respuesta.ok) {
            throw new Error(`Respuesta HTTP ${respuesta.status}`);
        }

        const lista = await respuesta.json();

        if (!Array.isArray(lista)) {
            throw new Error("El JSON recibido no es una lista.");
        }

        return lista;
    } catch (error) {
        console.error(`Error al cargar ${queCargamos}:`, error);
        throw new Error(
            `No pudimos cargar ${queCargamos}. Intentá nuevamente en unos minutos.`,
            { cause: error }
        );
    }
}

export const cargarProductos = (
    ruta = RUTA_PRODUCTOS,
    fetchFn = globalThis.fetch
) => cargarLista(ruta, fetchFn, "el catálogo");

export const cargarServicios = (
    ruta = RUTA_SERVICIOS,
    fetchFn = globalThis.fetch
) => cargarLista(ruta, fetchFn, "los servicios adicionales");
