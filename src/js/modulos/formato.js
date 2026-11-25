// Formatea un importe como moneda argentina (ej. $ 40.000,00).
export function formatearPrecio(precio) {
    return Number(precio).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
});
}

// Pasa a minúsculas y quita tildes, para que "estandar" encuentre "Estándar".
export function normalizarTexto(texto) {
    return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}