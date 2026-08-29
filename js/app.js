const CONFIG = {
    titulo: "Concentraciones químicas",

    fechaLiberacion: "2026-08-31T15:30:00-04:00",

    guiaActual: {
        ver: "pdf/actual/guia-alumno.pdf",
        descargar: "pdf/actual/guia-alumno.pdf"
    },

    solucionario: {
        ver: "https://cphiztezgibdcyzomvzw.supabase.co/functions/v1/liberar-solucionario",
        descargar: "https://cphiztezgibdcyzomvzw.supabase.co/functions/v1/liberar-solucionario"
    }
};
const tituloGuia = document.getElementById("titulo-guia");
const textoLiberacion = document.getElementById("texto-liberacion");
const cuentaRegresiva = document.getElementById("cuenta-regresiva");

const botonesBloqueados = document.getElementById("botones-bloqueados");
const botonesSolucionario = document.getElementById("botones-solucionario");

const verGuia = document.getElementById("ver-guia");
const descargarGuia = document.getElementById("descargar-guia");

const verSolucionario = document.getElementById("ver-solucionario");
const descargarSolucionario = document.getElementById("descargar-solucionario");

tituloGuia.textContent = CONFIG.titulo;

verGuia.href = CONFIG.guiaActual.ver;
descargarGuia.href = CONFIG.guiaActual.descargar;

verSolucionario.href = CONFIG.solucionario.ver;
descargarSolucionario.href = CONFIG.solucionario.descargar;

function formatearFecha(fecha) {
    return new Intl.DateTimeFormat("es-CL", {
        dateStyle: "long",
        timeStyle: "short"
    }).format(fecha);
}

function actualizarLiberacion() {
    const ahora = new Date();
    const liberacion = new Date(CONFIG.fechaLiberacion);

    const diferencia = liberacion - ahora;

    textoLiberacion.textContent =
        "Disponible desde " + formatearFecha(liberacion);

    if (diferencia <= 0) {
        cuentaRegresiva.textContent = "Soluciones disponibles";

        botonesBloqueados.classList.add("oculto");
        botonesSolucionario.classList.remove("oculto");

        return;
    }

    botonesBloqueados.classList.remove("oculto");
    botonesSolucionario.classList.add("oculto");

    const segundosTotales = Math.floor(diferencia / 1000);

    const dias = Math.floor(segundosTotales / 86400);

    const horas = Math.floor(
        (segundosTotales % 86400) / 3600
    );

    const minutos = Math.floor(
        (segundosTotales % 3600) / 60
    );

    const segundos = segundosTotales % 60;

    const partes = [];

    if (dias > 0) {
        partes.push(`${dias} d`);
    }

    partes.push(
        String(horas).padStart(2, "0") +
        ":" +
        String(minutos).padStart(2, "0") +
        ":" +
        String(segundos).padStart(2, "0")
    );

    cuentaRegresiva.textContent = partes.join(" ");
}

actualizarLiberacion();

setInterval(actualizarLiberacion, 1000);