export async function cargarProductos(url, fetchFn = fetch) {
  try {
    const respuesta = await fetchFn(url);

    if (!respuesta || !respuesta.ok) {
      throw new Error(`HTTP ${respuesta?.status ?? "error"}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error("El formato de productos no es una lista");
    }

    return datos;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    throw new Error("No pudimos cargar el catálogo");
  }
}
