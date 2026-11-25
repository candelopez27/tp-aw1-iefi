// =====================================================
// MENU.JS — MOLA EVENTOS
// Menú móvil desplegable (se carga en todas las páginas).
// El HTML trae el botón y el menú ya armados; este script
// solo los conecta. Sin JavaScript el menú queda visible
// (ver base.css), así que la navegación nunca se pierde.
// =====================================================

// Le avisa al CSS que hay JavaScript: recién ahí se oculta el menú móvil.
document.documentElement.classList.add("con-js");

const boton = document.getElementById("boton-menu");
const navegacion = document.getElementById("navegacion-principal");
const encabezado = document.querySelector(".encabezado-sitio");

// Debe coincidir con el breakpoint de base.css (desde 768px es escritorio).
const consultaEscritorio = window.matchMedia("(min-width: 768px)");

function estaAbierto() {
    return boton.getAttribute("aria-expanded") === "true";
}

function abrir() {
    navegacion.classList.add("abierta");
    boton.setAttribute("aria-expanded", "true");
}

function cerrar() {
    navegacion.classList.remove("abierta");
    boton.setAttribute("aria-expanded", "false");
}

if (boton && navegacion && encabezado) {
    boton.addEventListener("click", () => {
        if (estaAbierto()) {
            cerrar();
        } else {
            abrir();
        }
    });

    // Escape cierra el menú y devuelve el foco al botón.
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && estaAbierto()) {
            cerrar();
            boton.focus();
        }
    });

    // Un clic fuera del header también lo cierra.
    document.addEventListener("click", evento => {
        if (estaAbierto() && !encabezado.contains(evento.target)) {
            cerrar();
        }
    });

    // Al pasar a escritorio, se restablece el estado del menú.
    consultaEscritorio.addEventListener("change", evento => {
        if (evento.matches) {
            cerrar();
        }
    });
}
