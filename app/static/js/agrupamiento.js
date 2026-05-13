//Variables globales para el depliege del procesamiento NLP
let idsSeleccionados = [];
let vocabularios = [];
let id_texto_procesado = null;
let id_proceso_agrupacion = null;
//Variables globales para el depliege de la agrupacción Descripción General 
let modoActual = '2D'; // Estado inicial
let embeddings_latentes = [];
let asignacion_clusters = [];
let interpretacion = [];
let descripcion = [];
let archivos_vocabularios  = [];
let metricas = [];


let chart = null;
let chart1 = null;
let archivos_procesados = {};
let palabras_procesadas = {};
let palabra_mas_frecuentes = {};
let palabra_menos_frecuentes = {};

// .............................................................

// Función para el botón de alternar el menú de configuración

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleMenuBtn");
  const menu = document.querySelector(".menu-configuracion");
  const icon = toggleBtn.querySelector(".icono-toggle");

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("oculto");

    // Alternar ícono de flecha
    if (menu.classList.contains("oculto")) {
      icon.classList.remove("fa-chevron-down");
      icon.classList.add("fa-chevron-up");
    } else {
      icon.classList.remove("fa-chevron-up");
      icon.classList.add("fa-chevron-down");
    }
  });
});

// .............................................................

// Función para controlar el despliege del menu inicial de las vistas

document.addEventListener("DOMContentLoaded", () => {
const menuLinks = document.querySelectorAll(".menu-vistas a");
const secciones = document.querySelectorAll(".contenido-vistas-resultados");

// Oculta todas las secciones
function ocultarSecciones() {
    secciones.forEach(seccion => {
    seccion.style.display = "none";
    });
}

// Mostrar solo una
function mostrarSeccion(id) {
    const target = document.getElementById(id);
    if (target) {
    target.style.display = "block";
    }
}

    // Inicialmente mostrar la primera
    ocultarSecciones();
    mostrarSeccion("nlp");

    // Evento para cada enlace del menú
    menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.dataset.target;

    ocultarSecciones();
    mostrarSeccion(targetId);

    // Opcional: manejar clases activas visualmente
    menuLinks.forEach(l => l.classList.remove("activo"));
    link.classList.add("activo");
    });
});
});


//Funcion para cambiar de vistas del menú
function cambiarMenuVistas(idSeccion) {
  const secciones = document.querySelectorAll(".contenido-vistas-resultados");
  const menuLinks = document.querySelectorAll(".menu-vistas a");

  // Ocultar todas las secciones
  secciones.forEach(seccion => {
    seccion.style.display = "none";
  });

  // Mostrar la sección deseada
  const target = document.getElementById(idSeccion);
  if (target) {
    target.style.display = "block";
  }

  // Actualizar clases activas del menú si corresponde
  menuLinks.forEach(link => {
    const targetId = link.dataset.target;
    if (targetId === idSeccion) {
      link.classList.add("activo");
    } else {
      link.classList.remove("activo");
    }
  });
}

// .............................................................

// Mostrar vista vacía al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarVistaVaciaCompleto();
});

function mostrarVistaVaciaCompleto() {
  document.getElementById("vista-vacia-nlp").classList.add("activo");
  document.getElementById("vista-contenido-nlp").classList.remove("activo");

  document.getElementById("vista-vacia-descripcion").classList.add("activo");
  document.getElementById("vista-contenido-descripcion").classList.remove("activo");

  document.getElementById("vista-vacia-informe").classList.add("activo");
  document.getElementById("vista-contenido-informe").classList.remove("activo");

  document.getElementById("vista-vacia-pronostico").classList.add("activo");
  document.getElementById("vista-contenido-pronostico").classList.remove("activo");
}

function mostrarVistaContenidoNLP() {
  document.getElementById("vista-vacia-nlp").classList.remove("activo");
  document.getElementById("vista-contenido-nlp").classList.add("activo");
}
function ocultarVistaContenidoNLP() {
  document.getElementById("vista-vacia-nlp").classList.add("activo");
  document.getElementById("vista-contenido-nlp").classList.remove("activo");
}
function mostrarVistaContenidoDescripcion() {
  document.getElementById("vista-vacia-descripcion").classList.remove("activo");
  document.getElementById("vista-contenido-descripcion").classList.add("activo");
}
function ocultarVistaContenidoDescripcion() {
  document.getElementById("vista-vacia-descripcion").classList.add("activo");
  document.getElementById("vista-contenido-descripcion").classList.remove("activo");
}
function mostrarVistaContenidoInforme() {
  document.getElementById("vista-vacia-informe").classList.remove("activo");
  document.getElementById("vista-contenido-informe").classList.add("activo");
}
function ocultarVistaContenidoInforme() {
  document.getElementById("vista-vacia-informe").classList.add("activo");
  document.getElementById("vista-contenido-informe").classList.remove("activo");
}
function mostrarVistaContenidoPronostico() {
  document.getElementById("vista-vacia-pronostico").classList.remove("activo");
  document.getElementById("vista-contenido-pronostico").classList.add("activo");
}
function ocultarVistaContenidoPronostico() {
  document.getElementById("vista-vacia-pronostico").classList.add("activo");
  document.getElementById("vista-contenido-pronostico").classList.remove("activo");
}
// .............................................................

