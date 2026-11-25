export const CLAVE_PEDIDO = "pedidoMola";

export function leerJSON(clave, porDefecto = null) {
    try {
        const crudo = localStorage.getItem(clave);

        return crudo === null ? porDefecto : JSON.parse(crudo);
    } catch (error) {
        console.error(`No se pudo leer "${clave}" de localStorage.`, error);

        return porDefecto;
    }
}

export function escribirJSON(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));

        return true;
    } catch (error) {
        console.error(`No se pudo guardar "${clave}" en localStorage.`, error);

        return false;
    }
}

export function borrar(clave) {
    try {
        localStorage.removeItem(clave);
    } catch (error) {
        console.error(`No se pudo borrar "${clave}" de localStorage.`, error);
    }
}

export const leerPedido = () => leerJSON(CLAVE_PEDIDO, []);
export const guardarPedido = pedido => escribirJSON(CLAVE_PEDIDO, pedido);
export const vaciarPedido = () => borrar(CLAVE_PEDIDO);
const ID_CONTENEDOR = "avisos";
const DURACION_MS = 4000;

function obtenerContenedor() {
    let contenedor = document.getElementById(ID_CONTENEDOR);

    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = ID_CONTENEDOR;
        contenedor.className = "avisos";
        contenedor.setAttribute("role", "status");
        contenedor.setAttribute("aria-live", "polite");
        document.body.appendChild(contenedor);
    }

    return contenedor;
}

export function mostrarAviso(mensaje, tipo = "info") {
    const aviso = document.createElement("p");

    aviso.className = `aviso aviso--${tipo}`;
    aviso.textContent = mensaje;

    obtenerContenedor().appendChild(aviso);

    setTimeout(() => aviso.remove(), DURACION_MS);
}