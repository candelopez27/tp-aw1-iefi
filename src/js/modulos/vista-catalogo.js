import { formatearPrecio } from "./formato.js";

function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderTarjetaProducto(producto) {
    const imagenSrc = producto.imagen
        ? producto.imagen.replace(/^\.\/recursos\//, "../recursos/")
        : "";
    const incluyeHtml = Array.isArray(producto.incluye) && producto.incluye.length > 0
        ? `<ul class="lista-incluye">${producto.incluye.map(item => `<li>${escaparHtml(item)}</li>`).join("")}</ul>`
        : "";

    return `
        <article class="tarjeta-producto" data-id="${producto.id}">
            ${imagenSrc ? `<img src="${escaparHtml(imagenSrc)}" alt="${escaparHtml(producto.alt || producto.nombre)}" loading="lazy">` : ""}
            <div class="cuerpo-producto">
                <h3>${escaparHtml(producto.nombre)}</h3>
                ${producto.descripcion ? `<p class="descripcion-producto">${escaparHtml(producto.descripcion)}</p>` : ""}
                ${incluyeHtml}
                <p class="precio-producto">${formatearPrecio(producto.precio)}</p>
                <p class="stock-producto">Stock disponible: ${producto.stock}</p>
                <div class="controles-producto">
                    <div class="selector-cantidad">
                        <button type="button" class="boton-cantidad" data-id="${producto.id}" data-accion="disminuir" aria-label="Disminuir cantidad de ${escaparHtml(producto.etiqueta || producto.nombre)}">-</button>
                        <span id="cantidad-${producto.id}" class="valor-cantidad">1</span>
                        <button type="button" class="boton-cantidad" data-id="${producto.id}" data-accion="aumentar" aria-label="Aumentar cantidad de ${escaparHtml(producto.etiqueta || producto.nombre)}">+</button>
                    </div>
                    <button type="button" class="boton boton-principal boton-agregar" data-id="${producto.id}">Agregar</button>
                </div>
            </div>
        </article>
    `;
}

export function renderProductos(contenedor, productos) {
    if (!contenedor) {
        return;
    }

    if (!Array.isArray(productos) || productos.length === 0) {
        contenedor.innerHTML = `<p class="estado-vacio">No encontramos productos que coincidan con los filtros seleccionados.</p>`;
        return;
    }

    contenedor.innerHTML = productos.map(renderTarjetaProducto).join("");
}

export function renderPedido(vistaPedido, resumen) {
    if (!vistaPedido) {
        return;
    }

    const { lineas = [], cantidadTotal = 0, total = 0 } = resumen || {};

    if (vistaPedido.cantidad) {
        vistaPedido.cantidad.textContent = String(cantidadTotal);
    }

    if (vistaPedido.importe) {
        vistaPedido.importe.textContent = formatearPrecio(total);
    }

    if (vistaPedido.lista) {
        if (lineas.length === 0) {
            vistaPedido.lista.innerHTML = `<li class="pedido-vacio">Todavía no agregaste productos.</li>`;
            return;
        }

        vistaPedido.lista.innerHTML = lineas
            .map(({ producto, cantidad, subtotal }) => `
                <li class="item-pedido">
                    <div class="item-pedido-info">
                        <span class="item-pedido-nombre">${escaparHtml(producto.etiqueta || producto.nombre)}</span>
                        <span class="item-pedido-detalle">${cantidad} x ${formatearPrecio(producto.precio)} = ${formatearPrecio(subtotal)}</span>
                    </div>
                    <button type="button" class="boton-eliminar" data-eliminar="${producto.id}" aria-label="Quitar ${escaparHtml(producto.etiqueta || producto.nombre)}">✕</button>
                </li>
            `)
            .join("");
    }
}

export function renderError(contenedor, mensaje) {
    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `<p class="mensaje-error" role="alert">${escaparHtml(mensaje || "Ocurrió un error al cargar el catálogo.")}</p>`;
}
