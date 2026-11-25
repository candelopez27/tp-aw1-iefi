import { cargarProductos, cargarServicios } from "./modulos/datos.js";
import {
    buscarProductoPorId,
    establecerCantidad,
    quitarDelPedido,
    sanearPedido
} from "./modulos/pedido.js";
import { calcularCotizacion } from "./modulos/cotizacion.js";
import { guardarPedido, leerPedido, vaciarPedido } from "./modulos/almacenamiento.js";
import { fechaLocalISO, validarCampo, validarFormulario } from "./modulos/validacion.js";
import { armarMensaje, armarUrlWhatsApp } from "./modulos/whatsapp.js";
import {
    limpiarErrorCampo,
    mostrarErrorCampo,
    renderErrorCarga,
    renderEstadoVacio,
    renderLineas,
    renderResumen
} from "./modulos/vista-cotizacion.js";
import { mostrarAviso } from "./modulos/notificaciones.js";

// ---------- Referencias al DOM ----------
const formulario = document.getElementById("form-cotizacion");
const listaCarrito = document.getElementById("lista-carrito");
const botonEnviar = document.getElementById("boton-solicitar");
const checksServicios = formulario.querySelectorAll('input[name="servicios"]');
const campoFecha = document.getElementById("id-fecha-cotizacion");
const confirmacion = document.getElementById("confirmacion");
const enlaceWhatsapp = document.getElementById("enlace-whatsapp");
const botonVaciar = document.getElementById("vaciar-pedido");

const vistaVacio = {
    mensaje: document.getElementById("carrito-vacio"),
    boton: botonEnviar
};

const vistaResumen = {
    desglose: document.getElementById("desglose-precios"),
    total: document.getElementById("total-estimado")
};

let productos = [];
let servicios = [];
let pedido = [];


const idsServiciosElegidos = () =>
    Array.from(checksServicios)
        .filter(check => check.checked)
        .map(check => check.value);


const camposValidables = () =>
    Array.from(formulario.elements).filter(
        campo => campo.name && campo.name !== "servicios" && campo.type !== "submit"
    );

function leerDatos() {
    const datos = {};

    camposValidables().forEach(campo => {
        datos[campo.name] = campo.value;
    });

    return datos;
}


// ---------- Render ----------
function actualizar() {
    const cotizacion = calcularCotizacion(
        pedido,
        productos,
        servicios,
        idsServiciosElegidos()
    );

    renderLineas(listaCarrito, cotizacion.lineas);
    renderResumen(vistaResumen, cotizacion);
    renderEstadoVacio(vistaVacio, cotizacion.cantidadTotal === 0);

    return cotizacion;
}

function guardarYActualizar() {
    if (!guardarPedido(pedido)) {
        mostrarAviso("No pudimos guardar tu pedido en este navegador.", "error");
    }

    return actualizar();
}


// ---------- Pedido: cantidades y eliminación ----------
listaCarrito.addEventListener("click", evento => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
        return;
    }

    const { accion, id } = boton.dataset;
    const producto = buscarProductoPorId(productos, id);
    const item = pedido.find(elemento => elemento.id === Number(id));

    if (!producto || !item) {
        return;
    }

    if (accion === "eliminar") {
        pedido = quitarDelPedido(pedido, id);
        guardarYActualizar();
        mostrarAviso(`${producto.etiqueta} se quitó del pedido.`, "info");

        (listaCarrito.querySelector("[data-accion]") ?? vistaVacio.mensaje).focus();

        return;
    }

    const delta = accion === "aumentar" ? 1 : -1;

    pedido = establecerCantidad(pedido, producto, item.cantidad + delta);
    guardarYActualizar();
    listaCarrito
        .querySelector(`[data-accion="${accion}"][data-id="${id}"]`)
        ?.focus();
});

listaCarrito.addEventListener("change", evento => {
    const input = evento.target.closest("input[data-id]");

    if (!input) {
        return;
    }

    const producto = buscarProductoPorId(productos, input.dataset.id);

    if (!producto) {
        return;
    }

    pedido = establecerCantidad(pedido, producto, Number(input.value));
    guardarYActualizar();
});

checksServicios.forEach(check => check.addEventListener("change", actualizar));

formulario.addEventListener("focusout", evento => {
    const campo = evento.target;

    if (!campo.name || campo.name === "servicios") {
        return;
    }

    const mensaje = validarCampo(campo.name, campo.value);

    if (mensaje) {
        mostrarErrorCampo(campo, mensaje);
    } else {
        limpiarErrorCampo(campo);
    }
});


formulario.addEventListener("input", evento => {
    const campo = evento.target;

    if (campo.getAttribute("aria-invalid") !== "true") {
        return;
    }

    if (validarCampo(campo.name, campo.value) === "") {
        limpiarErrorCampo(campo);
    }
});

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const cotizacion = actualizar();

    if (cotizacion.cantidadTotal === 0) {
        mostrarAviso("Tu pedido está vacío. Agregá productos desde el catálogo.", "error");

        return;
    }

    const datos = leerDatos();
    const errores = validarFormulario(datos);
    const nombresConError = Object.keys(errores);

    camposValidables().forEach(campo => {
        if (errores[campo.name]) {
            mostrarErrorCampo(campo, errores[campo.name]);
        } else {
            limpiarErrorCampo(campo);
        }
    });

    if (nombresConError.length > 0) {
        mostrarAviso("Revisá los campos marcados antes de enviar.", "error");
        formulario.elements[nombresConError[0]].focus();

        return;
    }

    const url = armarUrlWhatsApp(armarMensaje(datos, cotizacion));

    const ventana = window.open(url, "_blank", "noopener,noreferrer");

    enlaceWhatsapp.href = url;
    confirmacion.hidden = false;
    confirmacion.focus();

    mostrarAviso(
        ventana
            ? "Abrimos WhatsApp con tu pedido. Enviá el mensaje para completar la solicitud."
            : "Tu navegador bloqueó la ventana. Usá el enlace de WhatsApp de abajo.",
        ventana ? "exito" : "info"
    );
});

botonVaciar.addEventListener("click", () => {
    vaciarPedido();
    pedido = [];
    formulario.reset();
    camposValidables().forEach(limpiarErrorCampo);
    confirmacion.hidden = true;
    actualizar();
    mostrarAviso("Pedido vaciado.", "info");
});

async function iniciar() {
    try {
        [productos, servicios] = await Promise.all([
            cargarProductos(),
            cargarServicios()
        ]);
    } catch (error) {
        renderErrorCarga(
            { lista: listaCarrito, mensaje: vistaVacio.mensaje, boton: botonEnviar },
            error.message
        );

        return;
    }

    campoFecha.min = fechaLocalISO();

    pedido = sanearPedido(leerPedido(), productos);
    guardarPedido(pedido);

    actualizar();
}

formulario.noValidate = true;

iniciar();
