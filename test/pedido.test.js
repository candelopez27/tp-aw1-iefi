import { test } from "node:test";
import assert from "node:assert/strict";

import {
    agregarAlPedido,
    calcularTotales,
    establecerCantidad,
    quitarDelPedido,
    sanearPedido
} from "../src/js/modulos/pedido.js";

const productos = [
    { id: 1, etiqueta: "Living Estándar", precio: 40000, stock: 8 },
    { id: 2, etiqueta: "Living Confort", precio: 46000, stock: 3 }
];

test("agregar un producto nuevo crea el ítem", () => {
    const { ok, pedido } = agregarAlPedido([], productos[0], 2);

    assert.equal(ok, true);
    assert.deepEqual(pedido, [{ id: 1, cantidad: 2 }]);
});

test("agregar uno existente suma cantidades sin mutar el original", () => {
    const original = [{ id: 1, cantidad: 2 }];
    const { pedido } = agregarAlPedido(original, productos[0], 3);

    assert.deepEqual(pedido, [{ id: 1, cantidad: 5 }]);
    assert.deepEqual(original, [{ id: 1, cantidad: 2 }]);
});

test("rechaza agregar más que el stock disponible", () => {
    const original = [{ id: 2, cantidad: 2 }];
    const resultado = agregarAlPedido(original, productos[1], 2);

    assert.equal(resultado.ok, false);
    assert.equal(resultado.pedido, original);
    assert.match(resultado.mensaje, /Solo hay 3 unidades/);
});

test("establecerCantidad acota entre 1 y el stock", () => {
    const pedido = [{ id: 2, cantidad: 1 }];

    assert.equal(establecerCantidad(pedido, productos[1], 99)[0].cantidad, 3);
    assert.equal(establecerCantidad(pedido, productos[1], 0)[0].cantidad, 1);
});

test("quitarDelPedido elimina solo el ítem indicado", () => {
    const pedido = [{ id: 1, cantidad: 1 }, { id: 2, cantidad: 1 }];

    assert.deepEqual(quitarDelPedido(pedido, 1), [{ id: 2, cantidad: 1 }]);
});

test("calcularTotales suma cantidades e importes", () => {
    const pedido = [{ id: 1, cantidad: 2 }, { id: 2, cantidad: 1 }];
    const { cantidadTotal, total, lineas } = calcularTotales(pedido, productos);

    assert.equal(cantidadTotal, 3);
    assert.equal(total, 2 * 40000 + 46000);
    assert.equal(lineas.length, 2);
});

test("sanearPedido descarta datos corruptos, inexistentes o sobre el stock", () => {
    const crudo = [
        { id: 1, cantidad: 2 },
        { id: 99, cantidad: 1 },
        { id: 2, cantidad: 10 },
        { id: 1, cantidad: -1 },
        null,
        "basura"
    ];

    assert.deepEqual(sanearPedido(crudo, productos), [{ id: 1, cantidad: 2 }]);
    assert.deepEqual(sanearPedido("no es lista", productos), []);
});