//Función para controlar el botón de selecionar archivos
document.addEventListener("DOMContentLoaded", () => {
  const btnMostrarArchivos = document.querySelector("#btnMostrarArchivos");
  

  if (!btnMostrarArchivos) {
    mostrarNotificacion("error", "Botón no encontrado", "No se encontró el botón para mostrar archivos.");
    return;
  }

  btnMostrarArchivos.addEventListener("click", async () => {
    try {
      const response = await fetch("/opiniones_cargadas");
      const resultado = await response.json();

      if (response.ok || response.status === 200) {
        if (Array.isArray(resultado) && resultado.length > 0) {
          const archivosAdaptados = resultado.map(op => ({
                                    id: op.id,
                                    origen: op.origen,
                                    nombre: op.titulo,
                                    fecha: op.fecha
                                  }));
          mostrarArchivos(archivosAdaptados);
        } else {
          mostrarArchivos([]); // Muestra la ventana vacía
          mostrarNotificacion("error", "Sin archivos", "No se encontraron opiniones cargadas.");
        }
      } else {
        mostrarNotificacion("error", "Error de carga", resultado.error || "No se pudieron obtener los archivos.");
      }
    } catch (error) {
      console.error("Error al obtener archivos:", error);
      mostrarNotificacion("error", "Error de conexión", "No se pudo conectar con el servidor.");
    }
  });
}); 
// .............................................................
// Función para actualizar la lista visual de archivos seleccionados
function actualizarListaArchivosSeleccionados(archivos) {
    const listaArchivos = document.getElementById("listaArchivos");
    const contadorArchivos = document.getElementById("contador-archivos");
    
    if (!listaArchivos || !contadorArchivos) return;

    // Actualizar contador
    contadorArchivos.textContent = `(${archivos.length})`;

    // Limpiar lista
    listaArchivos.innerHTML = '';

    if (archivos.length === 0) {
        // Mostrar estado vacío
        listaArchivos.innerHTML = `
            <div class="archivo-vacio">
                <i class="fas fa-folder-open"></i>
                <p>No hay archivos seleccionados</p>
            </div>
        `;
    } else {
        // Mostrar solo los títulos de los archivos seleccionados
        archivos.forEach(archivo => {
            const itemArchivo = document.createElement('div');
            itemArchivo.className = 'item-archivo';
            itemArchivo.innerHTML = `
                <div class="nombre-archivo">${archivo.nombre}</div>
            `;
            listaArchivos.appendChild(itemArchivo);
        });
    }
}
//................................................................
//Funcion para generar el procesamiento nlp
document.addEventListener("DOMContentLoaded", () => {
  const botonProcesar = document.getElementById("btnProcesarTextos");

  botonProcesar.addEventListener("click", async () => {
    if (idsSeleccionados.length === 0) {
      mostrarNotificacion("error", "Sin selección", "No se han seleccionado opiniones para procesar.");
      return;
    }

    // Verificar si ya existen datos cargados en campos
    const camposConContenido = [
    // Métricas numéricas (usamos textContent)
    document.getElementById("caracteres-eliminados").textContent,
    document.getElementById("longitud-frases").textContent,
    document.getElementById("total-frases").textContent,
    document.getElementById("tiempo-procesamiento").textContent,
    document.getElementById("texto-completo-container").innerHTML,
    document.getElementById("frases-extraidas-container").innerHTML
    ].some(campo => campo && campo.trim().length > 0);

    if (camposConContenido) {
      mostrarConfirmacion(
        "¿Reemplazar agrupamiento?",
        "Ya existe una agrupación asociada a este texto. ¿Deseas sobrescribir los resultados actuales?",
        () => eliminarYProcesarTextoProcesado(id_texto_procesado),
        () => mostrarNotificacion("error", "Proceso cancelado", "No se inició el procesamiento de agrupamiento.")
      );
    } else {
      iniciarProcesamientoNLP();
    }
  });

  // Función para rescribir el texto procesado y eliminar el anterior
  async function eliminarYProcesarTextoProcesado(id_texto_procesado) {
    try {
      const response = await fetch(`/eliminar-texto-procesado/${id_texto_procesado}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        mostrarNotificacion("error", "Error al eliminar", "No se pudo eliminar el texto procesado anterior.");
        return;
      }
      resetearTodosLosProcesos();
      iniciarProcesamientoNLP(); 
    } catch (error) {
      mostrarNotificacion("error", "Error inesperado", "No se pudo completar la operación.");
    }
  }

// Función principal para ejecutar el procesamiento
async function iniciarProcesamientoNLP() {
    iniciarCargaProceso();
    cambiarMenuVistas("nlp")
    // Deshabilitar botón y cambiar texto
    const botonProcesar = document.getElementById("btnProcesarTextos");
    botonProcesar.disabled = true;
    botonProcesar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    try {
        // Preparar procesos pendientes y mostrar animaciones
        prepararProcesosPendientes();
        mostrarVistaContenidoNLP();

        // Limpiar campos anteriores
        document.getElementById("caracteres-eliminados").textContent = "";
        document.getElementById("longitud-frases").textContent = "";
        document.getElementById("total-frases").textContent = "";
        document.getElementById("tiempo-procesamiento").textContent = "";
        
        // Limpiar contenedores interactivos
        const textoContainer = document.getElementById("texto-completo-container");
        const frasesContainer = document.getElementById("frases-extraidas-container");
        if (textoContainer) textoContainer.innerHTML = '';
        if (frasesContainer) frasesContainer.innerHTML = '';

        id_texto_procesado = null;

        // Iniciar procesamiento paso a paso con el backend
        await iniciarProcesamientoPasos();

        const response = await fetch("/procesar_textos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                archivos: idsSeleccionados
            })
        });

        let resultado;
        try {
            resultado = await response.json();
        } catch (jsonError) {
            throw new Error("La respuesta del servidor no es válida.");
        }

        if (!response.ok) {
            throw new Error(resultado.error || "No se pudo procesar.");
        }

        mostrarNotificacion("exito", "Procesamiento completado", "Los resultados han sido generados.");
        mostrarResultadosNLP(resultado);
        terminarCargaProceso();
        id_texto_procesado = resultado.texto_procesado_id;

    } catch (error) {
        console.error("Error en procesamiento NLP:", error);
        const mensajeError = error?.message || String(error);
        mostrarNotificacion("error", "Error en procesamiento NLP", mensajeError);
    } finally {
        // Rehabilitar botón
        botonProcesar.disabled = false;
        botonProcesar.innerHTML = '<i class="fas fa-file"></i> Procesar textos';
    }
} 
});

// Función para preparar solo los procesos pendientes
function prepararProcesosPendientes() {
  const estados = document.querySelectorAll('.estado-proceso');
  estados.forEach(estado => {
    if (!estado.classList.contains('completado')) {
      estado.classList.remove('cargando');
      estado.classList.add('pendiente');
    }
  });
}

// Función para iniciar procesamiento paso a paso (frontend)
async function iniciarProcesamientoPasos() {
  const procesos = [
    'minusculas',
    'caracteres-especiales', 
    'normalizar-espacios',
    'conservar-acentos',
    'extraer-frases'
  ];

  for (let i = 0; i < procesos.length; i++) {
    const proceso = procesos[i];
    
    const elementoEstado = document.querySelector(`[data-proceso="${proceso}"]`);
    
    if (elementoEstado.classList.contains('completado')) {
      console.log(`Proceso ${proceso} ya completado, saltando...`);
      continue;
    }
    
    elementoEstado.classList.remove('pendiente');
    elementoEstado.classList.add('cargando');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      elementoEstado.classList.remove('cargando');
      elementoEstado.classList.add('completado');
      
    } catch (error) {
      console.error(`Error en proceso ${proceso}:`, error);
      elementoEstado.classList.remove('cargando');
      elementoEstado.classList.add('pendiente');
      throw error;
    }
  }
}

// Función para resetear todos los procesos
function resetearTodosLosProcesos() {
  const estados = document.querySelectorAll('.estado-proceso');
  estados.forEach(estado => {
    estado.classList.remove('cargando', 'completado');
    estado.classList.add('pendiente');
  });
}

// Función para mostrar los resultados NLP de forma interactiva
async function mostrarResultadosNLP(textoProcesado) {
  const inicioJS = performance.now();

  if (!textoProcesado) {
    mostrarNotificacion("error", "Sin datos", "No se recibió ningún resultado procesado.");
    return;
  }

  const finJS = performance.now();
  const tiempoJS = (finJS - inicioJS) / 1000;
  const tiempoTotalFinal = ((textoProcesado.tiempo_procesar || 0) + tiempoJS).toFixed(3);

  //Guardamos resultado
  window.datosNLPActuales = {
    archivos_origen: textoProcesado.archivos_origen,
    frases_por_archivo: textoProcesado.frases_por_archivo,
    textos_por_archivo: textoProcesado.texto_completo_por_archivo,
    texto_procesado_id: textoProcesado.texto_procesado_id,
    datos_pos: textoProcesado.etiquetas_pos_por_archivo
  }

  // Métricas
  const caracteresEliminados = textoProcesado.caracteres_eliminados || 0;
  const longitudPromedioFrases = textoProcesado.longitud_promedio_frases || 0;
  const totalFrases = textoProcesado.total_frases || 0;

  // Datos por archivo
  const archivosOrigen = textoProcesado.archivos_origen || [];
  const textosPorArchivo = textoProcesado.texto_completo_por_archivo || [];
  const frasesPorArchivo = textoProcesado.frases_por_archivo || [];

  // Actualizar tarjetas
  document.getElementById("caracteres-eliminados").textContent = caracteresEliminados.toLocaleString();
  document.getElementById("longitud-frases").textContent = longitudPromedioFrases.toFixed(2) + " palabras";
  document.getElementById("total-frases").textContent = totalFrases.toLocaleString();
  document.getElementById("tiempo-procesamiento").textContent = `${tiempoTotalFinal} seg`;

  // Mostrar texto completo con capacidad de resaltado
  mostrarTextoCompletoConHighlight(textosPorArchivo, archivosOrigen);
  
  // Mostrar frases interactivas
  mostrarFrasesInteractivas(frasesPorArchivo, archivosOrigen);

  mostrarNotificacion("exito", "Procesamiento exitoso", 
    `Se procesaron ${archivosOrigen.length} archivos y se extrajeron ${totalFrases} frases.`);
}

function mostrarTextoCompletoConHighlight(textosPorArchivo, archivosOrigen) {
  const container = document.getElementById("texto-completo-container");
  if (!container) return;
  
  container.innerHTML = '';

  textosPorArchivo.forEach((texto, index) => {
    const titulo = archivosOrigen[index] || `Archivo ${index + 1}`;
    const archivoDiv = document.createElement('div');
    archivoDiv.className = 'archivo-texto';
    archivoDiv.dataset.archivoIndex = index;
    archivoDiv.dataset.archivoId = titulo; // Añadir identificador único
    
    const tituloElement = document.createElement('div');
    tituloElement.className = 'titulo-archivo';
    tituloElement.textContent = `📑 ${titulo}`;
    tituloElement.style.fontWeight = 'bold';
    tituloElement.style.marginBottom = '10px';
    tituloElement.style.color = 'var(--color-principal-oscuro)';
    
    const textoElement = document.createElement('div');
    textoElement.className = 'contenido-texto';
    textoElement.dataset.archivoIndex = index; // Añadir índice aquí también
    textoElement.textContent = texto;
    textoElement.style.marginBottom = '20px';
    textoElement.style.whiteSpace = 'pre-wrap';
    textoElement.style.lineHeight = '1.5';
    
    const separador = document.createElement('div');
    separador.style.height = '1px';
    separador.style.background = 'var(--color-principal-muy-claro)';
    separador.style.margin = '15px 0';
    
    archivoDiv.appendChild(tituloElement);
    archivoDiv.appendChild(textoElement);
    if (index < textosPorArchivo.length - 1) {
      archivoDiv.appendChild(separador);
    }
    
    container.appendChild(archivoDiv);
  });
}

function mostrarFrasesInteractivas(frasesPorArchivo, archivosOrigen) {
  const container = document.getElementById("frases-extraidas-container");
  if (!container) return;
  
  container.innerHTML = '';

  frasesPorArchivo.forEach((frases, archivoIndex) => {
    const titulo = archivosOrigen[archivoIndex] || `Archivo ${archivoIndex + 1}`;
    
    const archivoSection = document.createElement('div');
    archivoSection.className = 'archivo-frases';
    archivoSection.dataset.archivoIndex = archivoIndex;
    archivoSection.dataset.archivoId = titulo; // Mismo identificador
    
    const tituloElement = document.createElement('div');
    tituloElement.className = 'titulo-archivo';
    tituloElement.textContent = `📑 ${titulo}`;
    tituloElement.style.fontWeight = 'bold';
    tituloElement.style.marginBottom = '10px';
    tituloElement.style.color = 'var(--color-principal-oscuro)';
    
    archivoSection.appendChild(tituloElement);

    if (frases.length === 0) {
      const noFrases = document.createElement('div');
      noFrases.textContent = 'No se extrajeron frases';
      noFrases.style.color = 'var(--color-texto-claro)';
      noFrases.style.fontStyle = 'italic';
      noFrases.style.padding = '8px 12px';
      archivoSection.appendChild(noFrases);
    } else {
      frases.forEach((frase, fraseIndex) => {
        const fraseElement = document.createElement('div');
        fraseElement.className = 'frase-item';
        fraseElement.textContent = `• ${frase}`;
        fraseElement.dataset.frase = frase;
        fraseElement.dataset.archivoIndex = archivoIndex;
        fraseElement.dataset.archivoId = titulo; // Añadir ID del archivo
        fraseElement.dataset.fraseIndex = fraseIndex;
        
        fraseElement.addEventListener('mouseenter', () => {
          resaltarFraseEnTexto(frase, archivoIndex, titulo);
          fraseElement.classList.add('resaltada');
        });
        
        fraseElement.addEventListener('mouseleave', () => {
          quitarResaltadoTexto(archivoIndex);
          fraseElement.classList.remove('resaltada');
        });
        
        archivoSection.appendChild(fraseElement);
      });
    }
    
    const separador = document.createElement('div');
    separador.style.height = '1px';
    separador.style.background = 'var(--color-principal-muy-claro)';
    separador.style.margin = '15px 0';
    
    container.appendChild(archivoSection);
    if (archivoIndex < frasesPorArchivo.length - 1) {
      container.appendChild(separador);
    }
  });
}

// Función mejorada para resaltar
function resaltarFraseEnTexto(frase, archivoIndex, archivoId) {
  // Buscar por índice Y por ID para mayor precisión
  const archivoTexto = document.querySelector(`.archivo-texto[data-archivo-index="${archivoIndex}"]`);
  
  if (!archivoTexto) {
    console.warn(`No se encontró archivo texto con índice: ${archivoIndex}`);
    return;
  }
  
  const contenidoTexto = archivoTexto.querySelector('.contenido-texto');
  if (!contenidoTexto) {
    console.warn(`No se encontró contenido de texto para archivo: ${archivoIndex}`);
    return;
  }
  
  const textoOriginal = contenidoTexto.textContent;
  
  // Escapar caracteres especiales para regex
  const fraseEscapada = frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${fraseEscapada})`, 'gi');
  
  const textoResaltado = textoOriginal.replace(regex, '<span class="texto-resaltado">$1</span>');
  contenidoTexto.innerHTML = textoResaltado;
}

// Función mejorada para quitar resaltado
function quitarResaltadoTexto(archivoIndex) {
  const archivoTexto = document.querySelector(`.archivo-texto[data-archivo-index="${archivoIndex}"]`);
  if (!archivoTexto) return;
  
  const contenidoTexto = archivoTexto.querySelector('.contenido-texto');
  if (!contenidoTexto) return;
  
  const textosResaltados = contenidoTexto.querySelectorAll('.texto-resaltado');
  textosResaltados.forEach(span => {
    const parent = span.parentNode;
    // Guardar el texto original antes de reemplazar
    const textoOriginal = contenidoTexto.textContent;
    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  });
  
  // Restaurar el texto original completo
  contenidoTexto.textContent = contenidoTexto.textContent;
}


//................................................................

//Función para iniciar e agrupamiento:
document.addEventListener("DOMContentLoaded", () => {
  const botonProcesaAgrupamiento = document.getElementById("btnIniciarAgrupamiento");
  
  botonProcesaAgrupamiento.addEventListener("click", async () => {
   
    if (!id_texto_procesado) {
      mostrarNotificacion("error", "Sin procesamiento NLP", "No se han procesado opiniones con NLP.");
      return;
    }

    // Obtener los parametros de agrupamiento
    const nombre = document.getElementById("nombre-agrupamiento").value
    const metodo = document.getElementById("metodo-cluster").value;
    const embedding = document.getElementById("modelo-embedding").value;

   
    if (!nombre.trim()) {
      mostrarNotificacion("error", "Sin configuración", "Nombrar el agrupamiento a procesar.");
      return;
    }

    if (!metodo) {
      mostrarNotificacion("error", "Método no definido", "Selecciona un algoritmo de agrupamiento.");
      return;
    }
    if (!embedding) {
      mostrarNotificacion("error", "Clasificador semántico no definido", "Selecciona un modelo de clasificación ideológica.");
      return;
    }

    // Verificar si ya existen datos cargados en campos del informe 
    const camposConContenido = [
      document.getElementById("agrupaciones-agrupacion").textContent,
      document.getElementById("agrupaciones-archivos").textContent,
      document.getElementById("agrupaciones-palabras").textContent
    ].some(campo => campo && campo.trim().length > 0);

    // ✅ CORRECCIÓN: Verificar SI HAY CONTENIDO Y SI EXISTE UN ID PREVIO
    if (camposConContenido && id_proceso_agrupacion) {
      mostrarConfirmacion(
        "¿Reemplazar agrupamiento?",
        "Ya existe agrupacion. ¿Deseas sobrescribir los resultados actuales?",
        () => eliminarYProcesarAgrupamiento(id_proceso_agrupacion),
        () => mostrarNotificacion("info", "Proceso cancelado", "No se inició el procesamiento agrupamiento.")
      );
    } else {
      // ✅ Si no hay ID previo o no hay contenido, iniciar directamente
      iniciarAgrupamiento();
    }
  });

  // Función para rescribir el agrupamiento y eliminar el anterior
  async function eliminarYProcesarAgrupamiento(id_proceso_agrupacion) {
    try {
      console.log("Eliminando agrupamiento ID:", id_proceso_agrupacion);
      
      const response = await fetch(`/eliminar-agrupacion/${id_proceso_agrupacion}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        // ✅ Mejorar el manejo de errores
        let mensajeError = "No se pudo eliminar el proceso de agrupación anterior.";
        try {
          const errorData = await response.json();
          mensajeError = errorData.error || mensajeError;
        } catch (e) {
          // Si no se puede parsear la respuesta, usar mensaje genérico
        }
        mostrarNotificacion("error", "Error al eliminar", mensajeError);
        return;
      }
      
      // ✅ Limpiar la variable global después de eliminar
      id_proceso_agrupacion = null;
      
      // ✅ Limpiar la interfaz antes de iniciar nuevo agrupamiento
      limpiarInterfazAgrupamiento();
      
      // ✅ Ahora iniciar el nuevo agrupamiento
      iniciarAgrupamiento();
      
    } catch (error) {
      console.error("Error inesperado:", error);
      mostrarNotificacion("error", "Error inesperado", "No se pudo completar la operación.");
    }
  }

  // ✅ Función para limpiar la interfaz
  function limpiarInterfazAgrupamiento() {
    ocultarVistaContenidoDescripcion()
    ocultarVistaContenidoInforme()
    ocultarVistaContenidoPronostico()

     // Habilitar botones
    document.getElementById("btnGenerarPronostico").disabled = false;
    document.getElementById("btnGenerarInforme").disabled = false;

    // Limpiar resultados del pronóstico
    const izquierdaValor = document.querySelector(".porcentaje-box.izquierda .porcentaje-valor");
    const derechaValor = document.querySelector(".porcentaje-box.derecha .porcentaje-valor");
    const neutralValor = document.querySelector(".nube-palabras .porcentaje-valor");
    
    if (izquierdaValor) izquierdaValor.textContent = "0%";
    if (derechaValor) derechaValor.textContent = "0%";
    if (neutralValor) neutralValor.textContent = "0%";
    
    const izquierdaBarra = document.querySelector(".barra-progreso.izquierda");
    const derechaBarra = document.querySelector(".barra-progreso.derecha");
    const neutralBarra = document.querySelector(".barra-progreso.neutral");
    
    if (izquierdaBarra) izquierdaBarra.style.width = "0%";
    if (derechaBarra) derechaBarra.style.width = "0%";
    if (neutralBarra) neutralBarra.style.width = "0%";
    
    document.getElementById("salida-agrupamiento").value = "";

    // Limpiar resultados del informe
    const selectAgrupacion = document.getElementById("select-agrupacion");
    if (selectAgrupacion) selectAgrupacion.innerHTML = "<option value=''>Selecciona un cluster</option>";
    
    const tablaPalabras = document.querySelector("#tabla-palabras-origen-informe tbody");
    if (tablaPalabras) tablaPalabras.innerHTML = "";
    
    // Limpiar gráficos de forma segura
    limpiarGraficosSeguramente();

    // Limpiar métricas del informe
    document.getElementById("informe-archivos").textContent = "";
    document.getElementById("informe-palabras").textContent = "";

    // Limpiar estadísticas y métricas de la vista general
    document.getElementById("agrupaciones-agrupacion").textContent = "";
    document.getElementById("agrupaciones-archivos").textContent = "";
    document.getElementById("agrupaciones-palabras").textContent = "";

    id_proceso_agrupacion = null;
    embeddings_latentes = [];
    asignacion_clusters = [];
    interpretacion = {};
    descripcion = [];
    metricas = {};
    palabra_mas_frecuentes = {};
    palabra_menos_frecuentes = {};
    archivos_vocabularios = [];
  }

  // Función separada para ejecutar el procesamiento como callback limpio
  async function iniciarAgrupamiento() {
    iniciarCargaProceso();
    cambiarMenuVistas("descripccion")
    mostrarVistaContenidoDescripcion();
   
    const opcionNormalizacion = document.querySelector('input[name="preproceso"]:checked')?.value;
    const nombre = document.getElementById("nombre-agrupamiento").value
    const metodo = document.getElementById("metodo-cluster").value;
    const modelo_embedding = document.getElementById("modelo-embedding").value;
    
    const vocabulario_frases = [];
    
    if (!id_texto_procesado) {
        mostrarNotificacion("error", "Sin procesamiento NLP", "No hay un procesamiento NLP reciente.");
        terminarCargaProceso();
        return;
    }

    if (window.datosNLPActuales) {
        console.log("Creando vocabulario desde datos NLP:", window.datosNLPActuales);
        
        const { archivos_origen, frases_por_archivo } = window.datosNLPActuales;
        
        if (archivos_origen && frases_por_archivo) {
            archivos_origen.forEach((titulo, index) => {
                const frasesArchivo = frases_por_archivo[index] || [];
                
                vocabulario_frases.push({
                    titulo: titulo,
                    vocabulario: frasesArchivo,
                    frases: frasesArchivo
                });
            });
        }
    } else {
        mostrarNotificacion("error", "Datos no disponibles", "No se encontraron datos del procesamiento NLP.");
        terminarCargaProceso();
        return;
    }

    if (vocabulario_frases.length === 0) {
        mostrarNotificacion("error", "Sin vocabulario", "No se pudieron extraer frases del procesamiento NLP.");
        terminarCargaProceso();
        return;
    }

    console.log("Vocabulario de frases generado:", vocabulario_frases);
    archivos_vocabularios = vocabulario_frases;

    try {
        const response = await fetch("/iniciar_agrupamiento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: vocabulario_frases,
                cluster: metodo,
                embedding: modelo_embedding,
                nombre_agrupacion: nombre,
                id_texto: id_texto_procesado,
                normalizacion: opcionNormalizacion,
                tipo_vocabulario: "frases"
            })
        })

        let resultado;
        try {
            resultado = await response.json();
        } catch (jsonError) {
            mostrarNotificacion("error", "Error al interpretar respuesta", "La respuesta del servidor no es válida.");
            terminarCargaProceso();
            return;
        }

        if (!response.ok) {
            mostrarNotificacion("error", "Error del servidor", resultado.error || "No se pudo procesar.");
            terminarCargaProceso();
            return;
        }
        
        terminarCargaProceso();
        mostrarNotificacion("exito", "Agrupamiento completado", "Los resultados han sido generados.");
        
        // ✅ ESTA LÍNEA ASIGNA EL ID PARA FUTURAS ELIMINACIONES
        id_proceso_agrupacion = resultado.agrupaciones.agrupacion_id;
        embeddings_latentes = resultado.agrupaciones.embeddings_latentes;
        asignacion_clusters = resultado.agrupaciones.asignacion_clusters;
        interpretacion = resultado.agrupaciones.interpretacion;
        descripcion = resultado.agrupaciones.descripcion;
        metricas = resultado.agrupaciones.metricas;
        
        generarGraficoDispersionPorIdeologia(embeddings_latentes, asignacion_clusters, interpretacion);
        generarGraficoDistribucionArchivos(archivos_vocabularios);
        mostrarResultadosAgrupacionGeneral();

    } catch (error) {
        console.error("Error en el proceso de agrupamiento:", error);
        const mensajeError = error?.message || String(error);
        mostrarNotificacion("error", "Error en el proceso de agrupamiento", mensajeError);
        terminarCargaProceso();
    }
  }
});

//Mostrar los resultados de descripccion general
function mostrarResultadosAgrupacionGeneral() {

  const totalArchivos = archivos_vocabularios.length;
 
  archivos_vocabularios.forEach(archivo => {
      if (Array.isArray(archivo.vocabulario)) {
          archivo.vocabulario.forEach(palabraObj => {
              const palabra = palabraObj.palabra || palabraObj;
              palabra_mas_frecuentes[palabra] = (palabra_mas_frecuentes[palabra] || 0) + 1;
          });
      }
  });
  const cantidadMas = Object.entries(palabra_mas_frecuentes)
    .filter(([_, count]) => count >= 2)  // Palabras con frecuencia ≥ 2
    .length;

  archivos_vocabularios.forEach(archivo => {
      if (Array.isArray(archivo.vocabulario)) {
          archivo.vocabulario.forEach(palabraObj => {
              const palabra = palabraObj.palabra || palabraObj;
              palabra_menos_frecuentes[palabra] = (palabra_menos_frecuentes[palabra] || 0) + 1;
          });
      }
  });
  
const cantidadMenos = Object.entries(palabra_menos_frecuentes)
    .filter(([_, count]) => count === 1)  // Palabras con frecuencia = 1
    .length;

  const totalClusters = Object.keys(interpretacion).length;

  const totalPalabras = Object.values(interpretacion).reduce(
      (sum, cluster) => sum + cluster.palabras.length, 
      0
  );

  // 🧾 Actualizar elementos HTML existentes
  document.getElementById("agrupaciones-agrupacion").textContent = totalClusters;
  document.getElementById("agrupaciones-archivos").textContent = totalArchivos;
  document.getElementById("agrupaciones-palabras").textContent = totalPalabras;
  terminarCargaProceso();
}
//-----------------------------------------------------------------------------------------
//Funciones para las targetas dashboard para el informe genera
document.getElementById('tarjeta-dashboard-agrupamientos').addEventListener('click', () => {

  if (modoActual === '2D') { 
    generarGraficoDispersionPorIdeologia(embeddings_latentes, asignacion_clusters, interpretacion); 
    modoActual = '3D'; } 
    else if (modoActual === '3D') { 
      generarGraficoDispersionPorAutores(embeddings_latentes, asignacion_clusters, interpretacion); 
      modoActual = '4D' 
    } else { 
      generarGraficoDispersionPorClustersEconomicos(embeddings_latentes, asignacion_clusters, interpretacion); 
      modoActual = '2D' 
    }

});


//Funciones para generar y controlar los graficos

document.getElementById('tarjeta-dashboard-archivos').addEventListener('click', () => {
  generarGraficoDistribucionArchivos(archivos_vocabularios)
});

document.getElementById('tarjeta-dashboard-palabras').addEventListener('click', () => {
  generarGraficoDistribucionClusters(interpretacion) 
});

//----------
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("btnGenerarInforme");
  if (!boton) {
    console.warn("Botón #btnGenerarInforme no encontrado");
    return;
  }

  boton.addEventListener("click", () => {
    iniciarInforme();
  });

  function iniciarInforme() {
    iniciarCargaProceso();
    cambiarMenuVistas("informe")
    mostrarVistaContenidoInforme();
   
    // Más tiempo para muchos archivos
    setTimeout(() => {
        mostrarResultadosAgrupacionInforme(interpretacion, metricas);
        terminarCargaProceso();
        document.getElementById("btnGenerarInforme").disabled = true;
    }, 500); // Aumenta a 200ms
   
  }
});

//
function mostrarResultadosAgrupacionInforme(interpretacion, resultados_metricas) {
  const select = document.getElementById("select-agrupacion");
  const tablaBody = document.querySelector("#tabla-palabras-origen-informe tbody");

  // Limpiar contenido previo
  select.innerHTML = "";
  tablaBody.innerHTML = "";

  // Construir opciones del select
  Object.entries(interpretacion).forEach(([clusterId, data]) => {
    const opcion = document.createElement("option");
    const ideologia = data.ideologia || "desconocida";
    const tieneEconomico = data.analisis_economico?.es_economico ? "💰" : "";
    opcion.value = clusterId;
    opcion.textContent = `Cluster ${clusterId} (${ideologia}) ${tieneEconomico}`;
    select.appendChild(opcion);
  });

  function actualizarTablaPalabras(palabrasConOrigen) {
    tablaBody.innerHTML = "";

    palabrasConOrigen.forEach(({ frase, origen }) => {
        const fila = document.createElement("tr");

        // Celda para la frase
        const celdaFrase = document.createElement("td");
        celdaFrase.textContent = frase;
        celdaFrase.style.wordWrap = "break-word";
        celdaFrase.style.maxWidth = "400px";

        // Celda para el origen
        const celdaOrigen = document.createElement("td");
        const lista = document.createElement("ul");
        lista.style.margin = "0";
        lista.style.paddingLeft = "18px";
        lista.style.maxHeight = "120px";
        lista.style.overflowY = "auto";

        const origenes = Array.isArray(origen) ? origen : [origen];
        origenes.forEach(titulo => {
            const item = document.createElement("li");
            item.textContent = titulo;
            item.style.marginBottom = "4px";
            item.style.fontSize = "0.9em";
            lista.appendChild(item);
        });

        celdaOrigen.appendChild(lista);
        fila.appendChild(celdaFrase);
        fila.appendChild(celdaOrigen);
        tablaBody.appendChild(fila);
    });
  }

  // FUNCIÓN PARA VERIFICAR SI EXISTE EL HTML DEL ANÁLISIS ECONÓMICO
  function verificarElementosEconomicos() {
    const estadoVacio = document.getElementById('estado-vacio-temas');
    const estadoNoEconomico = document.getElementById('estado-no-economico');
    const contenedorAnalisis = document.getElementById('contenedor-analisis-economico');
    
    return estadoVacio && estadoNoEconomico && contenedorAnalisis;
  }

  // FUNCIÓN PARA MOSTRAR PRIMER CLUSTER CON RETRASO SI ES NECESARIO
  function mostrarPrimerClusterConRetraso() {
    const primerClusterId = select.options[0]?.value;
    if (!primerClusterId) return;
    
    const datos = interpretacion[primerClusterId];
    
    // Ejecutar funciones que NO dependen del HTML económico
    generarGraficoPorcentajeCluster(datos.porcentaje_ocupacion);
    actualizarTablaPalabras(datos.palabras);
    generarGraficoSankeyCluster(interpretacion, primerClusterId);
    
    // Verificar si el HTML económico existe
    if (verificarElementosEconomicos()) {
      // Si existe, mostrar análisis económico inmediatamente
      mostrarAnalisisEconomicoParaCluster(primerClusterId, interpretacion);
    } else {
      // Si no existe, esperar y reintentar
      console.log('Esperando creación de elementos económicos...');
      setTimeout(() => {
        if (verificarElementosEconomicos()) {
          mostrarAnalisisEconomicoParaCluster(primerClusterId, interpretacion);
        } else {
          // Seguir intentando
          setTimeout(() => mostrarAnalisisEconomicoParaCluster(primerClusterId, interpretacion), 200);
        }
      }, 100);
    }
    
    // Configurar eventos de las tarjetas
    configurarEventosTarjetas(primerClusterId, interpretacion);
  }

  // MODIFICAR LA FUNCIÓN mostrarAnalisisEconomicoParaCluster
  function mostrarAnalisisEconomicoParaClusterModificada(clusterId, interpretacion) {
    // Verificar si los elementos existen
    const estadoVacio = document.getElementById('estado-vacio-temas');
    const estadoNoEconomico = document.getElementById('estado-no-economico');
    const contenedorAnalisis = document.getElementById('contenedor-analisis-economico');
    
    if (!estadoVacio || !estadoNoEconomico || !contenedorAnalisis) {
      console.log('Elementos económicos no disponibles, reintentando...');
      setTimeout(() => mostrarAnalisisEconomicoParaClusterModificada(clusterId, interpretacion), 50);
      return;
    }
    
    // Ahora sí ejecutar la lógica original
    const datosCluster = interpretacion[clusterId];
    const analisisEconomico = datosCluster?.analisis_economico;
    
    // Ocultar todos los estados
    estadoVacio.style.display = 'none';
    estadoNoEconomico.style.display = 'none';
    contenedorAnalisis.style.display = 'none';
    
    // Verificar si tiene análisis económico
    if (!analisisEconomico || analisisEconomico.es_economico === false) {
      console.log(`Cluster ${clusterId} no tiene contenido económico`);
      estadoNoEconomico.style.display = 'flex';
    } else {
      console.log(`Cluster ${clusterId} tiene contenido económico`);
      contenedorAnalisis.style.display = 'flex';
      actualizarContenidoEconomicoCompleto(datosCluster.ideologia, analisisEconomico, interpretacion);
    }
  }

  // Reemplazar la función original con la modificada
  window.mostrarAnalisisEconomicoParaCluster = mostrarAnalisisEconomicoParaClusterModificada;

  // Cambiar vista al seleccionar otro cluster
  select.addEventListener("change", (e) => {
    const clusterId = e.target.value;
    const datos = interpretacion[clusterId];
    
    // Actualizar todas las visualizaciones para el nuevo cluster
    generarGraficoPorcentajeCluster(datos.porcentaje_ocupacion);
    actualizarTablaPalabras(datos.palabras);
    generarGraficoSankeyCluster(interpretacion, clusterId);
    
    // MOSTRAR ANÁLISIS ECONÓMICO del nuevo cluster seleccionado
    mostrarAnalisisEconomicoParaClusterModificada(clusterId, interpretacion);
    
    // Reconfigurar eventos para las tarjetas
    configurarEventosTarjetas(clusterId, interpretacion);
  });
  
  // Mostrar el primer cluster después de un pequeño retraso
  setTimeout(() => {
    mostrarPrimerClusterConRetraso();
  }, 50);
  
  console.log("Resultados métricas:", resultados_metricas);
  const totalArchivosInforme = archivos_vocabularios.length;
  const totalPalabrasInforme = 20;
 
  document.getElementById("informe-archivos").textContent = totalArchivosInforme;
  document.getElementById("informe-palabras").textContent = totalPalabrasInforme;
}

//
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("btnGenerarPronostico");
  if (!boton) {
    console.warn("Botón #btnGenerarPronostico no encontrado");
    return;
  }

  boton.addEventListener("click", () => {
    iniciarPronostico();
  });

  function iniciarPronostico() {
    cambiarMenuVistas("pronostico")
    mostrarVistaContenidoPronostico();
    mostrarResultadosPronostico(interpretacion, descripcion)
    document.getElementById("btnGenerarPronostico").disabled = true;
  }
});

function mostrarResultadosPronostico(interpretacion, descripcion) {
    // Desactivar botones al iniciar
    const btnGuardar = document.getElementById("btnGuardarAgrupamiento");
    const btnBorrar = document.getElementById("btnBorrarAgrupamiento");
    //btnGuardar.disabled = true;
    //btnBorrar.disabled = true;

    // Inicializar acumuladores
    const acumulados = {
        izquierda: 0,
        derecha: 0,
        desconocida: 0
    };

    for (const clusterId in interpretacion) {
        const cluster = interpretacion[clusterId];
        const ideologia = cluster.ideologia?.toLowerCase() || "desconocida";
        const porcentaje = cluster.porcentaje_ocupacion || 0;

        if (ideologia === "izquierda") {
            acumulados.izquierda += porcentaje;
        } else if (ideologia === "derecha") {
            acumulados.derecha += porcentaje;
        } else {
            acumulados.desconocida += porcentaje;
        }
    }

    acumulados.izquierda = Math.round(acumulados.izquierda);
    acumulados.derecha = Math.round(acumulados.derecha);
    acumulados.desconocida = Math.round(acumulados.desconocida);

    document.querySelector(".porcentaje-box.izquierda .porcentaje-valor").textContent = `${acumulados.izquierda}%`;
    document.querySelector(".porcentaje-box.derecha .porcentaje-valor").textContent = `${acumulados.derecha}%`;
    document.querySelector(".nube-palabras .porcentaje-valor").textContent = `${acumulados.desconocida}%`;

    document.querySelector(".barra-progreso.izquierda").style.width = `${acumulados.izquierda}%`;
    document.querySelector(".barra-progreso.derecha").style.width = `${acumulados.derecha}%`;
    document.querySelector(".barra-progreso.neutral").style.width = `${acumulados.desconocida}%`;

    // Efecto de escritura letra por letra
    const textarea = document.getElementById("salida-agrupamiento");
    textarea.value = "";

    let i = 0;
    const velocidad = 10;

    function escribirLetraPorLetra() {
        if (i < descripcion.length) {
            textarea.value += descripcion.charAt(i);
            i++;
            setTimeout(escribirLetraPorLetra, velocidad);
        } else {
            // Activar botones al terminar
            btnGuardar.disabled = false;
            btnBorrar.disabled = false;
        }
    }

    escribirLetraPorLetra();
}

//Funcion para borrar proceso de agrupacion
// ========== FUNCIÓN PARA LIMPIAR GRÁFICOS DE FORMA SEGURA ==========
// ========== FUNCIÓN PARA LIMPIAR GRÁFICOS DE FORMA SEGURA ==========
// ========== FUNCIÓN PARA LIMPIAR GRÁFICOS DE FORMA SEGURA ==========
function limpiarGraficosSeguramente() {
  const contenedores = [
    'grafico-general-informe',
    'grafico-secundario-informe', 
    'grafico-general-descripcion',
    'grafico-secundario-descripcion'
  ];

  contenedores.forEach(id => {
    const contenedor = document.getElementById(id);
    if (contenedor && document.body.contains(contenedor)) {
      // ✅ LIMPIAR INSTANCIAS ECHARTS (SIEMPRE)
      const chart = echarts.getInstanceByDom(contenedor);
      if (chart && !chart.isDisposed()) {
        try {
          chart.dispose();
        } catch (error) {
          console.warn(`Error al limpiar gráfico ${id}:`, error);
        }
      }
      
      // ✅ EXCEPCIÓN CRÍTICA: NO LIMPIAR HTML de grafico-secundario-informe
      if (id === 'grafico-secundario-informe') {
        console.log('Preservando estructura HTML de análisis económico en:', id);
        // Solo limpiar gráfico ECharts, pero NO el HTML
        // La estructura del análisis económico debe mantenerse
      } else {
        // ✅ LIMPIAR HTML COMPLETAMENTE solo de otros contenedores
        contenedor.innerHTML = '';
      }
    }
  });
}


// ========== FUNCIÓN PRINCIPAL DE LIMPIEZA ==========
function limpiarProcesoAgrupamiento(){
  // Habilitar botones
  document.getElementById("btnGenerarPronostico").disabled = false;
  document.getElementById("btnGenerarInforme").disabled = false;

  // Limpiar resultados del pronóstico
  const izquierdaValor = document.querySelector(".porcentaje-box.izquierda .porcentaje-valor");
  const derechaValor = document.querySelector(".porcentaje-box.derecha .porcentaje-valor");
  const neutralValor = document.querySelector(".nube-palabras .porcentaje-valor");
  
  if (izquierdaValor) izquierdaValor.textContent = "0%";
  if (derechaValor) derechaValor.textContent = "0%";
  if (neutralValor) neutralValor.textContent = "0%";
  
  const izquierdaBarra = document.querySelector(".barra-progreso.izquierda");
  const derechaBarra = document.querySelector(".barra-progreso.derecha");
  const neutralBarra = document.querySelector(".barra-progreso.neutral");
  
  if (izquierdaBarra) izquierdaBarra.style.width = "0%";
  if (derechaBarra) derechaBarra.style.width = "0%";
  if (neutralBarra) neutralBarra.style.width = "0%";
  
  document.getElementById("salida-agrupamiento").value = "";

  // Limpiar resultados del informe
  const selectAgrupacion = document.getElementById("select-agrupacion");
  if (selectAgrupacion) selectAgrupacion.innerHTML = "<option value=''>Selecciona un cluster</option>";
  
  const tablaPalabras = document.querySelector("#tabla-palabras-origen-informe tbody");
  if (tablaPalabras) tablaPalabras.innerHTML = "";
  
  // Limpiar gráficos de forma segura
  limpiarGraficosSeguramente();

  // Limpiar métricas del informe
  document.getElementById("informe-archivos").textContent = "";
  document.getElementById("informe-palabras").textContent = "";

  // Limpiar estadísticas y métricas de la vista general
  document.getElementById("agrupaciones-agrupacion").textContent = "";
  document.getElementById("agrupaciones-archivos").textContent = "";
  document.getElementById("agrupaciones-palabras").textContent = "";

  // Limpiar campos de entrada
  document.getElementById("nombre-agrupamiento").value = "";

  // ========== LIMPIAR PROCESAMIENTO NLP ==========
  document.getElementById("caracteres-eliminados").textContent = "";
  document.getElementById("longitud-frases").textContent = "";
  document.getElementById("total-frases").textContent = "";
  document.getElementById("tiempo-procesamiento").textContent = "";
  document.getElementById("texto-completo-container").innerHTML = "";
  document.getElementById("frases-extraidas-container").innerHTML = "";
  

  // ✅ CORREGIDO: Limpiar solo contenido dinámico del análisis gramatical
  const textoCompletoContainer = document.getElementById("texto-completo-container");
  if (textoCompletoContainer) {
      textoCompletoContainer.innerHTML = '';
  }

  // ✅ CORREGIDO: Limpiar el análisis gramatical que está en grafico-secundario-informe
  limpiarContenidoEconomicoDinamico();

  // Función específica para limpiar el contenido economico
  function limpiarContenidoEconomicoDinamico() {
  const contenedor = document.getElementById('grafico-secundario-informe');
  if (!contenedor) return;
  
  console.log('Limpiando contenido económico dinámico...');
  
  // 1. Limpiar elementos específicos del análisis económico
  const elementosEconomicos = [
    { selector: '#titulo-tema-economico', accion: 'textContent', valor: 'Tema Económico' },
    { selector: '#badge-orientacion', accion: 'badge', valor: 'Neutral' },
    { selector: '#contenedor-palabras-clave', accion: 'innerHTML', valor: '' },
    { selector: '#contenedor-frases', accion: 'innerHTML', valor: '' },
    { selector: '#contenedor-grafico-patrones', accion: 'innerHTML', valor: '' }
  ];
  
  elementosEconomicos.forEach(item => {
    const elemento = contenedor.querySelector(item.selector);
    if (elemento) {
      switch(item.accion) {
        case 'textContent':
          elemento.textContent = item.valor;
          break;
        case 'innerHTML':
          elemento.innerHTML = item.valor;
          break;
        case 'badge':
          elemento.textContent = item.valor;
          elemento.className = 'badge-orientacion';
          elemento.classList.remove('izquierda', 'derecha');
          break;
      }
    }
  });
  
  // 2. Ocultar estados económicos
  const estadosEconomicos = ['#estado-vacio-temas', '#estado-no-economico', '#contenedor-analisis-economico'];
  estadosEconomicos.forEach(selector => {
    const estado = contenedor.querySelector(selector);
    if (estado) {
      estado.style.display = 'none';
    }
  });
}

// Función auxiliar para estados gramaticales
function mostrarEstadoGramatical(estado) {
    try {
        const estados = ['vacio', 'analisis', 'error'];
        
        estados.forEach(est => {
            const elemento = document.getElementById(`estado-${est}`);
            if (elemento) {
                elemento.style.display = est === estado ? 'block' : 'none';
            } else {
                console.warn(`Estado gramatical no encontrado: estado-${est}`);
            }
        });
    } catch (error) {
        console.error('Error en mostrarEstadoGramatical:', error);
    }
}

  // ========== REINICIAR VARIABLES GLOBALES ==========
  id_texto_procesado = null;
  vocabularios = [];
  id_proceso_agrupacion = null;
  embeddings_latentes = [];
  asignacion_clusters = [];
  interpretacion = {};
  descripcion = [];
  metricas = {};
  palabra_mas_frecuentes = {};
  palabra_menos_frecuentes = {};
  archivos_vocabularios = [];
  idsSeleccionados = [];

  // Limpiar selección de menú de configuración
  resetearTodosLosProcesos();
  actualizarListaArchivosSeleccionados(idsSeleccionados);
  
  // Cambiar a vista NLP al final
  cambiarMenuVistas("nlp");
}

// Función auxiliar para manejar estados del análisis gramatical
function mostrarEstado(estado) {
  try {
    // Ocultar todos los estados
    const estados = document.querySelectorAll('.estado-gramatical');
    estados.forEach(el => {
      if (el && el.style) {
        el.style.display = 'none';
      }
    });
    
    // Mostrar el estado solicitado
    const estadoElement = document.getElementById(`estado-${estado}`);
    if (estadoElement && estadoElement.style) {
      estadoElement.style.display = 'block';
    }
  } catch (error) {
    console.warn('Error en mostrarEstado:', error);
  }
}

// ========== FUNCIÓN PARA BORRADO COMPLETO EN BASE DE DATOS ==========
async function borrarProcesamientoCompleto() {
  iniciarCargaProceso();
  try {
    // Eliminar texto procesado si existe
    if (id_texto_procesado) {
      const resTexto = await fetch(`/eliminar-texto-procesado/${id_texto_procesado}`, {
        method: "DELETE"
      });
      if (!resTexto.ok) {
        console.warn("No se pudo eliminar el texto procesado");
      }
    }

    // Eliminar agrupamiento si existe
    if (id_proceso_agrupacion) {
      const resAgrupacion = await fetch(`/eliminar-agrupacion/${id_proceso_agrupacion}`, {
        method: "DELETE"
      });
      if (!resAgrupacion.ok) {
        console.warn("No se pudo eliminar el agrupamiento");
      }
    }

    console.log("Procesamiento eliminado en base de datos");
  } catch (error) {
    console.error("Error al eliminar procesamiento:", error);
    mostrarNotificacion("error", "Error inesperado", "No se pudo completar la operación.");
    terminarCargaProceso();
    return;
  }
  
  // Limpiar interfaz después de eliminar en BD
  limpiarProcesoAgrupamiento();
  mostrarVistaVaciaCompleto();
  terminarCargaProceso();  
  mostrarNotificacion("exito", "Limpieza completada", "Todos los resultados de procesamiento (NLP y agrupación) han sido eliminados.");
}

// ========== FUNCIÓN DE CONFIRMACIÓN DE BORRADO ==========
function confirmarBorradoCompleto() {
  // Verificar si existe contenido en los campos de NLP o HLP
  const camposNLPConContenido = [
    document.getElementById("caracteres-eliminados").textContent,
    document.getElementById("longitud-frases").textContent,
    document.getElementById("total-frases").textContent,
    document.getElementById("tiempo-procesamiento").textContent,
    document.getElementById("texto-completo-container").innerHTML,
    document.getElementById("frases-extraidas-container").innerHTML
  ].some(campo => campo && campo.toString().trim().length > 0);

  const camposHLPConContenido = [
    document.getElementById("agrupaciones-agrupacion").textContent,
    document.getElementById("agrupaciones-archivos").textContent,
    document.getElementById("agrupaciones-palabras").textContent,
    document.getElementById("nombre-agrupamiento").value,
    document.querySelector(".porcentaje-box.izquierda .porcentaje-valor")?.textContent,
    document.getElementById("salida-agrupamiento").value
  ].some(campo => campo && campo.toString().trim().length > 0);

  // Si hay contenido en cualquiera de los dos, pedir confirmación
  if (camposNLPConContenido || camposHLPConContenido) {
    mostrarConfirmacion(
      "¿Borrar todo el procesamiento?",
      "Se eliminarán todos los resultados de procesamiento NLP y agrupación. ¿Estás seguro?",
      () => borrarProcesamientoCompleto(),
      () => mostrarNotificacion("info", "Operación cancelada", "No se eliminaron los resultados.")
    );
  } else {
    mostrarNotificacion("info", "Sin contenido", "No hay resultados de procesamiento para eliminar.");
  }
}

// ========== EVENT LISTENERS ==========
document.addEventListener("DOMContentLoaded", () => {
  // Botón GUARDAR - Solo guarda, NO limpia
  const botonGuardar = document.getElementById("btnGuardarAgrupamiento");
  if (botonGuardar) {
    botonGuardar.addEventListener("click", async () => {
      iniciarCargaProceso();
  
      if (!id_proceso_agrupacion) {
        mostrarNotificacion("error", "Agrupación no disponible", "No hay agrupación activa para guardar.");
        terminarCargaProceso();
        return;
      }

      try {
        const response = await fetch("/guardar-historial", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            agrupacion_id: id_proceso_agrupacion,
            comentario: "",
            favorito: false
          })
        });

        const resultado = await response.json();

        if (!response.ok) {
          mostrarNotificacion("error", "Error al guardar", resultado.error || "No se pudo guardar el historial.");
          terminarCargaProceso();
          return;
        }

        
        terminarCargaProceso();
        limpiarProcesoAgrupamiento();
        cambiarMenuVistas("nlp");
        mostrarVistaVaciaCompleto();
        mostrarNotificacion("exito", "Agrupación guardada", "La agrupación ha sido registrada en el historial.");
        
      } catch (error) {
        console.error("Error al guardar historial:", error);
        mostrarNotificacion("error", "Error inesperado", "No se pudo completar la operación.");
        terminarCargaProceso();
      }
    });
  }

  // Botón BORRAR - Limpia todo
  const botonBorrar = document.getElementById("btnBorrarAgrupamiento");
  if (botonBorrar) {
    botonBorrar.addEventListener("click", confirmarBorradoCompleto);
  }
});

