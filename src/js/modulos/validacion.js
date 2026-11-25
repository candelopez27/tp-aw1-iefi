export function fechaLocalISO(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

export function validarNombre(valor) {
    const texto = valor.trim();

    if (texto === "") {
        return "Ingresá tu nombre y apellido.";
    }

    const palabras = texto.split(/\s+/);

    if (palabras.length < 2 || palabras.some(palabra => palabra.length < 2)) {
        return "Ingresá tu nombre y apellido.";
    }

    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(texto)) {
        return "El nombre solo puede tener letras y espacios.";
    }

    return "";
}

export function validarTelefono(valor) {
    const texto = valor.trim();

    if (texto === "") {
        return "Ingresá un teléfono de contacto.";
    }

    const digitos = texto.replace(/\D/g, "");

    if (!/^[+\d\s()-]+$/.test(texto) || digitos.length < 8 || digitos.length > 15) {
        return "Ingresá un teléfono válido (entre 8 y 15 dígitos).";
    }

    return "";
}

export function validarEmail(valor) {
    const texto = valor.trim();

    if (texto === "") {
        return "Ingresá tu email.";
    }

    if (texto.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto)) {
        return "Ingresá un email válido, por ejemplo nombre@dominio.com.";
    }

    return "";
}

export function validarFecha(valor, hoy = new Date()) {
    if (valor === "") {
        return "Elegí la fecha del evento.";
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);

    if (!partes) {
        return "La fecha no es válida.";
    }

    const [, anio, mes, dia] = partes.map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    // Detecta fechas inexistentes como 2026-02-31.
    if (
        fecha.getFullYear() !== anio ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return "La fecha no es válida.";
    }

    if (valor < fechaLocalISO(hoy)) {
        return "La fecha del evento no puede ser anterior a hoy.";
    }

    return "";
}

export function validarHora(valor) {
    if (valor === "") {
        return "Elegí la hora del evento.";
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(valor)) {
        return "La hora no es válida.";
    }

    return "";
}

function validarTexto(valor, { etiqueta, minimo, maximo }) {
    const texto = valor.trim();

    if (texto === "") {
        return `Ingresá ${etiqueta}.`;
    }

    if (texto.length < minimo) {
        return `Ingresá ${etiqueta} (mínimo ${minimo} caracteres).`;
    }

    if (texto.length > maximo) {
        return `Máximo ${maximo} caracteres.`;
    }

    return "";
}

export const validarDireccion = valor =>
    validarTexto(valor, { etiqueta: "la dirección del evento", minimo: 5, maximo: 120 });

export const validarLocalidad = valor =>
    validarTexto(valor, { etiqueta: "la localidad", minimo: 3, maximo: 60 });

export function validarObservaciones(valor) {
    return valor.length > 500 ? "Máximo 500 caracteres." : "";
}

const validadores = {
    nombre: validarNombre,
    telefono: validarTelefono,
    email: validarEmail,
    fecha: validarFecha,
    hora: validarHora,
    direccion: validarDireccion,
    localidad: validarLocalidad,
    observaciones: validarObservaciones
};

export function validarCampo(nombre, valor, hoy = new Date()) {
    const validar = validadores[nombre];

    return validar ? validar(valor, hoy) : "";
}
export function validarFormulario(datos, hoy = new Date()) {
    const errores = {};

    for (const nombre of Object.keys(validadores)) {
        const mensaje = validarCampo(nombre, String(datos[nombre] ?? ""), hoy);

        if (mensaje) {
            errores[nombre] = mensaje;
        }
    }

    return errores;
}
