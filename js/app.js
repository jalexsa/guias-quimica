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
    },

    estadisticas: {
        endpoint: "https://cphiztezgibdcyzomvzw.supabase.co/functions/v1/registrar-evento",
        guia: "concentraciones-quimicas"
    }
};


/* =========================================================
   ELEMENTOS DE LA PÁGINA
   ========================================================= */

const tituloGuia = document.getElementById("titulo-guia");
const textoLiberacion = document.getElementById("texto-liberacion");
const cuentaRegresiva = document.getElementById("cuenta-regresiva");

const botonesBloqueados = document.getElementById("botones-bloqueados");
const botonesSolucionario = document.getElementById("botones-solucionario");

const verGuia = document.getElementById("ver-guia");
const descargarGuia = document.getElementById("descargar-guia");

const verSolucionario = document.getElementById("ver-solucionario");
const descargarSolucionario = document.getElementById("descargar-solucionario");


/* =========================================================
   CONFIGURACIÓN DE ENLACES
   ========================================================= */

tituloGuia.textContent = CONFIG.titulo;

verGuia.href = CONFIG.guiaActual.ver;
descargarGuia.href = CONFIG.guiaActual.descargar;

verSolucionario.href = CONFIG.solucionario.ver;
descargarSolucionario.href = CONFIG.solucionario.descargar;


/* =========================================================
   CUENTA REGRESIVA
   ========================================================= */

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


/* =========================================================
   IDENTIFICADOR ANÓNIMO DE SESIÓN
   ========================================================= */

function obtenerSesion() {
    let sesion = sessionStorage.getItem("sesion_guias");

    if (!sesion) {
        if (crypto.randomUUID) {
            sesion = crypto.randomUUID();
        } else {
            sesion =
                Date.now().toString(36) +
                "-" +
                Math.random().toString(36).slice(2);
        }

        sessionStorage.setItem("sesion_guias", sesion);
    }

    return sesion;
}

const SESION = obtenerSesion();


/* =========================================================
   REGISTRO DE ESTADÍSTICAS
   ========================================================= */

async function registrarEvento(
    evento,
    recurso,
    duracionSegundos = null
) {
    const datos = {
        evento: evento,
        recurso: recurso,
        guia: CONFIG.estadisticas.guia,
        sesion: SESION,
        duracion_segundos: duracionSegundos
    };

    try {
        await fetch(CONFIG.estadisticas.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos),
            credentials: "omit",
            keepalive: true
        });
    } catch (error) {
        console.warn(
            "No se pudo registrar la estadística:",
            error
        );
    }
}


/* =========================================================
   APERTURA DE LA PÁGINA
   ========================================================= */

registrarEvento(
    "pagina_abierta",
    "sitio"
);


/* =========================================================
   CLICS EN GUÍA Y SOLUCIONARIO
   ========================================================= */

verGuia.addEventListener("click", () => {
    registrarEvento(
        "guia_abierta",
        "guia-alumno"
    );
});

descargarGuia.addEventListener("click", () => {
    registrarEvento(
        "guia_descargada",
        "guia-alumno"
    );
});

verSolucionario.addEventListener("click", () => {
    registrarEvento(
        "solucionario_abierto",
        "solucionario"
    );
});

descargarSolucionario.addEventListener("click", () => {
    registrarEvento(
        "solucionario_descargado",
        "solucionario"
    );
});


/* =========================================================
   TIEMPO ACTIVO
   ========================================================= */

let segundosActivosPendientes = 0;

setInterval(() => {
    if (
        document.visibilityState === "visible" &&
        document.hasFocus()
    ) {
        segundosActivosPendientes += 1;
    }
}, 1000);


/*
Envía los segundos acumulados cada 30 segundos.
Solo registra tiempo con la pestaña visible y activa.
*/

setInterval(() => {
    if (segundosActivosPendientes <= 0) {
        return;
    }

    const segundosAEnviar = segundosActivosPendientes;

    segundosActivosPendientes = 0;

    registrarEvento(
        "tiempo_activo",
        "sitio",
        segundosAEnviar
    );
}, 30000);


/*
Si el usuario cambia de pestaña o minimiza,
intentamos enviar el tiempo pendiente.
*/

document.addEventListener("visibilitychange", () => {
    if (
        document.visibilityState === "hidden" &&
        segundosActivosPendientes > 0
    ) {
        const segundosAEnviar = segundosActivosPendientes;

        segundosActivosPendientes = 0;

        registrarEvento(
            "tiempo_activo",
            "sitio",
            segundosAEnviar
        );
    }
});


/* =========================================================
   INICIO
   ========================================================= */

actualizarLiberacion();

setInterval(
    actualizarLiberacion,
    1000
);