import { formatearPrecio } from "./formato.js";
export function renderLineas(lista, lineas) {
    lista.innerHTML = "";

    lineas.forEach(({ producto, cantidad, subtotal }) => {
        const item = document.createElement("li");

        item.classList.add("item-carrito");

        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.alt}" width="80">

            <h3>${producto.nombre}</h3>

            <div class="control-cantidad">
                <button
                    type="button"
                    data-accion="disminuir"
                    data-id="${producto.id}"
                    aria-label="Restar cantidad de ${producto.etiqueta}"
                >-</button>

                <label for="id-cant-${producto.id}" class="sr-only">
                    Cantidad de ${producto.etiqueta}
                </label>
                <input
                    type="number"
                    id="id-cant-${producto.id}"
                    data-id="${producto.id}"
                    value="${cantidad}"
                    min="1"
                    max="${producto.stock}"
                >

                <button
                    type="button"
                    data-accion="aumentar"
                    data-id="${producto.id}"
                    aria-label="Sumar cantidad de ${producto.etiqueta}"
                >+</button>
            </div>

            <span class="precio-unitario">${formatearPrecio(producto.precio)}</span>
            <span class="precio-subtotal">${formatearPrecio(subtotal)}</span>

            <button
                type="button"
                class="btn-eliminar"
                data-accion="eliminar"
                data-id="${producto.id}"
                aria-label="Eliminar ${producto.etiqueta} del pedido"
            ></button>
        `;

        lista.appendChild(item);
    });
}
export function renderResumen({ desglose, total }, cotizacion) {
    const filas = [
        ["Productos", cotizacion.subtotalProductos],
        ...cotizacion.serviciosElegidos.map(servicio => [servicio.nombre, servicio.precio])
    ];

    desglose.innerHTML = "";

    filas.forEach(([nombre, importe]) => {
        const fila = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");

        dt.textContent = nombre;
        dd.textContent = formatearPrecio(importe);

        fila.append(dt, dd);
        desglose.appendChild(fila);
    });

    total.textContent = formatearPrecio(cotizacion.total);
}

export function renderEstadoVacio({ mensaje, boton }, vacio) {
    mensaje.hidden = !vacio;
    boton.disabled = vacio;
}

export function renderErrorCarga({ lista, mensaje, boton }, texto) {
    lista.innerHTML = "";
    mensaje.hidden = false;
    mensaje.setAttribute("role", "alert");
    mensaje.textContent = texto;
    boton.disabled = true;
}

export function mostrarErrorCampo(campo, mensaje) {
    const parrafo = document.getElementById(`error-${campo.name}`);

    campo.setAttribute("aria-invalid", "true");

    if (parrafo) {
        parrafo.textContent = mensaje;
        parrafo.hidden = false;
    }
}

export function limpiarErrorCampo(campo) {
    const parrafo = document.getElementById(`error-${campo.name}`);

    campo.removeAttribute("aria-invalid");

    if (parrafo) {
        parrafo.textContent = "";
        parrafo.hidden = true;
    }
}
