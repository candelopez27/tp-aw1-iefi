import { test } from "node:test";
import assert from "node:assert/strict";

import {
    fechaLocalISO,
    validarEmail,
    validarFecha,
    validarFormulario,
    validarHora,
    validarNombre,
    validarTelefono
} from "../src/js/modulos/validacion.js";

const HOY = new Date(2026, 10, 25); // 25/11/2026

const datosValidos = {
    nombre: "Valentina Giménez",
    telefono: "351 123 4567",
    email: "valentina@ejemplo.com",
    fecha: "2026-12-20",
    hora: "19:30",
    direccion: "Av. Colón 1234",
    localidad: "Córdoba",
    observaciones: ""
};

test("fechaLocalISO devuelve AAAA-MM-DD con ceros", () => {
    assert.equal(fechaLocalISO(new Date(2026, 0, 5)), "2026-01-05");
});

test("nombre: exige nombre y apellido con letras", () => {
    assert.equal(validarNombre("Valentina Giménez"), "");
    assert.equal(validarNombre("María de los Ángeles Pérez"), "");
    assert.notEqual(validarNombre(""), "");
    assert.notEqual(validarNombre("Valentina"), "");
    assert.notEqual(validarNombre("Juan 123"), "");
});

test("teléfono: acepta formatos comunes y rechaza basura", () => {
    assert.equal(validarTelefono("3511234567"), "");
    assert.equal(validarTelefono("+54 9 351 123-4567"), "");
    assert.equal(validarTelefono("(351) 123 4567"), "");
    assert.notEqual(validarTelefono("123"), "");
    assert.notEqual(validarTelefono("abcdefgh"), "");
    assert.notEqual(validarTelefono(""), "");
});

test("email: valida estructura básica", () => {
    assert.equal(validarEmail("a@b.com"), "");
    assert.notEqual(validarEmail("a@b"), "");
    assert.notEqual(validarEmail("a b@c.com"), "");
    assert.notEqual(validarEmail(""), "");
});

test("fecha: no puede ser pasada ni inexistente", () => {
    assert.equal(validarFecha("2026-11-25", HOY), "");
    assert.equal(validarFecha("2027-01-10", HOY), "");
    assert.match(validarFecha("2026-11-24", HOY), /anterior a hoy/);
    assert.match(validarFecha("2026-02-31", HOY), /no es válida/);
    assert.notEqual(validarFecha("", HOY), "");
});

test("hora: formato HH:MM de 24 horas", () => {
    assert.equal(validarHora("00:00"), "");
    assert.equal(validarHora("23:59"), "");
    assert.notEqual(validarHora("24:00"), "");
    assert.notEqual(validarHora(""), "");
});

test("validarFormulario devuelve {} cuando todo es válido", () => {
    assert.deepEqual(validarFormulario(datosValidos, HOY), {});
});

test("validarFormulario informa cada campo inválido, en orden del formulario", () => {
    const errores = validarFormulario(
        { ...datosValidos, email: "mal", fecha: "2020-01-01", localidad: "" },
        HOY
    );

    assert.deepEqual(Object.keys(errores), ["email", "fecha", "localidad"]);
});

test("observaciones: máximo 500 caracteres", () => {
    const errores = validarFormulario(
        { ...datosValidos, observaciones: "x".repeat(501) },
        HOY
    );

    assert.deepEqual(Object.keys(errores), ["observaciones"]);
});
