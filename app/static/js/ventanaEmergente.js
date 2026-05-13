//

//

function mostrarArchivos(archivos = []) {
  // Elimina cualquier ventana previa
  const existente = document.querySelector(".ventana-emergente");
  if (existente) existente.remove();

  // Crear contenedor principal
  const ventana = document.createElement("div");
  ventana.className = "ventana-emergente";

  // Contenido HTML
  ventana.innerHTML = `
    <div class="ventana-contenido">
      <button class="cerrar-ventana">&times;</button>
      <h2>Seleccionar Archivos</h2>
      
      <!-- Toggle para seleccionar todos -->
      <div class="switch-edicion">
        <label class="switch-toggle">
          <input type="checkbox" id="toggle-seleccion-todos" />
          <span class="slider"></span>
          <span class="label-text">Seleccionar todos</span>
        </label>
      </div>
      
      <div class="tabla-general">
        <table id="tabla_selecionar_archivos_emergente" class="tabla-general">
          <thead>
            <tr>
              <th>#</th>
              <th>Origen</th>
              <th>Archivo</th>
              <th>Fecha publicación</th>
            </tr>
          </thead>
          <tbody>
            ${
              archivos.length
                ? archivos.map((archivo, i) => {
                    return `
                      <tr data-id="${archivo.id}">
                        <td>${i + 1}</td>
                        <td>${archivo.origen}</td>
                        <td title="${archivo.nombre}">${archivo.nombre}</td>
                        <td>${new Date(archivo.fecha).toISOString().slice(0, 10)}</td> 
                      </tr>`;
                  }).join("")
                : `<tr><td colspan="4" style="text-align:center;">No hay archivos para mostrar</td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div class="ventana-acciones">
        <button id="aceptarSeleccion" class="btn-aceptar">
            <i class="fas fa-check-circle"></i> Aceptar
        </button>
      </div>
    </div>
  `;

  // Agregar ventana al DOM
  document.body.appendChild(ventana);

  // Cerrar ventana
  ventana.querySelector(".cerrar-ventana").addEventListener("click", () => {
    ventana.remove();
  });

  // Función para manejar la selección de filas
  const filas = ventana.querySelectorAll("tbody tr[data-id]");
  
  filas.forEach(fila => {
    fila.addEventListener("click", () => {
      fila.classList.toggle("fila-seleccionada");
      actualizarToggleSeleccionTodos();
    });
  });

  // Función para actualizar el estado del toggle "Seleccionar todos"
  function actualizarToggleSeleccionTodos() {
    const toggle = ventana.querySelector("#toggle-seleccion-todos");
    const todasSeleccionadas = filas.length > 0 && 
                               [...filas].every(fila => fila.classList.contains("fila-seleccionada"));
    
    toggle.checked = todasSeleccionadas;
  }

  // Manejar el toggle "Seleccionar todos"
  const toggleTodos = ventana.querySelector("#toggle-seleccion-todos");
  toggleTodos.addEventListener("change", (e) => {
    const seleccionar = e.target.checked;
    
    filas.forEach(fila => {
      if (seleccionar) {
        fila.classList.add("fila-seleccionada");
      } else {
        fila.classList.remove("fila-seleccionada");
      }
    });
  });

  // Aceptar selección
  ventana.querySelector("#aceptarSeleccion").addEventListener("click", () => {
    // Obtener los archivos seleccionados con toda su información
    idsSeleccionados = [...ventana.querySelectorAll(".fila-seleccionada")].map(fila => {
        const celdas = fila.querySelectorAll("td");
        return {
            id: fila.dataset.id,
            origen: celdas[1].textContent.trim(),
            nombre: celdas[2].textContent.trim(),
            fecha: celdas[3].textContent.trim()
        };
    });
    
    console.log("Archivos seleccionados:", idsSeleccionados.length, "de", filas.length);
    
    // Actualizar la lista visual
    actualizarListaArchivosSeleccionados(idsSeleccionados);
    
    ventana.remove();
  });
}

//-----------------------------------------------------------------------------------------------------------------------------
function iniciarCargaProceso() {
  // Elimina cualquier ventana de carga previa
  const existente = document.querySelector(".ventana-carga-proceso");
  if (existente) existente.remove();

  // Crear contenedor
  const ventana = document.createElement("div");
  ventana.className = "ventana-carga-proceso";

  // Crear sistema orbital con 4 esferas y núcleo
  ventana.innerHTML = `
    <div class="sistema-orbital">
      <div class="orbita-acoplada"></div>
      <div class="orbita-acoplada"></div>
      <div class="orbita-acoplada"></div>
      <div class="orbita-acoplada"></div>
    </div>
  `;

  document.body.appendChild(ventana);
}

function terminarCargaProceso() {
  const existente = document.querySelector(".ventana-carga-proceso");
  if (existente) existente.remove();
}

//----------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------
function mostrarPalabrasGramaticales(tipoGramatical, palabras = []) {
  // Elimina cualquier ventana previa
  const existente = document.querySelector(".ventana-emergente");
  if (existente) existente.remove();

  // Crear contenedor principal - SOLO LA VENTANA, sin div interno extra
  const ventana = document.createElement("div");
  ventana.className = "ventana-emergente";
  ventana.style.animation = "fadeIn 0.3s ease-in-out";

  // Contenido HTML - estructura simplificada
  ventana.innerHTML = `
    <div class="ventana-contenido">
      <button class="cerrar-ventana">&times;</button>
      <h2>Palabras - ${tipoGramatical}</h2>
      <div class="info-gramatical">
        <span class="badge-cantidad">${palabras.length} palabras</span>
      </div>
      <div class="tabla-general">
        <table id="tabla_palabras_gramaticales" class="tabla-general">
          <thead>
            <tr>
              <th>#</th>
              <th>Palabra</th>
              <th>Longitud</th>
            </tr>
          </thead>
          <tbody>
            ${
              palabras.length
                ? palabras.map((palabra, i) => {
                    return `
                      <tr data-palabra="${palabra}">
                        <td>${i + 1}</td>
                        <td class="palabra-texto" title="${palabra}">${palabra}</td>
                        <td>${palabra.length} caracteres</td>
                      </tr>`;
                  }).join("")
                : `<tr><td colspan="3" style="text-align:center;">No hay palabras para esta categoría</td></tr>`
            }
          </tbody>
        </table>
      </div>
     </div>
  `;

  // Agregar ventana al DOM
  document.body.appendChild(ventana);

  // Cerrar ventana
  ventana.querySelector(".cerrar-ventana").addEventListener("click", () => {
    ventana.remove();
  });

  // Resaltar palabras al pasar el mouse
  const filas = ventana.querySelectorAll("tbody tr[data-palabra]");
  filas.forEach(fila => {
    fila.addEventListener("mouseenter", () => {
      const palabra = fila.dataset.palabra;
      filas.forEach(f => {
        if (f.dataset.palabra === palabra) {
          f.classList.add('palabra-resaltada');
        }
      });
    });

    fila.addEventListener("mouseleave", () => {
      filas.forEach(f => {
        f.classList.remove('palabra-resaltada');
      });
    });
  });
}