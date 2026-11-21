# EcoTame

Prototipo web para apoyar el registro y seguimiento ciudadano de incidencias relacionadas con residuos sólidos en Tame, Arauca. El proyecto académico se desarrolla como una SPA estática con HTML, CSS y JavaScript, sin servidor ni servicios de autenticación.

## Funcionalidades

- Dashboard con conteos de reportes por tipo de residuo y estado.
- Registro, edición, cambio de estado y eliminación de incidencias.
- Consulta de la descripción y los datos completos de cada incidencia desde la tabla.
- Búsqueda por texto y filtros por tipo de residuo y estado.
- Indicadores y gráficas que se recalculan después de cada cambio.
- Historial cronológico, con los reportes más recientes primero.
- Exportación de todos los reportes a CSV con codificación UTF-8.
- Persistencia en `localStorage` del navegador y actualización entre pestañas del mismo origen.
- Diseño adaptable a pantallas móviles y de escritorio.

Los estados permitidos son `Pendiente`, `En Proceso` y `Resuelto`. Los tipos de residuo son `Reciclable`, `Ordinario` y `Peligroso`.

## Indicadores

- **Porcentaje reciclable:** reportes reciclables / reportes totales × 100.
- **Casos atendidos:** suma de reportes `En Proceso` y `Resuelto`.
- **Casos pendientes:** reportes cuyo estado es `Pendiente`.
- **Eficiencia operativa:** reportes `Resuelto` / reportes totales × 100.
- Si no hay reportes, los porcentajes se muestran como 0 %.

La gráfica de distribución presenta los reportes por tipo de residuo. La gráfica de estados compara los casos pendientes, en proceso y resueltos.

## Ejecución local

1. Abre `index.html` en un navegador moderno o utiliza Live Server desde Visual Studio Code.
2. Registra una incidencia desde **Gestión Residuos**.
3. Administra los casos desde **Incidencias** y consulta los resultados en **Dashboard**, **Indicadores** e **Historial**.

Chart.js y Font Awesome se cargan desde CDN; se requiere conexión a Internet para mostrar las gráficas y los iconos. El resto de la aplicación funciona como contenido estático.

## Despliegue en GitHub Pages

Publica la carpeta del proyecto en un repositorio y configura GitHub Pages para servir la rama y carpeta raíz elegidas. No se requiere compilación ni instalación de dependencias. Conserva las rutas relativas de `css/style.css`, `js/charts.js` y `js/app.js`.

## Persistencia y alcance

Los datos se guardan bajo la clave `reportes` en el almacenamiento local del navegador. No se envían a una entidad municipal ni se sincronizan entre dispositivos o usuarios. Borrar los datos del sitio o cambiar de navegador puede eliminarlos. Por este motivo, el prototipo no debe emplearse como sistema oficial ni para almacenar información sensible.

El sistema es una herramienta académica de bajo nivel para demostraciones, captura de evidencias y pruebas exploratorias de gestión ambiental; no reemplaza los canales oficiales de atención ni una plataforma municipal con backend y controles de acceso.
