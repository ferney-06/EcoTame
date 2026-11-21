const STORAGE_KEY = "reportes";
const ESTADOS = ["Pendiente", "En Proceso", "Resuelto"];
const TIPOS_RESIDUO = ["Reciclable", "Ordinario", "Peligroso"];

const formulario = document.getElementById("formReporte");
const camposReporte = {
    id: document.getElementById("reporteId"),
    nombre: document.getElementById("nombre"),
    barrio: document.getElementById("barrio"),
    tipo: document.getElementById("tipoResiduo"),
    ubicacion: document.getElementById("ubicacion"),
    descripcion: document.getElementById("descripcion")
};
const tablaIncidencias = document.getElementById("tablaDatos");
const tablaHistorial = document.getElementById("tablaHistorial");
const notificaciones = document.getElementById("notificaciones");
const dialogoDetalles = document.getElementById("dialogoDetalles");
const camposDetalle = {
    nombre: document.getElementById("detalleNombre"),
    barrio: document.getElementById("detalleBarrio"),
    tipo: document.getElementById("detalleTipo"),
    ubicacion: document.getElementById("detalleUbicacion"),
    fecha: document.getElementById("detalleFecha"),
    estado: document.getElementById("detalleEstado"),
    descripcion: document.getElementById("detalleDescripcion")
};

function mostrarNotificacion(mensaje, tipo = "success") {
    if (!notificaciones) {
        window.alert(mensaje);
        return;
    }

    const aviso = document.createElement("div");
    aviso.className = `toast toast-${tipo}`;
    aviso.setAttribute("role", tipo === "error" ? "alert" : "status");
    aviso.textContent = mensaje;
    notificaciones.appendChild(aviso);

    window.setTimeout(() => {
        aviso.classList.add("toast-out");
        aviso.addEventListener("transitionend", () => aviso.remove(), { once: true });
        window.setTimeout(() => aviso.remove(), 300);
    }, 4500);
}

function esReporteValido(reporte) {
    return reporte &&
        (typeof reporte.id === "string" || typeof reporte.id === "number") &&
        typeof reporte.nombre === "string" &&
        typeof reporte.barrio === "string" &&
        TIPOS_RESIDUO.includes(reporte.tipo) &&
        ESTADOS.includes(reporte.estado);
}

function cargarReportes() {
    let contenido;
    try {
        contenido = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error("EcoTame no pudo acceder al almacenamiento local.", error);
        mostrarNotificacion("El navegador no permitió leer los reportes guardados.", "error");
        return [];
    }

    if (!contenido) return [];

    let datos;
    try {
        datos = JSON.parse(contenido);
    } catch (error) {
        console.error("Los reportes guardados no contienen JSON válido.", error);
        mostrarNotificacion("Los datos guardados no se pudieron interpretar. Revisa el almacenamiento local.", "error");
        return [];
    }

    if (!Array.isArray(datos)) {
        console.error("El formato guardado para los reportes no es una lista.");
        mostrarNotificacion("El formato de los reportes guardados no es válido.", "error");
        return [];
    }

    const reportesValidos = datos.filter(esReporteValido);
    if (reportesValidos.length !== datos.length) {
        console.warn(`EcoTame omitió ${datos.length - reportesValidos.length} registro(s) con formato inválido.`);
    }

    return reportesValidos.map(reporte => ({
        ...reporte,
        id: String(reporte.id),
        ubicacion: typeof reporte.ubicacion === "string" ? reporte.ubicacion : "",
        descripcion: typeof reporte.descripcion === "string" ? reporte.descripcion : "",
        fecha: typeof reporte.fecha === "string" ? reporte.fecha : "",
        fechaISO: typeof reporte.fechaISO === "string" ? reporte.fechaISO : ""
    }));
}

let reportes = cargarReportes();

function guardarReportes(nuevosReportes) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosReportes));
        reportes = nuevosReportes;
        return true;
    } catch (error) {
        console.error("EcoTame no pudo guardar los cambios en el almacenamiento local.", error);
        mostrarNotificacion("No se guardaron los cambios. Verifica los permisos o el espacio del navegador.", "error");
        return false;
    }
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[caracter]);
}

