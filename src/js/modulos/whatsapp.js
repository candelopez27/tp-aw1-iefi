import { formatearPrecio } from "./formato.js";
export const TELEFONO_WHATSAPP = "5493517027534";

export function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-");

    return `${dia}/${mes}/${anio}`;
}

const precio = importe => formatearPrecio(importe).replace(/\u00a0/g, " ");

export function armarMensaje(datos, cotizacion) {
    const lineasProductos = cotizacion.lineas.map(
        ({ producto, cantidad, subtotal }) =>
            `- ${producto.etiqueta} x${cantidad}: ${precio(subtotal)}`
    );

    const partes = [
        "Hola Mola Eventos! Quiero solicitar una cotización.",
        "",
        "*Productos*",
        ...lineasProductos
    ];

    if (cotizacion.serviciosElegidos.length > 0) {
        partes.push(
            "",
            "*Servicios adicionales*",
            ...cotizacion.serviciosElegidos.map(
                servicio => `- ${servicio.nombre}: ${precio(servicio.precio)}`
            )
        );
    }

    partes.push(
        "",
        `*Total estimado:* ${precio(cotizacion.total)}`,
        "",
        "*Datos del evento*",
        `Nombre: ${datos.nombre.trim()}`,
        `Teléfono: ${datos.telefono.trim()}`,
        `Email: ${datos.email.trim()}`,
        `Fecha: ${formatearFecha(datos.fecha)} a las ${datos.hora} hs`,
        `Lugar: ${datos.direccion.trim()}, ${datos.localidad.trim()}`
    );

    const observaciones = (datos.observaciones ?? "").trim();

    if (observaciones !== "") {
        partes.push(`Observaciones: ${observaciones}`);
    }

    return partes.join("\n");
}

export function armarUrlWhatsApp(mensaje, telefono = TELEFONO_WHATSAPP) {
    return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}
