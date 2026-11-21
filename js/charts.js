let graficaResiduos = null;
let graficaEstados = null;

const coloresGrafica = {
    verde: "#52b788",
    verdeClaro: "#95d5b2",
    amarillo: "#e8b44d",
    rojo: "#d65b60",
    fondo: "#081c15",
    texto: "#d8eee0",
    cuadricula: "rgba(149, 213, 178, .14)"
};

function actualizarGraficaResiduos(reciclables, ordinarios, peligrosos) {
    const canvas = document.getElementById("graficaResiduos");
    if (!canvas) return;

    const datos = [reciclables, ordinarios, peligrosos];
    if (!graficaResiduos) {
        if (typeof Chart === "undefined") {
            console.error("Chart.js no está disponible; no se pudo dibujar la gráfica de residuos.");
            return;
        }

        graficaResiduos = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: ["Reciclables", "Ordinarios", "Peligrosos"],
                datasets: [{
                    data: datos,
                    backgroundColor: [
                        coloresGrafica.verde,
                        coloresGrafica.amarillo,
                        coloresGrafica.rojo
                    ],
                    borderWidth: 3,
                    borderColor: coloresGrafica.fondo,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "66%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: coloresGrafica.texto,
                            padding: 18,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        return;
    }

    graficaResiduos.data.datasets[0].data = datos;
    graficaResiduos.update("none");
}

function actualizarGraficaEstados(pendientes, procesos, resueltos) {
    const canvas = document.getElementById("graficaEstados");
    if (!canvas) return;

    const datos = [pendientes, procesos, resueltos];
    if (!graficaEstados) {
        if (typeof Chart === "undefined") {
            console.error("Chart.js no está disponible; no se pudo dibujar la gráfica de estados.");
            return;
        }

        graficaEstados = new Chart(canvas, {
            type: "bar",
            data: {
                labels: ["Pendientes", "En proceso", "Resueltos"],
                datasets: [{
                    label: "Casos",
                    data: datos,
                    backgroundColor: [
                        coloresGrafica.rojo,
                        coloresGrafica.amarillo,
                        coloresGrafica.verde
                    ],
                    borderRadius: 7,
                    maxBarThickness: 54
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: coloresGrafica.texto },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: coloresGrafica.texto,
                            precision: 0
                        },
                        grid: { color: coloresGrafica.cuadricula }
                    }
                }
            }
        });
        return;
    }

    graficaEstados.data.datasets[0].data = datos;
    graficaEstados.update("none");
}

function actualizarGraficas(reciclables, ordinarios, peligrosos, pendientes, procesos, resueltos) {
    actualizarGraficaResiduos(reciclables, ordinarios, peligrosos);
    actualizarGraficaEstados(pendientes, procesos, resueltos);
}
