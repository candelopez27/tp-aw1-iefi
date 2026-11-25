const RUTA_PRODUCTOS = new URL("../../data/productos.json", import.meta.url);

export async function cargarProductos(
    ruta = RUTA_PRODUCTOS,
    fetchFn = globalThis.fetch
) {
    try {
        const respuesta = await fetchFn(ruta);
        if (!respuesta.ok) {
            throw new Error(`Respuesta HTTP ${respuesta.status}`);
        }

        const productos = await respuesta.json();

        if (!Array.isArray(productos)) {
            throw new Error("El JSON del catálogo no es una lista.");
        }

        return productos;
    } catch (error) {
        console.error("Error al cargar el catálogo:", error);

        throw new Error("No pudimos cargar el catálogo. Intentá nuevamente en unos minutos.", {
            cause: error
        });
    }
}
