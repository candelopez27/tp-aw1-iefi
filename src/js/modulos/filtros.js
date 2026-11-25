import { normalizarTexto } from "./formato.js";

export const CRITERIOS_VACIOS = Object.freeze({
    texto: "",
    categoria: "todas",
    precioMin: 0,
    precioMax: Infinity,
    eventos: []
});

export function leerPrecio(valor, porDefecto) {
    if (valor === "" || valor === null || valor === undefined) {
        return porDefecto;
    }

    const numero = Number(valor);

    return Number.isFinite(numero) && numero >= 0 ? numero : porDefecto;
}

// Cada criterio es una función pequeña con un solo motivo para cambiar.
export const coincideTexto = (producto, texto) =>
    normalizarTexto(producto.nombre).includes(normalizarTexto(texto));

export const coincideCategoria = (producto, categoria) =>
    categoria === "todas" || producto.categoria === categoria;

export const coincidePrecio = (producto, min, max) =>
    producto.precio >= min && producto.precio <= max;

export const coincideEvento = (producto, eventos) =>
    eventos.length === 0 ||
    eventos.some(evento => producto.eventos.includes(evento));

// Función principal: combina todos los criterios con AND.
export function filtrarProductos(productos, criterios = CRITERIOS_VACIOS) {
    const { texto, categoria, precioMin, precioMax, eventos } = {
        ...CRITERIOS_VACIOS,
        ...criterios
    };

    return productos.filter(producto =>
        coincideTexto(producto, texto) &&
        coincideCategoria(producto, categoria) &&
        coincidePrecio(producto, precioMin, precioMax) &&
        coincideEvento(producto, eventos)
    );
}
