const CLAVE_PEDIDO = "mola_eventos_pedido";

export function leerPedido() {
    try {
        const raw = localStorage.getItem(CLAVE_PEDIDO);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function guardarPedido(pedido) {
    try {
        localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(pedido));
        return true;
    } catch {
        return false;
    }
}

export function vaciarPedido() {
    try {
        localStorage.removeItem(CLAVE_PEDIDO);
        return true;
    } catch {
        return false;
    }
}
