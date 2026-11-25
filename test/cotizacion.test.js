import { test } from "node:test";
import assert from "node:assert/strict";

import { calcularCotizacion } from "../src/js/modulos/cotizacion.js";

const productos = [
    { id: 1, etiqueta: "Living Estándar", precio: 40000, stock: 8 },
    { id: 2, etiqueta: "Living Confort", precio: 46000, stock: 3 }
];

const servicios = [
    { id: "flete", nombre: "Flete", precio: 15000 },
    { id: "armado", nombre: "Armado", precio: 12000 }
];

test("suma productos y servicios elegidos", () => {
    const pedido = [{ id: 1, cantidad: 2 }, { id: 2, cantidad: 1 }];
    const cot = calcularCotizacion(pedido, productos, servicios, ["flete"]);

    assert.equal(cot.subtotalProductos, 126000);
    assert.equal(cot.totalServicios, 15000);
    assert.equal(cot.total, 141000);
    assert.equal(cot.cantidadTotal, 3);
});

test("sin servicios elegidos el total es solo de productos", () => {
    const cot = calcularCotizacion([{ id: 1, cantidad: 1 }], productos, servicios);

    assert.equal(cot.total, 40000);
    assert.deepEqual(cot.serviciosElegidos, []);
});

test("ignora ids de servicios inexistentes", () => {
    const cot = calcularCotizacion([{ id: 1, cantidad: 1 }], productos, servicios, ["inexistente"]);

    assert.equal(cot.totalServicios, 0);
});

test("con el pedido vacío los servicios no se suman", () => {
    const cot = calcularCotizacion([], productos, servicios, ["flete", "armado"]);

    assert.equal(cot.total, 0);
    assert.deepEqual(cot.serviciosElegidos, []);
});
