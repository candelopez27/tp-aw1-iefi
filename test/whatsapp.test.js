import { test } from "node:test";
import assert from "node:assert/strict";

import {
    TELEFONO_WHATSAPP,
    armarMensaje,
    armarUrlWhatsApp,
    formatearFecha
} from "../src/js/modulos/whatsapp.js";

const cotizacion = {
    lineas: [
        { producto: { etiqueta: "Living Estándar" }, cantidad: 2, subtotal: 80000 }
    ],
    serviciosElegidos: [{ nombre: "Flete", precio: 15000 }],
    total: 95000
};

const datos = {
    nombre: " Valentina Giménez ",
    telefono: "3511234567",
    email: "valentina@ejemplo.com",
    fecha: "2026-12-20",
    hora: "19:30",
    direccion: "Av. Colón 1234",
    localidad: "Córdoba",
    observaciones: ""
};

test("formatearFecha pasa de AAAA-MM-DD a DD/MM/AAAA", () => {
    assert.equal(formatearFecha("2026-12-20"), "20/12/2026");
});

test("el mensaje incluye productos, servicios, total y datos", () => {
    const mensaje = armarMensaje(datos, cotizacion);

    assert.match(mensaje, /Living Estándar x2: \$ 80\.000,00/);
    assert.match(mensaje, /Flete: \$ 15\.000,00/);
    assert.match(mensaje, /\*Total estimado:\* \$ 95\.000,00/);
    assert.match(mensaje, /Nombre: Valentina Giménez\n/);
    assert.match(mensaje, /Fecha: 20\/12\/2026 a las 19:30 hs/);
    assert.match(mensaje, /Lugar: Av\. Colón 1234, Córdoba/);
});

test("sin servicios ni observaciones omite esas secciones", () => {
    const mensaje = armarMensaje(datos, { ...cotizacion, serviciosElegidos: [] });

    assert.doesNotMatch(mensaje, /Servicios adicionales/);
    assert.doesNotMatch(mensaje, /Observaciones/);
});

test("con observaciones las agrega al final", () => {
    const mensaje = armarMensaje({ ...datos, observaciones: "Hay escaleras" }, cotizacion);

    assert.match(mensaje, /Observaciones: Hay escaleras$/);
});

test("la URL usa wa.me con el número y el texto codificado", () => {
    const mensaje = "Hola & chau #1\nsegunda línea";
    const url = armarUrlWhatsApp(mensaje);

    assert.ok(url.startsWith(`https://wa.me/${TELEFONO_WHATSAPP}?text=`));
    assert.ok(!url.includes(" ") && !url.includes("\n") && !url.includes("#"));
    assert.equal(decodeURIComponent(url.split("?text=")[1]), mensaje);
});
