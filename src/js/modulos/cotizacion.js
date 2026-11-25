import { calcularTotales } from "./pedido.js";

export function calcularCotizacion(pedido, productos, servicios, idsElegidos = []) {
    const { lineas, cantidadTotal, total: subtotalProductos } =
        calcularTotales(pedido, productos);

    const serviciosElegidos = cantidadTotal === 0
        ? []
        : servicios.filter(servicio => idsElegidos.includes(servicio.id));

    const totalServicios = serviciosElegidos.reduce(
        (suma, servicio) => suma + servicio.precio,
        0
    );

    return {
        lineas,
        cantidadTotal,
        subtotalProductos,
        serviciosElegidos,
        totalServicios,
        total: subtotalProductos + totalServicios
    };
}