function obtenerFecha(reporte) {
    if (reporte.fechaISO) {
        const fechaISO = new Date(reporte.fechaISO);
        if (!Number.isNaN(fechaISO.getTime())) return fechaISO;
    }

    const fechaLegada = String(reporte.fecha || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (fechaLegada) {
        return new Date(
            Number(fechaLegada[3]),
            Number(fechaLegada[2]) - 1,
            Number(fechaLegada[1])
        );
    }

    const idFecha = Number(reporte.id);
    return Number.isFinite(idFecha) ? new Date(idFecha) : new Date(0);
}

function formatoFecha(fecha) {
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(fecha);
}

function obtenerClaseEstado(estado) {
    if (estado === "Pendiente") return "estado-pendiente";
    if (estado === "En Proceso") return "estado-proceso";
    if (estado === "Resuelto") return "estado-resuelto";
    return "";
}

function reportesPorFechaDescendente() {
    return [...reportes].sort((a, b) => obtenerFecha(b) - obtenerFecha(a));
}

function reportesFiltrados() {
    const texto = document.getElementById("buscarIncidencias").value
        .trim()
        .toLocaleLowerCase("es-CO");
    const tipo = document.getElementById("filtroTipo").value;
    const estado = document.getElementById("filtroEstado").value;

    return reportesPorFechaDescendente().filter(reporte => {
        const coincideTipo = !tipo || reporte.tipo === tipo;
        const coincideEstado = !estado || reporte.estado === estado;
        const valores = [
            reporte.id,
            reporte.nombre,
            reporte.barrio,
            reporte.tipo,
            reporte.ubicacion,
            reporte.descripcion,
            reporte.estado
        ];
        const coincideTexto = !texto || valores.some(valor =>
            String(valor || "").toLocaleLowerCase("es-CO").includes(texto)
        );
        return coincideTipo && coincideEstado && coincideTexto;
    });
}

function renderizarIncidencias() {
    const visibles = reportesFiltrados();

    tablaIncidencias.innerHTML = visibles.map(reporte => {
        const id = escaparHTML(reporte.id);
        const estado = escaparHTML(reporte.estado);
        const opcionesEstado = ESTADOS.map(opcion => `
            <option value="${opcion}" ${reporte.estado === opcion ? "selected" : ""}>${opcion}</option>
        `).join("");

        return `
            <tr>
                <td>${id}</td>
                <td>${escaparHTML(reporte.nombre)}</td>
                <td>${escaparHTML(reporte.barrio)}</td>
                <td>${escaparHTML(reporte.tipo)}</td>
                <td>${escaparHTML(reporte.ubicacion || "Sin especificar")}</td>
                <td>${escaparHTML(formatoFecha(obtenerFecha(reporte)))}</td>
                <td><span class="${obtenerClaseEstado(estado)}">${estado}</span></td>
                <td class="actions-cell">
                    <label class="sr-only" for="estado-${id}">Estado del reporte ${id}</label>
                    <div class="actions-row">
                        <select id="estado-${id}" data-accion="estado" data-id="${id}">
                            ${opcionesEstado}
                        </select>
                        <div class="action-buttons">
                            <button class="button-small button-secondary" type="button" data-accion="detalles" data-id="${id}" aria-label="Ver detalles del reporte ${id}">
                                <i class="fas fa-eye" aria-hidden="true"></i> Ver detalles
                            </button>
                            <button class="button-small button-secondary" type="button" data-accion="editar" data-id="${id}" aria-label="Editar reporte ${id}">
                                <i class="fas fa-pen" aria-hidden="true"></i> Editar
                            </button>
                            <button class="button-small button-danger" type="button" data-accion="eliminar" data-id="${id}" aria-label="Eliminar reporte ${id}">
                                <i class="fas fa-trash" aria-hidden="true"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </td>
            </tr>`;
    }).join("");

    const contador = document.getElementById("contadorIncidencias");
    contador.textContent = `${visibles.length} de ${reportes.length} reportes`;

    const vacio = document.getElementById("sinIncidencias");
    vacio.hidden = visibles.length > 0;
    if (!reportes.length) {
        vacio.textContent = "Aún no hay incidencias registradas.";
    } else {
        vacio.textContent = "No hay incidencias que coincidan con los filtros.";
    }
}

function renderizarHistorial() {
    const ordenados = reportesPorFechaDescendente();
    tablaHistorial.innerHTML = ordenados.map(reporte => `
        <tr>
            <td>${escaparHTML(formatoFecha(obtenerFecha(reporte)))}</td>
            <td>${escaparHTML(reporte.nombre)}</td>
            <td>${escaparHTML(reporte.barrio)}</td>
            <td>${escaparHTML(reporte.tipo)}</td>
            <td><span class="${obtenerClaseEstado(reporte.estado)}">${escaparHTML(reporte.estado)}</span></td>
        </tr>`).join("");

    const vacio = document.getElementById("sinHistorial");
    if (vacio) vacio.hidden = ordenados.length > 0;
}

function actualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor);
}

