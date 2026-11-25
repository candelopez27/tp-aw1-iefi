import { test } from "node:test";
import assert from "node:assert/strict";

import { cargarProductos } from "../src/js/modulos/datos.js";

const fetchFalso = (respuesta) => async () => respuesta;

test("devuelve la lista cuando la respuesta es válida", async () => {
    const lista = [{ id: 1 }];
    const fetchFn = fetchFalso({ ok: true, json: async () => lista });

    assert.deepEqual(await cargarProductos("x", fetchFn), lista);
});

test("lanza un error claro ante una respuesta HTTP 404", async (t) => {
    t.mock.method(console, "error", () => {});
    const fetchFn = fetchFalso({ ok: false, status: 404 });

    await assert.rejects(cargarProductos("x", fetchFn), /No pudimos cargar el catálogo/);
});

test("lanza un error si el JSON no es una lista", async (t) => {
    t.mock.method(console, "error", () => {});
    const fetchFn = fetchFalso({ ok: true, json: async () => ({}) });

    await assert.rejects(cargarProductos("x", fetchFn), /No pudimos cargar el catálogo/);
});

test("lanza un error si falla la red", async (t) => {
    t.mock.method(console, "error", () => {});
    const fetchFn = async () => { throw new TypeError("Failed to fetch"); };

    await assert.rejects(cargarProductos("x", fetchFn), /No pudimos cargar el catálogo/);
});

import { cargarServicios } from "../src/js/modulos/datos.js";

test("cargarServicios devuelve la lista y usa su propio mensaje de error", async (t) => {
    t.mock.method(console, "error", () => {});

    const lista = [{ id: "flete", nombre: "Flete", precio: 15000 }];
    const bien = fetchFalso({ ok: true, json: async () => lista });
    const mal = fetchFalso({ ok: false, status: 500 });

    assert.deepEqual(await cargarServicios("x", bien), lista);
    await assert.rejects(cargarServicios("x", mal), /servicios adicionales/);
});
