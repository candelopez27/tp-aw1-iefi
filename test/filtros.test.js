import { test } from "node:test";
import assert from "node:assert/strict";

import { filtrarProductos, leerPrecio } from "../src/js/modulos/filtros.js";

const productos = [
    { id: 1, nombre: "Juego de Living Estándar", categoria: "livings", precio: 40000, eventos: ["social", "corporativo"] },
    { id: 2, nombre: "Juego de Livings Confort", categoria: "livings", precio: 46000, eventos: ["social"] },
    { id: 3, nombre: "Gazebo blanco", categoria: "gazebos", precio: 90000, eventos: ["corporativo"] }
];

const ids = lista => lista.map(producto => producto.id);

test("sin criterios devuelve todos los productos", () => {
    assert.deepEqual(ids(filtrarProductos(productos)), [1, 2, 3]);
});

test("la búsqueda ignora mayúsculas y tildes", () => {
    assert.deepEqual(ids(filtrarProductos(productos, { texto: "ESTANDAR" })), [1]);
});

test("filtra por categoría", () => {
    assert.deepEqual(ids(filtrarProductos(productos, { categoria: "gazebos" })), [3]);
});

test("filtra por rango de precio (inclusivo)", () => {
    const resultado = filtrarProductos(productos, { precioMin: 40000, precioMax: 46000 });

    assert.deepEqual(ids(resultado), [1, 2]);
});

test("filtra por tipo de evento (coincide con alguno)", () => {
    assert.deepEqual(ids(filtrarProductos(productos, { eventos: ["corporativo"] })), [1, 3]);
});

test("combina todos los criterios con AND", () => {
    const resultado = filtrarProductos(productos, {
        texto: "living",
        categoria: "livings",
        precioMax: 42000,
        eventos: ["social"]
    });

    assert.deepEqual(ids(resultado), [1]);
});

test("no modifica la lista original", () => {
    const copia = structuredClone(productos);

    filtrarProductos(productos, { texto: "gazebo" });

    assert.deepEqual(productos, copia);
});

test("leerPrecio usa el valor por defecto con vacío o inválido", () => {
    assert.equal(leerPrecio("", Infinity), Infinity);
    assert.equal(leerPrecio("abc", 0), 0);
    assert.equal(leerPrecio("-5", 0), 0);
    assert.equal(leerPrecio("1500", 0), 1500);
});