function actualizarSistema() {
    const cantidadesTipo = Object.fromEntries(TIPOS_RESIDUO.map(tipo => [
        tipo,
        reportes.filter(reporte => reporte.tipo === tipo).length
    ]));
    const cantidadesEstado = Object.fromEntries(ESTADOS.map(estado => [
        estado,
        reportes.filter(reporte => reporte.estado === estado).length
    ]));
    const total = reportes.length;
    const atendidos = cantidadesEstado["En Proceso"] + cantidadesEstado.Resuelto;
    const reciclablesPct = total
        ? Math.round((cantidadesTipo.Reciclable / total) * 100)
        : 0;
    const eficienciaPct = total
        ? Math.round((cantidadesEstado.Resuelto / total) * 100)
        : 0;

    actualizarElemento("totalReportes", total);
    actualizarElemento("reciclables", cantidadesTipo.Reciclable);
    actualizarElemento("ordinarios", cantidadesTipo.Ordinario);
    actualizarElemento("peligrosos", cantidadesTipo.Peligroso);
    actualizarElemento("kpiPendientes", cantidadesEstado.Pendiente);
    actualizarElemento("kpiProceso", cantidadesEstado["En Proceso"]);
    actualizarElemento("kpiResueltos", cantidadesEstado.Resuelto);
    actualizarElemento("porcentajeReciclable", `${reciclablesPct}%`);
    actualizarElemento("indicadorTotal", total);
    actualizarElemento("casosAtendidos", atendidos);
    actualizarElemento("casosPendientes", cantidadesEstado.Pendiente);
    actualizarElemento("eficienciaOperativa", `${eficienciaPct}%`);

    renderizarIncidencias();
    renderizarHistorial();

    if (typeof actualizarGraficas === "function") {
        actualizarGraficas(
            cantidadesTipo.Reciclable,
            cantidadesTipo.Ordinario,
            cantidadesTipo.Peligroso,
            cantidadesEstado.Pendiente,
            cantidadesEstado["En Proceso"],
            cantidadesEstado.Resuelto
        );
    }
}

function navegarA(destino) {
    const destinoValido = document.getElementById(destino);
    if (!destinoValido || !destinoValido.classList.contains("vista")) return;

    document.querySelectorAll(".menu").forEach(menu => {
        const activo = menu.dataset.vista === destino;
        menu.classList.toggle("active", activo);
        if (activo) {
            menu.setAttribute("aria-current", "page");
        } else {
            menu.removeAttribute("aria-current");
        }
    });
    document.querySelectorAll(".vista").forEach(vista => {
        vista.classList.toggle("activa", vista.id === destino);
    });

    if (destino === "indicadores" && typeof graficaResiduos !== "undefined") {
        window.requestAnimationFrame(() => {
            graficaResiduos?.resize();
            graficaEstados?.resize();
        });
    }
}

document.querySelectorAll(".menu").forEach(menu => {
    menu.addEventListener("click", () => navegarA(menu.dataset.vista));
    menu.addEventListener("keydown", evento => {
        if (evento.key === "Enter" || evento.key === " ") {
            evento.preventDefault();
            navegarA(menu.dataset.vista);
        }
    });
});

document.querySelectorAll("[data-ir-a]").forEach(boton => {
    boton.addEventListener("click", () => navegarA(boton.dataset.irA));
});

function limpiarFormulario() {
    formulario.reset();
    camposReporte.id.value = "";
    document.getElementById("btnGuardarReporte").innerHTML =
        '<i class="fas fa-floppy-disk" aria-hidden="true"></i> Registrar incidencia';
    document.getElementById("btnCancelarEdicion").hidden = true;
}

function editarReporte(id) {
    const reporte = reportes.find(item => String(item.id) === String(id));
    if (!reporte) return;

    camposReporte.id.value = reporte.id;
    camposReporte.nombre.value = reporte.nombre;
    camposReporte.barrio.value = reporte.barrio;
    camposReporte.tipo.value = reporte.tipo;
    camposReporte.ubicacion.value = reporte.ubicacion;
    camposReporte.descripcion.value = reporte.descripcion;
    document.getElementById("btnGuardarReporte").innerHTML =
        '<i class="fas fa-floppy-disk" aria-hidden="true"></i> Guardar cambios';
    document.getElementById("btnCancelarEdicion").hidden = false;
    navegarA("gestion");
    camposReporte.nombre.focus();
}

