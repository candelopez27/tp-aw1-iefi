// =====================================================
// Tests de INTEGRIDAD del sitio (estilo "integración"):
// no prueban una función aislada sino que las piezas encajan.
//   - los JSON tienen la forma que espera el código
//   - cada imagen / enlace / script / CSS referenciado EXISTE
// La comprobación de existencia distingue mayúsculas y minúsculas
// aunque el sistema de archivos no lo haga (Windows/macOS), porque el
// servidor de producción (Linux) sí las distingue: "Logo.png" no es
// "logo.png" en Vercel.
// =====================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

// Existencia con coincidencia EXACTA de mayúsculas, segmento por segmento.
function existeExacto(rutaAbsoluta) {
    const relativa = path.relative(SRC, rutaAbsoluta);

    if (relativa.startsWith("..")) {
        return false;
    }

    let actual = SRC;

    for (const segmento of relativa.split(path.sep)) {
        if (!fs.readdirSync(actual).includes(segmento)) {
            return false;
        }

        actual = path.join(actual, segmento);
    }

    return true;
}

const esLocal = ruta =>
    ruta !== "" &&
    !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ruta);

// Quita #ancla y ?consulta, y decodifica %20.
const limpiar = ruta => decodeURIComponent(ruta.split(/[#?]/)[0]);

const leer = archivo => fs.readFileSync(archivo, "utf8");
const archivosDe = (carpeta, extension) =>
    fs.readdirSync(carpeta).filter(nombre => nombre.endsWith(extension));

test("productos.json: campos obligatorios, ids únicos y valores coherentes", () => {
    const productos = JSON.parse(leer(path.join(SRC, "data/productos.json")));
    const ids = new Set();

    assert.ok(productos.length > 0, "el catálogo no puede estar vacío");

    for (const producto of productos) {
        for (const campo of ["id", "nombre", "etiqueta", "categoria", "precio", "stock", "imagen", "alt"]) {
            assert.ok(campo in producto, `producto ${producto.id}: falta "${campo}"`);
        }

        assert.ok(Number.isInteger(producto.id), "id entero");
        assert.ok(!ids.has(producto.id), `id repetido: ${producto.id}`);
        ids.add(producto.id);
        assert.ok(producto.precio > 0, `producto ${producto.id}: precio > 0`);
        assert.ok(Number.isInteger(producto.stock) && producto.stock >= 0, `producto ${producto.id}: stock entero`);
        assert.ok(Array.isArray(producto.eventos), `producto ${producto.id}: eventos es lista`);
    }
});

test("servicios.json: ids únicos y precios positivos", () => {
    const servicios = JSON.parse(leer(path.join(SRC, "data/servicios.json")));
    const ids = servicios.map(servicio => servicio.id);

    assert.equal(new Set(ids).size, ids.length);
    assert.ok(servicios.every(servicio => servicio.precio > 0 && servicio.nombre));
});

test("cada imagen de productos.json existe (mayúsculas exactas)", () => {
    const productos = JSON.parse(leer(path.join(SRC, "data/productos.json")));

    for (const producto of productos) {
        assert.ok(
            esLocal(producto.imagen) && existeExacto(path.join(SRC, limpiar(producto.imagen))),
            `producto ${producto.id}: no existe la imagen ${producto.imagen}`
        );
    }
});

test("cada href/src/poster de los HTML apunta a un archivo existente", () => {
    for (const pagina of archivosDe(SRC, ".html")) {
        const html = leer(path.join(SRC, pagina));
        const referencias = [...html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)].map(m => m[1]);

        for (const referencia of referencias.filter(esLocal)) {
            const destino = path.join(SRC, limpiar(referencia));

            assert.ok(existeExacto(destino), `${pagina}: no existe "${referencia}"`);
        }
    }
});

test("cada url(...) de los CSS apunta a un archivo existente", () => {
    const carpetaCss = path.join(SRC, "css");

    for (const hoja of archivosDe(carpetaCss, ".css")) {
        const css = leer(path.join(carpetaCss, hoja));
        const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(m => m[1]);

        for (const direccion of urls.filter(esLocal)) {
            const destino = path.join(carpetaCss, limpiar(direccion));

            assert.ok(existeExacto(destino), `css/${hoja}: no existe "${direccion}"`);
        }
    }
});

test("los enlaces internos entre páginas existen y todas las páginas cargan menu.js", () => {
    for (const pagina of archivosDe(SRC, ".html")) {
        const html = leer(path.join(SRC, pagina));

        assert.match(html, /src="\.\/js\/menu\.js"/, `${pagina}: falta cargar js/menu.js`);
    }
});
