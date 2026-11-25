import { cargarProductos } from "./modulos/datos.js";
import { filtrarProductos, leerPrecio, CRITERIOS_VACIOS } from "./modulos/filtros.js";
import {
    agregarAlPedido,
    buscarProductoPorId,
    calcularTotales,
    quitarDelPedido,
    sanearPedido
} from "./modulos/pedido.js";
import { guardarPedido, leerPedido } from "./modulos/almacenamiento.js";
import { renderError, renderPedido, renderProductos } from "./modulos/vista-catalogo.js";
import { mostrarAviso } from "./modulos/notificaciones.js";

// ---------- Referencias al DOM ----------
const grillaProductos = document.getElementById("grilla-productos");
const campoBusqueda = document.getElementById("buscar-producto");
const precioMinimo = document.getElementById("precio-minimo");
const precioMaximo = document.getElementById("precio-maximo");
const botonLimpiar = document.getElementById("limpiar-filtros");
const categorias = document.querySelectorAll(".boton-categoria");
const eventos = document.querySelectorAll('input[name="evento"]');
const cantidadCategoria = document.getElementById("cantidad-categoria");

const vistaPedido = {
    lista: document.getElementById("lista-pedido"),
    cantidad: document.getElementById("cantidad-pedido"),
    importe: document.getElementById("importe-total")
};

let productos = [];
let pedido = [];
let categoriaSeleccionada = "todas";

function leerCriterios() {
    return {
        ...CRITERIOS_VACIOS,
        texto: campoBusqueda.value,
        categoria: categoriaSeleccionada,
        precioMin: leerPrecio(precioMinimo.value, 0),
        precioMax: leerPrecio(precioMaximo.value, Infinity),
        eventos: Array.from(eventos)
            .filter(evento => evento.checked)
            .map(evento => evento.value)
    };
}

function aplicarFiltros() {
    renderProductos(grillaProductos, filtrarProductos(productos, leerCriterios()));
}

function marcarCategoriaActiva(categoriaActiva) {
    categorias.forEach(enlace => {
        enlace.classList.toggle("categoria-activa", enlace === categoriaActiva);
    });
}
function actualizarPedido() {
    renderPedido(vistaPedido, calcularTotales(pedido, productos));
}

function cambiarCantidad(id, accion) {
    const producto = buscarProductoPorId(productos, id);
    const elementoCantidad = document.getElementById(`cantidad-${id}`);

    if (!producto || !elementoCantidad) {
        return;
    }

    let cantidad = Number(elementoCantidad.textContent);

    if (accion === "aumentar" && cantidad < producto.stock) {
        cantidad++;
    }

    if (accion === "disminuir" && cantidad > 1) {
        cantidad--;
    }

    elementoCantidad.textContent = cantidad;
}

function agregarProducto(id) {
    const producto = buscarProductoPorId(productos, id);
    const elementoCantidad = document.getElementById(`cantidad-${id}`);

    if (!producto || !elementoCantidad) {
        return;
    }

    const resultado = agregarAlPedido(
        pedido,
        producto,
        Number(elementoCantidad.textContent)
    );

    if (!resultado.ok) {
        mostrarAviso(resultado.mensaje, "error");

        return;
    }

    pedido = resultado.pedido;

    if (!guardarPedido(pedido)) {
        mostrarAviso("No pudimos guardar tu pedido en este navegador.", "error");
    }

    actualizarPedido();
    mostrarAviso(resultado.mensaje, "exito");
}

grillaProductos.addEventListener("click", evento => {
    const botonCantidad = evento.target.closest(".boton-cantidad");

    if (botonCantidad) {
        cambiarCantidad(botonCantidad.dataset.id, botonCantidad.dataset.accion);

        return;
    }

    const botonAgregar = evento.target.closest(".boton-agregar");

    if (botonAgregar) {
        agregarProducto(botonAgregar.dataset.id);
    }
});

vistaPedido.lista.addEventListener("click", evento => {
    const botonEliminar = evento.target.closest("[data-eliminar]");

    if (!botonEliminar) {
        return;
    }

    pedido = quitarDelPedido(pedido, botonEliminar.dataset.eliminar);
    guardarPedido(pedido);
    actualizarPedido();
});

campoBusqueda.addEventListener("input", aplicarFiltros);
precioMinimo.addEventListener("input", aplicarFiltros);
precioMaximo.addEventListener("input", aplicarFiltros);

eventos.forEach(evento => {
    evento.addEventListener("change", aplicarFiltros);
});

categorias.forEach(categoria => {
    categoria.addEventListener("click", evento => {
        evento.preventDefault();

        categoriaSeleccionada = categoria.dataset.categoria;
        marcarCategoriaActiva(categoria);
        aplicarFiltros();
    });
});

botonLimpiar.addEventListener("click", () => {
    campoBusqueda.value = "";
    precioMinimo.value = "";
    precioMaximo.value = "";
    eventos.forEach(evento => {
        evento.checked = false;
    });

    categoriaSeleccionada = "todas";
    marcarCategoriaActiva(document.querySelector('[data-categoria="todas"]'));
    aplicarFiltros();
});

async function iniciar() {
    try {
        productos = await cargarProductos();
    } catch (error) {
        renderError(grillaProductos, error.message);

        return;
    }

    pedido = sanearPedido(leerPedido(), productos);
    guardarPedido(pedido);

    cantidadCategoria.textContent = productos.length;

    aplicarFiltros();
    actualizarPedido();
}

iniciar();