function mostrarDetallesReporte(id) {
    const reporte = reportes.find(item => String(item.id) === String(id));
    if (!reporte) return;

    camposDetalle.nombre.textContent = reporte.nombre;
    camposDetalle.barrio.textContent = reporte.barrio;
    camposDetalle.tipo.textContent = reporte.tipo;
    camposDetalle.ubicacion.textContent = reporte.ubicacion || "Sin especificar";
    camposDetalle.fecha.textContent = formatoFecha(obtenerFecha(reporte));
    camposDetalle.estado.textContent = reporte.estado;
    camposDetalle.estado.className = obtenerClaseEstado(reporte.estado);
    camposDetalle.descripcion.textContent = reporte.descripcion || "Sin descripción disponible.";
    dialogoDetalles.showModal();
}

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    const idEdicion = camposReporte.id.value;
    const original = idEdicion
        ? reportes.find(reporte => String(reporte.id) === idEdicion)
        : null;
    const ahora = new Date();
    const fechaISO = original?.fechaISO || (original
        ? obtenerFecha(original).toISOString()
        : ahora.toISOString());
    const reporte = {
        id: original ? String(original.id) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nombre: camposReporte.nombre.value.trim(),
        barrio: camposReporte.barrio.value.trim(),
        tipo: camposReporte.tipo.value,
        ubicacion: camposReporte.ubicacion.value.trim(),
        descripcion: camposReporte.descripcion.value.trim(),
        estado: original?.estado || "Pendiente",
        fecha: original?.fecha || new Intl.DateTimeFormat("es-CO").format(new Date(fechaISO)),
        fechaISO
    };

    const nuevosReportes = original
        ? reportes.map(item => String(item.id) === String(original.id) ? reporte : item)
        : [...reportes, reporte];

    if (!guardarReportes(nuevosReportes)) return;
    limpiarFormulario();
    actualizarSistema();
    mostrarNotificacion(original ? "Incidencia actualizada correctamente." : "Incidencia registrada correctamente.");
});

document.getElementById("btnCancelarEdicion").addEventListener("click", () => {
    limpiarFormulario();
    mostrarNotificacion("Edición cancelada.");
});

tablaIncidencias.addEventListener("change", evento => {
    if (!(evento.target instanceof Element)) return;
    const selector = evento.target.closest('select[data-accion="estado"]');
    if (!selector || !ESTADOS.includes(selector.value)) return;

    const nuevosReportes = reportes.map(reporte =>
        String(reporte.id) === selector.dataset.id
            ? { ...reporte, estado: selector.value }
            : reporte
    );
    if (guardarReportes(nuevosReportes)) actualizarSistema();
});

tablaIncidencias.addEventListener("click", evento => {
    if (!(evento.target instanceof Element)) return;
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    if (boton.dataset.accion === "detalles") {
        mostrarDetallesReporte(boton.dataset.id);
        return;
    }

    if (boton.dataset.accion === "editar") {
        editarReporte(boton.dataset.id);
        return;
    }

    if (boton.dataset.accion === "eliminar") {
        const reporte = reportes.find(item => String(item.id) === boton.dataset.id);
        if (!reporte || !window.confirm(`¿Eliminar el reporte de ${reporte.nombre}? Esta acción no se puede deshacer.`)) return;

        const nuevosReportes = reportes.filter(item => String(item.id) !== boton.dataset.id);
        if (guardarReportes(nuevosReportes)) {
            actualizarSistema();
            mostrarNotificacion("Incidencia eliminada.");
        }
    }
});

dialogoDetalles.querySelectorAll("[data-cerrar-detalles]").forEach(boton => {
    boton.addEventListener("click", () => dialogoDetalles.close());
});

dialogoDetalles.addEventListener("click", evento => {
    if (evento.target === dialogoDetalles) dialogoDetalles.close();
});

["buscarIncidencias", "filtroTipo", "filtroEstado"].forEach(id => {
    const control = document.getElementById(id);
    control.addEventListener("input", renderizarIncidencias);
    control.addEventListener("change", renderizarIncidencias);
});

function protegerFormulaCSV(valor) {
    const texto = String(valor ?? "");
    return /^[\s\u0000-\u001f]*[=+\-@]/.test(texto) ? `'${texto}` : texto;
}

function exportarCSV() {
    const encabezados = ["ID", "Nombre", "Barrio", "Tipo", "Ubicación", "Descripción", "Estado", "Fecha"];
    const filas = reportesPorFechaDescendente().map(reporte => [
        reporte.id,
        reporte.nombre,
        reporte.barrio,
        reporte.tipo,
        reporte.ubicacion,
        reporte.descripcion,
        reporte.estado,
        formatoFecha(obtenerFecha(reporte))
    ]);
    const escaparCampo = valor => `"${protegerFormulaCSV(valor).replace(/"/g, '""')}"`;
    const csv = [encabezados, ...filas]
        .map(fila => fila.map(escaparCampo).join(","))
        .join("\r\n");
    const archivo = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "EcoTame_incidencias.csv";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    mostrarNotificacion("Archivo CSV generado con todos los reportes.");
}

document.getElementById("btnExportar").addEventListener("click", exportarCSV);

window.addEventListener("storage", evento => {
    if (evento.key !== STORAGE_KEY && evento.key !== null) return;
    reportes = cargarReportes();
    actualizarSistema();
});

actualizarSistema();
