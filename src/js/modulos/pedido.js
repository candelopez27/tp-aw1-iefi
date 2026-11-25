export function buscarProductoPorId(productos, id) {
    return productos.find(producto => producto.id === Number(id));
}

export function sanearPedido(crudo, productos) {
    if (!Array.isArray(crudo)) {
        return [];
    }

    return crudo.filter(item => {
        if (
            !item ||
            !Number.isInteger(item.id) ||
            !Number.isInteger(item.cantidad) ||
            item.cantidad < 1
        ) {
            return false;
        }

        const producto = buscarProductoPorId(productos, item.id);

        return Boolean(producto) && item.cantidad <= producto.stock;
    });
}

export function agregarAlPedido(pedido, producto, cantidad) {
    const existente = pedido.find(item => item.id === producto.id);
    const cantidadActual = existente ? existente.cantidad : 0;

    if (cantidadActual + cantidad > producto.stock) {
        return {
            ok: false,
            pedido,
            mensaje: `Solo hay ${producto.stock} unidades disponibles de ${producto.etiqueta}.`
        };
    }

    const nuevoPedido = existente
        ? pedido.map(item =>
            item.id === producto.id
                ? { ...item, cantidad: item.cantidad + cantidad }
                : item
        )
        : [...pedido, { id: producto.id, cantidad }];

    return {
        ok: true,
        pedido: nuevoPedido,
        mensaje: `${producto.etiqueta} se agregó al pedido.`
    };
}

export function establecerCantidad(pedido, producto, cantidad) {
    const acotada = Math.min(Math.max(Math.trunc(cantidad) || 1, 1), producto.stock);

    return pedido.map(item =>
        item.id === producto.id ? { ...item, cantidad: acotada } : item
    );
}

export function quitarDelPedido(pedido, id) {
    return pedido.filter(item => item.id !== Number(id));
}

export function calcularTotales(pedido, productos) {
    const lineas = pedido
        .map(item => {
            const producto = buscarProductoPorId(productos, item.id);

            return producto
                ? {
                    producto,
                    cantidad: item.cantidad,
                    subtotal: producto.precio * item.cantidad
                }
                : null;
        })
        .filter(Boolean);

    return {
        lineas,
        cantidadTotal: lineas.reduce((suma, linea) => suma + linea.cantidad, 0),
        total: lineas.reduce((suma, linea) => suma + linea.subtotal, 0)
    };
}
