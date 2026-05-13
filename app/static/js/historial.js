//-------------------------------------------------------------------


//Funciones para desplegar la tabla de historial de agrupaciones
document.addEventListener("DOMContentLoaded", () => {
  cargarHistorialAgrupaciones();
});

document.addEventListener("DOMContentLoaded", () => {
  cargarHistorialAgrupaciones();
});

async function cargarHistorialAgrupaciones() {
  try {
    const response = await fetch("/historial-agrupaciones");
    const datos = await response.json();

    const tbody = document.querySelector("#tabla-general-historial table tbody");
  
    tbody.innerHTML = "";

    if (datos.length === 0) {
      const filaVacia = document.createElement("tr");
      const celdaVacia = document.createElement("td");
      celdaVacia.setAttribute("colspan", "5");
      celdaVacia.style.textAlign = "center";
      celdaVacia.textContent = "No hay agrupaciones para mostrar";
      filaVacia.appendChild(celdaVacia);
      tbody.appendChild(filaVacia);
      return;
    }

    datos.forEach((item) => {
      const fila = document.createElement("tr");
      fila.setAttribute("data-id", item.historial_id);

      const celdaNumero = document.createElement("td");
      celdaNumero.textContent = item.numero;

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = item.nombre;

      const celdaFecha = document.createElement("td");
      celdaFecha.textContent = item.fecha;

      const celdaFavorito = document.createElement("td");
      const iconoFavorito = document.createElement("i");
      iconoFavorito.className = item.favorito
        ? "fas fa-star favorito-icono activo"
        : "far fa-star favorito-icono";
      iconoFavorito.title = "Marcar como favorito";
      iconoFavorito.setAttribute("data-favorito", item.favorito);
      iconoFavorito.addEventListener("click", () => {
        const estadoActual = iconoFavorito.getAttribute("data-favorito") === "true";
        const nuevoEstado = !estadoActual;
        actualizarFavorito(item.historial_id, nuevoEstado, iconoFavorito);
      });
      celdaFavorito.appendChild(iconoFavorito);

      const celdaAcciones = document.createElement("td");
      const iconoEliminar = document.createElement("i");
      iconoEliminar.className = "fas fa-trash-alt eliminar-icono";
      iconoEliminar.title = "Eliminar historial";
      iconoEliminar.addEventListener("click", () =>
        eliminarHistorial(item.historial_id)
      );
      celdaAcciones.appendChild(iconoEliminar);

      fila.appendChild(celdaNumero);
      fila.appendChild(celdaNombre);
      fila.appendChild(celdaFecha);
      fila.appendChild(celdaFavorito);
      fila.appendChild(celdaAcciones);

      tbody.appendChild(fila);

      fila.addEventListener("click", () => {
        document.querySelectorAll("#tabla-general-historial tbody tr").forEach(f => f.classList.remove("fila-activa"));
        fila.classList.add("fila-activa");
        mostrarVistaContenido(item.historial_id, item.fecha); // ← pasa el ID
      });
    });
  } catch (error) {
    console.error("Error al cargar historial:", error);
    mostrarNotificacion("error", "Error al cargar", "No se pudo obtener el historial.");
  }
}


//Para eliminar historial
function eliminarHistorial(historial_id) {
  mostrarConfirmacion(
    "¿Eliminar historial de agrupación?",
    "Se eliminará el procesamiento NLP y su agrupación asociada. ¿Estás seguro?",
    () => eliminarHistorialConfirmado(historial_id),
    () => mostrarNotificacion("info", "Operación cancelada", "No se eliminó el historial.")
  );
}

async function eliminarHistorialConfirmado(historial_id) {
  try {
    const response = await fetch(`/historial-agrupaciones/${historial_id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mostrarNotificacion("exito", "Historial eliminado", "El historial fue eliminado correctamente.");
      const vistaVacia = document.getElementById("vista-vacia-historial");
      const vistaContenido = document.getElementById("vista-contenido-historial");

      vistaVacia.style.display = "block";
      vistaContenido.style.display = "none";
      // Animación de salida antes de recargar
      const fila = document.querySelector(`tr[data-id="${historial_id}"]`);
      if (fila) {
        fila.classList.add("fade-out");
        setTimeout(() => {
          fila.remove();
          // Si quieres recargar todo, descomenta:
           cargarHistorialAgrupaciones();
        }, 300);
      }

    } else {
      const error = await response.json();
      mostrarNotificacion("error", "Error al eliminar", error.message || "Intenta nuevamente.");
    }
  } catch (error) {
    console.error("Error al eliminar historial:", error);
    mostrarNotificacion("error", "Error inesperado", "No se pudo eliminar el historial.");
  }
}

//Para actualizar favorito
async function actualizarFavorito(historial_id, nuevoEstado, icono) {
  try {
    const response = await fetch(`/historial-agrupaciones/${historial_id}/favorito`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorito: nuevoEstado })
    });

    const resultado = await response.json();

    if (response.ok) {
      icono.className = nuevoEstado
        ? "fas fa-star favorito-icono activo"
        : "far fa-star favorito-icono";
      icono.setAttribute("data-favorito", nuevoEstado);
      mostrarNotificacion("exito", "Preferencia actualizada", resultado.mensaje);
    } else {
      mostrarNotificacion("error", "Error al actualizar", resultado.error || "Intenta nuevamente.");
    }
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    mostrarNotificacion("error", "Error inesperado", "No se pudo actualizar la preferencia.");
  }
}

//Función para mostrar el contenido 
async function mostrarVistaContenido(historial_id, fecha) {
    iniciarCargaProceso();
    const vistaVacia = document.getElementById("vista-vacia-historial");
    const vistaContenido = document.getElementById("vista-contenido-historial");

    vistaVacia.style.display = "none";
    vistaContenido.style.display = "block";

    try {
        const response = await fetch(`/historial-agrupaciones/${historial_id}/nlp`);
        
        if (!response.ok) {
            const errorData = await response.json();
            mostrarNotificacion("error", "Error al cargar Historial", errorData.error || "No se pudo obtener el historial.");
            return;
        }

        const datos = await response.json();
        const nlp = datos.nlp;
        const agrupacion = datos.agrupacion;
        

        // Actualizar título
        document.getElementById("historial-nombre").textContent = "Historial de clasificación ideológica: " + agrupacion.nombre;
         
        // Actualizar información básica
        document.getElementById("historial-fecha").textContent = fecha;
        document.getElementById("total-archivos").textContent = nlp.archivos_origen ? JSON.parse(nlp.archivos_origen).length : 0;
        document.getElementById("total-frases").textContent = nlp.total_frases || 0;
        document.getElementById("longitud-promedio").textContent = nlp.longitud_promedio_frases ? nlp.longitud_promedio_frases.toFixed(2) : "0";
        document.getElementById("caracteres-eliminados").textContent = nlp.caracteres_eliminados || 0;

        // Procesar interpretación ideológica
        procesarInterpretacionIdeologica(agrupacion.interpretacion);
        
        // Procesar configuración y métricas
        procesarConfiguracionYMetricas(agrupacion);
        
        // Generar cards de clusters con análisis económico mejorado
        generarCardsClusters(agrupacion.interpretacion);
        
        // Procesar análisis gramatical
        //procesarAnalisisGramatical(nlp, agrupacion);
        
        // Procesar frases clasificadas
        procesarFrasesClasificadas(agrupacion);

        //
        procesarDocumentosClasificados(agrupacion.interpretacion, nlp.archivos_origen, nlp.texto_completo_por_archivo);

    } catch (error) {
        console.error("Error al obtener NLP:", error);
        mostrarNotificacion("error", "Error inesperado", "No se pudo cargar el procesamiento NLP.");
    }
    terminarCargaProceso();
}

function procesarInterpretacionIdeologica(interpretacion) {
    const contenedorTexto = document.getElementById("interpretacion-texto");
    const contenedorDistribucion = document.getElementById("interpretacion-distribucion");

    if (!interpretacion || Object.keys(interpretacion).length === 0) {
        contenedorTexto.innerHTML = "<p>No hay datos de interpretación disponibles.</p>";
        contenedorDistribucion.innerHTML = "";
        return;
    }

    // Calcular distribución basada en porcentaje de ocupación
    let totalOcupacion = 0;
    let ocupacionIzquierda = 0;
    let ocupacionDerecha = 0;
    let ocupacionNeutral = 0;
    let ocupacionNoPolitico = 0;
    let clustersEconomicos = 0;
    let ocupacionEconomica = 0;

    Object.values(interpretacion).forEach(cluster => {
        const porcentajeOcupacion = cluster.porcentaje_ocupacion || 0;
        totalOcupacion += porcentajeOcupacion;

        // ✅ CONTAR TODAS las ideologías incluyendo "no_politico" y "neutral"
        const ideologia = cluster.ideologia?.toLowerCase();
        
        if (ideologia === 'izquierda') {
            ocupacionIzquierda += porcentajeOcupacion;
        } else if (ideologia === 'derecha') {
            ocupacionDerecha += porcentajeOcupacion;
        } else if (ideologia === 'neutral') {
            ocupacionNeutral += porcentajeOcupacion;
        } else if (ideologia === 'no_politico') {
            ocupacionNoPolitico += porcentajeOcupacion;
        }

        // ✅ CONTAR como económico SOLO si es político (izquierda/derecha/neutral)
        if (cluster.analisis_economico?.es_economico && 
            ['izquierda', 'derecha', 'neutral'].includes(ideologia)) {
            clustersEconomicos++;
            ocupacionEconomica += porcentajeOcupacion;
        }
    });

    // Calcular porcentajes reales
    const contenidoTotal = ocupacionIzquierda + ocupacionDerecha + ocupacionNeutral + ocupacionNoPolitico;
    
    // Porcentajes sobre el contenido TOTAL (incluyendo no_politico)
    const porcentajeIzquierdaTotal = contenidoTotal > 0 ? Math.round((ocupacionIzquierda / contenidoTotal) * 100) : 0;
    const porcentajeDerechaTotal = contenidoTotal > 0 ? Math.round((ocupacionDerecha / contenidoTotal) * 100) : 0;
    const porcentajeNeutralTotal = contenidoTotal > 0 ? Math.round((ocupacionNeutral / contenidoTotal) * 100) : 0;
    const porcentajeNoPoliticoTotal = contenidoTotal > 0 ? Math.round((ocupacionNoPolitico / contenidoTotal) * 100) : 0;
    
    // Porcentajes sobre contenido POLÍTICO (excluyendo no_politico)
    const contenidoPolitico = ocupacionIzquierda + ocupacionDerecha + ocupacionNeutral;
    const porcentajeIzquierdaPolitico = contenidoPolitico > 0 ? Math.round((ocupacionIzquierda / contenidoPolitico) * 100) : 0;
    const porcentajeDerechaPolitico = contenidoPolitico > 0 ? Math.round((ocupacionDerecha / contenidoPolitico) * 100) : 0;
    const porcentajeNeutralPolitico = contenidoPolitico > 0 ? Math.round((ocupacionNeutral / contenidoPolitico) * 100) : 0;
    
    const porcentajeEconomicos = totalOcupacion > 0 ? Math.round((ocupacionEconomica / totalOcupacion) * 100) : 0;
    const totalClusters = Object.keys(interpretacion).length;

    // ✅ GENERAR TEXTO INTERPRETATIVO MEJORADO
    let textoInterpretacion = "";

    if (contenidoPolitico === 0) {
        textoInterpretacion = `El análisis no detectó contenido político significativo (${porcentajeNoPoliticoTotal}% no político). `;
    } else if (porcentajeNoPoliticoTotal >= 80) {
        textoInterpretacion = `Predomina el contenido no político (${porcentajeNoPoliticoTotal}%), con solo ${100 - porcentajeNoPoliticoTotal}% de contenido político. `;
    } else {
        // Hay contenido político significativo
        if (porcentajeIzquierdaPolitico > porcentajeDerechaPolitico && porcentajeIzquierdaPolitico > porcentajeNeutralPolitico) {
            textoInterpretacion = `Predomina contenido de izquierda (${porcentajeIzquierdaTotal}% del total, ${porcentajeIzquierdaPolitico}% del político). `;
        } else if (porcentajeDerechaPolitico > porcentajeIzquierdaPolitico && porcentajeDerechaPolitico > porcentajeNeutralPolitico) {
            textoInterpretacion = `Predomina contenido de derecha (${porcentajeDerechaTotal}% del total, ${porcentajeDerechaPolitico}% del político). `;
        } else if (porcentajeNeutralPolitico > porcentajeIzquierdaPolitico && porcentajeNeutralPolitico > porcentajeDerechaPolitico) {
            textoInterpretacion = `Predomina contenido neutral/equilibrado (${porcentajeNeutralTotal}% del total, ${porcentajeNeutralPolitico}% del político). `;
        } else {
            textoInterpretacion = `Distribución mixta: izquierda ${porcentajeIzquierdaTotal}%, derecha ${porcentajeDerechaTotal}%, neutral ${porcentajeNeutralTotal}%. `;
        }
        
        textoInterpretacion += `Contenido no político: ${porcentajeNoPoliticoTotal}%. `;
    }

    textoInterpretacion += `Se identificaron ${totalClusters} clusters temáticos. `;

    if (clustersEconomicos > 0) {
        textoInterpretacion += `${clustersEconomicos} clusters (${porcentajeEconomicos}%) contienen análisis económico.`;
    } else {
        textoInterpretacion += "No se detectó contenido económico específico.";
    }

    contenedorTexto.innerHTML = `<p>${textoInterpretacion}</p>`;

    // ✅ GENERAR VISUALIZACIÓN MEJORADA
    const barrasHTML = `
        ${ocupacionIzquierda > 0 ? `<div class="barra-ideologia izquierda" style="width: ${porcentajeIzquierdaTotal}%">
            <span>Izquierda ${porcentajeIzquierdaTotal}%</span>
        </div>` : ''}
        
        ${ocupacionDerecha > 0 ? `<div class="barra-ideologia derecha" style="width: ${porcentajeDerechaTotal}%">
            <span>Derecha ${porcentajeDerechaTotal}%</span>
        </div>` : ''}
        
        ${ocupacionNeutral > 0 ? `<div class="barra-ideologia neutral" style="width: ${porcentajeNeutralTotal}%">
            <span>Neutral ${porcentajeNeutralTotal}%</span>
        </div>` : ''}
        
        ${ocupacionNoPolitico > 0 ? `<div class="barra-ideologia no-politico" style="width: ${porcentajeNoPoliticoTotal}%">
            <span>No Político ${porcentajeNoPoliticoTotal}%</span>
        </div>` : ''}
        
        ${contenidoTotal === 0 ? `<div class="barra-ideologia no-datos" style="width: 100%">
            <span>Sin datos</span>
        </div>` : ''}
    `;

    contenedorDistribucion.innerHTML = `
        <div class="distribucion-barras">
            ${barrasHTML}
        </div>
        <div class="distribucion-info">
            <small>${clustersEconomicos} clusters económicos (${porcentajeEconomicos}% del contenido)</small>
            <br>
            <small>Total contenido analizado: ${totalOcupacion}%</small>
        </div>
    `;
}

function procesarConfiguracionYMetricas(agrupacion) {
    const configInfo = document.getElementById("config-info");
    const metricasDetalladas = document.getElementById("metricas-detalladas");

    // Configuración
    const config = agrupacion.parametros_ejecucion || {};
    configInfo.innerHTML = `
        <div class="config-item">
            <strong>Modelo:</strong> ${config.modelo_embedding || 'No especificado'}
        </div>
        <div class="config-item">
            <strong>Método:</strong> ${config.metodo_clustering || 'No especificado'}
        </div>
        <div class="config-item">
            <strong>Clusters:</strong> ${config.n_clusters || 'No especificado'}
        </div>
        <div class="config-item">
            <strong>Dimensionalidad:</strong> ${config.dimensionalidad || 'No especificado'}
        </div>
    `;

    // Métricas
    const metricas = agrupacion.metricas || {};
    const silhouette = metricas['Silhouette Score'] || 0;
    const calinski = metricas['Calinski-Harabasz Index'] || 0;
    const davies = metricas['Davies-Bouldin Index'] || 0;
    const varianza = metricas['Varianza Intra-Clúster Promedio'] || 0;

    metricasDetalladas.innerHTML = `
        <div class="metrica-detalle">
            <span class="metrica-nombre">Silhouette Score</span>
            <span class="metrica-valor">${silhouette.toFixed(3)}</span>
            <div class="metrica-bar">
                <div class="bar-fill" style="width: ${Math.max(0, silhouette * 100)}%"></div>
            </div>
            <small>${obtenerDescripcionSilhouette(silhouette)}</small>
        </div>
        <div class="metrica-detalle">
            <span class="metrica-nombre">Calinski-Harabasz</span>
            <span class="metrica-valor">${calinski.toFixed(1)}</span>
            <div class="metrica-bar">
                <div class="bar-fill" style="width: ${Math.min(100, (calinski / 500) * 100)}%"></div>
            </div>
            <small>${obtenerDescripcionCalinski(calinski)}</small>
        </div>
        <div class="metrica-detalle">
            <span class="metrica-nombre">Davies-Bouldin</span>
            <span class="metrica-valor">${davies.toFixed(2)}</span>
            <div class="metrica-bar">
                <div class="bar-fill" style="width: ${Math.max(0, 100 - (davies * 50))}%"></div>
            </div>
            <small>${obtenerDescripcionDavies(davies)}</small>
        </div>
    `;
}

function obtenerDescripcionSilhouette(score) {
    if (score > 0.7) return "Excelente separación entre clusters";
    if (score > 0.5) return "Buena estructura de clusters";
    if (score > 0.25) return "Estructura razonable";
    return "Clusters superpuestos";
}

function obtenerDescripcionCalinski(score) {
    if (score > 300) return "Separación muy buena";
    if (score > 200) return "Buena separación";
    if (score > 100) return "Separación moderada";
    return "Separación limitada";
}

function obtenerDescripcionDavies(score) {
    if (score < 0.5) return "Clusters muy compactos";
    if (score < 1.0) return "Buena compactación";
    if (score < 1.5) return "Compactación moderada";
    return "Clusters dispersos";
}

let clustersData = {}; // Almacenar todos los clusters
let currentClusterIndex = 0; // Cluster actualmente seleccionado
let clusterIds = []; // IDs de clusters disponibles

function generarCardsClusters(interpretacion) {
    const clustersGrid = document.getElementById("clusters-grid");
    const clusterSelector = document.getElementById("cluster-selector");
    const clusterNavigation = document.getElementById("cluster-navigation");
    
    // Guardar los datos de clusters
    clustersData = interpretacion || {};
    clusterIds = Object.keys(clustersData);
    
    if (!interpretacion || clusterIds.length === 0) {
        clustersGrid.innerHTML = "<p>No se identificaron clusters.</p>";
        clustersGrid.classList.add('vacio');
        clusterSelector.innerHTML = '<option value="">No hay clusters</option>';
        clusterNavigation.style.display = 'none';
        return;
    }
    
    // Limpiar y llenar el selector
    clusterSelector.innerHTML = '<option value="">Clusters generados</option>';
    clusterIds.forEach(clusterId => {
        const cluster = clustersData[clusterId];
        const option = document.createElement('option');
        option.value = clusterId;
        option.textContent = `Cluster ${clusterId} - ${cluster.ideologia} (${cluster.porcentaje_ocupacion || 0}%)`;
        clusterSelector.appendChild(option);
    });
    
    // Mostrar el primer cluster por defecto
    currentClusterIndex = 0;
    mostrarClusterSeleccionado(clusterIds[0]);
    actualizarNavegacion();
    
    // Event listener para el selector
    clusterSelector.addEventListener('change', function() {
        const selectedClusterId = this.value;
        if (selectedClusterId) {
            const index = clusterIds.indexOf(selectedClusterId);
            currentClusterIndex = index;
            mostrarClusterSeleccionado(selectedClusterId);
            actualizarNavegacion();
        } else {
            // Si selecciona "Todos los clusters", mostrar vista de resumen
            mostrarTodosLosClusters();
        }
    });
}

function mostrarClusterSeleccionado(clusterId) {
    const clustersGrid = document.getElementById("clusters-grid");
    const cluster = clustersData[clusterId];
    
    if (!cluster) {
        clustersGrid.innerHTML = "<p>Cluster no encontrado.</p>";
        clustersGrid.classList.add('vacio');
        return;
    }
    
    clustersGrid.classList.remove('vacio');
    clustersGrid.innerHTML = generarHTMLCluster(clusterId, cluster);
}

function mostrarTodosLosClusters() {
    const clustersGrid = document.getElementById("clusters-grid");
    const clusterNavigation = document.getElementById("cluster-navigation");
    
    clustersGrid.classList.remove('vacio');
    
    if (clusterIds.length === 0) {
        clustersGrid.innerHTML = "<p>No se identificaron clusters.</p>";
        clusterNavigation.style.display = 'none';
        return;
    }
}

function seleccionarCluster(clusterId) {
    const clusterSelector = document.getElementById("cluster-selector");
    clusterSelector.value = clusterId;
    
    const index = clusterIds.indexOf(clusterId);
    currentClusterIndex = index;
    mostrarClusterSeleccionado(clusterId);
    actualizarNavegacion();
}

function navegarCluster(direccion) {
    if (direccion === 'anterior' && currentClusterIndex > 0) {
        currentClusterIndex--;
    } else if (direccion === 'siguiente' && currentClusterIndex < clusterIds.length - 1) {
        currentClusterIndex++;
    }
    
    const clusterId = clusterIds[currentClusterIndex];
    const clusterSelector = document.getElementById("cluster-selector");
    clusterSelector.value = clusterId;
    mostrarClusterSeleccionado(clusterId);
    actualizarNavegacion();
}

function actualizarNavegacion() {
    const clusterNavigation = document.getElementById("cluster-navigation");
    
    if (clusterIds.length <= 1) {
        clusterNavigation.style.display = 'none';
        return;
    }
    
    clusterNavigation.style.display = 'flex';
    
    const navInfo = clusterNavigation.querySelector('.cluster-nav-info');
    const btnAnterior = clusterNavigation.querySelector('.btn-anterior');
    const btnSiguiente = clusterNavigation.querySelector('.btn-siguiente');
    
    navInfo.textContent = `Cluster ${currentClusterIndex + 1} de ${clusterIds.length}`;
    
    btnAnterior.disabled = currentClusterIndex === 0;
    btnSiguiente.disabled = currentClusterIndex === clusterIds.length - 1;
}

// Mantén tu función generarHTMLCluster existente, solo la renombramos
function generarHTMLCluster(clusterId, cluster) {
    const analisisEconomico = cluster.analisis_economico || {};
    const esEconomico = (analisisEconomico.es_economico && cluster.ideologia?.toLowerCase() !== "no_politico") || false;
    const temaEconomico = analisisEconomico.tema || "No económico";
    const orientacionEconomica = analisisEconomico.orientacion || "Neutral";
    const scoreEconomico = analisisEconomico.score_total || 0;
    const palabrasClave = analisisEconomico.palabras_clave || [];
    const palabrasEconomicas = analisisEconomico.palabras_economicas || [];
    const patrones = analisisEconomico.frases_asociadas || {};

    return `
        <div class="cluster-card ${cluster.ideologia?.toLowerCase()}">
            <div class="cluster-header">
                <h4>Cluster ${clusterId}</h4>
                <span class="cluster-ideologia ${cluster.ideologia?.toLowerCase()}">${cluster.ideologia}</span>
            </div>
            <div class="cluster-meta">
                <span class="cluster-tamano">${cluster.palabras?.length || 0} frases</span>
                <span class="cluster-porcentaje">${cluster.porcentaje_ocupacion || 0}% del corpus</span>
            </div>
            <div class="cluster-tema ${esEconomico ? 'economico' : 'no-economico'}">
                <i class="fas ${esEconomico ? 'fa-chart-line' : (cluster.ideologia?.toLowerCase() === "no_politico" ? 'fa-theater-masks' : 'fa-file-alt')}"></i>
                ${cluster.ideologia?.toLowerCase() === "no_politico" ? "CONTENIDO NO POLÍTICO" : temaEconomico}
                ${esEconomico ? `<span class="score-economico">Score: ${scoreEconomico.toFixed(2)}</span>` : ''}
            </div>
            
            ${esEconomico ? `
            <div class="analisis-economico-detallado">
                <div class="economico-orientacion">
                    <strong>Orientación económica:</strong> ${orientacionEconomica}
                </div>
                ${palabrasClave.length > 0 ? `
                <div class="economico-palabras-clave">
                    <strong>Conceptos MARPOR:</strong>
                    <div class="palabras-clave-lista">
                        ${palabrasClave.map(palabra => `<span class="palabra-clave">${palabra}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                ${palabrasEconomicas.length > 0 ? `
                <div class="economico-categorias">
                    <strong>Categorías detectadas:</strong>
                    <div class="categorias-lista">
                        ${palabrasEconomicas.map(cat => `<span class="categoria">${cat}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                ${Object.keys(patrones).length > 0 ? `
                <div class="economico-patrones">
                    <strong>Patrones identificados:</strong>
                    ${Object.entries(patrones).map(([categoria, frases]) => `
                        <div class="patron-item">
                            <span class="patron-nombre">${categoria}:</span>
                            <span class="patron-ejemplos">${frases.slice(0, 3).join(', ')}${frases.length > 3 ? '...' : ''}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <div class="cluster-palabras">
                <h5>Frases representativas (${cluster.palabras_representativas ? cluster.palabras_representativas.length : 0}):</h5>
                <div class="palabras-lista">
                    ${(cluster.palabras_representativas || []).slice(0, 15).map(palabra => 
                        `<span class="palabra-tag">${palabra}</span>`
                    ).join('')}
                    ${(cluster.palabras_representativas || []).length > 15 ? 
                        '<span class="palabra-tag">+ ' + ((cluster.palabras_representativas || []).length - 15) + ' más</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

function procesarFrasesClasificadas(agrupacion) {
    const contenedorFrases = document.getElementById("frases-contenedor-historial");
    
    // Verificar si ECharts está disponible
    if (typeof echarts === 'undefined') {
        contenedorFrases.innerHTML = `
            <div class="error-grafico">
                <p>Error: La librería ECharts no está cargada.</p>
            </div>
        `;
        return;
    }

    if (!agrupacion.embeddings_latentes || Object.keys(agrupacion.embeddings_latentes).length === 0) {
        contenedorFrases.innerHTML = `
            <div class="sin-datos">
                <p>No hay datos de embeddings disponibles para la visualización.</p>
            </div>
        `;
        return;
    }

    // Crear contenedor para el gráfico que ocupe todo el espacio
    contenedorFrases.innerHTML = `
        <div class="visualizacion-clusters-full">
            <div id="grafico-general-descripcion" style="width: 100%; height: 600px;"></div>
        </div>
    `;

    // === SOLUCIÓN: Pequeño delay para asegurar que el DOM se actualice ===
    setTimeout(() => {
        try {
            prepararVisualizacionClustersFull(agrupacion);
        } catch (error) {
            console.error('Error al crear el gráfico:', error);
            const contenedor = document.getElementById('grafico-general-descripcion');
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="error-grafico">
                        <p>Error al crear la visualización: ${error.message}</p>
                    </div>
                `;
            }
        }
    }, 50); // Pequeño delay de 50ms
}


function prepararVisualizacionClustersFull(agrupacion) {
    const contenedor = document.getElementById('grafico-general-descripcion');
    if (!contenedor) throw new Error('Contenedor no encontrado');
    
    const selector = document.getElementById('selector-tipo-grafico');
    if (selector) {
        selector.onchange = (e) => {
            const tipo = e.target.value;
            const fn = {
                'ideologia': generarGraficoDispersionPorIdeologia,
                'autores': generarGraficoDispersionPorAutores,
                'economico': generarGraficoDispersionPorClustersEconomicos
            }[tipo] || generarGraficoDispersionPorIdeologia;
            
            fn(
                agrupacion.embeddings_latentes,
                agrupacion.asignacion_clusters || {},
                agrupacion.interpretacion || {}
            );
        };
    }
    
    return generarGraficoDispersionPorIdeologia(
        agrupacion.embeddings_latentes,
        agrupacion.asignacion_clusters || {},
        agrupacion.interpretacion || {}
    );
}

// Función para exportar el historial a PDF

// Función para exportar el historial a PDF con PDFMake
document.addEventListener("DOMContentLoaded", () => {
    const btnExportar = document.getElementById("btn-exportar-pdf");
    if (btnExportar) {
        btnExportar.addEventListener("click", exportarHistorialPDF);
    }
});

async function exportarHistorialPDF() {
    const btnExportar = document.getElementById("btn-exportar-pdf");
    const originalText = btnExportar.innerHTML;
    
    try {
        // Verificar si PDFMake está disponible
        if (typeof pdfMake === 'undefined' || typeof pdfMake.createPdf === 'undefined') {
            throw new Error("PDFMake no está cargado correctamente.");
        }
        
        // Mostrar estado de carga
        btnExportar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
        btnExportar.disabled = true;
        
        // Obtener el historial activo
        const filaActiva = document.querySelector("#tabla-general-historial tbody tr.fila-activa");
        if (!filaActiva) {
            mostrarNotificacion("info", "Selecciona un historial", "Por favor, selecciona un elemento del historial para exportar.");
            return;
        }
        
        const historialId = filaActiva.getAttribute("data-id");
        
        // Obtener datos del historial
        const response = await fetch(`/historial-agrupaciones/${historialId}/nlp`);
        if (!response.ok) {
            throw new Error("No se pudieron obtener los datos del historial");
        }
        
        const datos = await response.json();
        
        // Generar PDF con PDFMake
        await generarPDFCompleto(datos);
        
        mostrarNotificacion("exito", "PDF generado", "El reporte se ha descargado correctamente.");
        
    } catch (error) {
        console.error("Error al exportar PDF:", error);
        mostrarNotificacion("error", "Error al generar PDF", "No se pudo generar el reporte. Intenta nuevamente.");
    } finally {
        // Restaurar estado del botón
        btnExportar.innerHTML = originalText;
        btnExportar.disabled = false;
    }
}

async function generarPDFCompleto(datos) {
    return new Promise((resolve, reject) => {
        try {
            const agrupacion = datos.agrupacion;
            const nlp = datos.nlp;
            
            // DEFINIR EL DOCUMENTO PDF CONTINUO
            const documentDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                header: function(currentPage, pageCount) {
                    return {
                        stack: [
                            {
                                canvas: [
                                    {
                                        type: 'rect',
                                        x: 0, y: 0,
                                        w: 595, h: 45,
                                        color: '#2e5aac'
                                    }
                                ]
                            },
                            {
                                text: 'Reporte de Clasificación NLPolitik',
                                fontSize: 16,
                                bold: true,
                                color: 'white',
                                alignment: 'center',
                                absolutePosition: { x: 0, y: 15 } // Bajé el título
                            },
                            {
                                text: `Generado el: ${new Date().toLocaleDateString()}`,
                                fontSize: 9,
                                color: 'white',
                                alignment: 'center',
                                absolutePosition: { x: 0, y: 35 } // Bajé la fecha
                            }
                        ],
                        margin: [0, 0, 0, 25]
                    };
                },
                footer: function(currentPage, pageCount) {
                    return {
                        text: `Página ${currentPage} de ${pageCount} - Generado por NLPolitik`,
                        alignment: 'center',
                        fontSize: 7,
                        color: '#666666',
                        margin: [0, 20, 0, 0]
                    };
                },
                content: [
                    // INFORMACIÓN BÁSICA
                    {
                        text: 'Información del Análisis',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 25]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    {
                        columns: [
                            {
                                width: '50%',
                                stack: [
                                    { 
                                        text: [
                                            { text: 'Agrupación: ', bold: true },
                                            agrupacion.nombre || 'No especificado'
                                        ],
                                        margin: [0, 0, 0, 8]
                                    },
                                    { 
                                        text: [
                                            { text: 'Fecha de análisis: ', bold: true },
                                            document.getElementById('historial-fecha')?.textContent || 'No disponible'
                                        ],
                                        margin: [0, 0, 0, 8]
                                    }
                                ]
                            },
                            {
                                width: '50%',
                                stack: [
                                    { 
                                        text: [
                                            { text: 'Archivos procesados: ', bold: true },
                                            document.getElementById('total-archivos')?.textContent || '0'
                                        ],
                                        margin: [0, 0, 0, 8]
                                    },
                                    { 
                                        text: [
                                            { text: 'Frases extraídas: ', bold: true },
                                            document.getElementById('total-frases')?.textContent || '0'
                                        ],
                                        margin: [0, 0, 0, 8]
                                    }
                                ]
                            }
                        ],
                        lineHeight: 1.3,
                        margin: [0, 0, 0, 20]
                    },

                    // ESTADÍSTICAS PRINCIPALES
                    {
                        text: 'Estadísticas Principales',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    {
                        text: [
                            { text: 'Archivos procesados: ', bold: true },
                            document.getElementById('total-archivos')?.textContent || '0',
                            { text: '    ' },
                            { text: 'Frases extraídas: ', bold: true },
                            document.getElementById('total-frases')?.textContent || '0',
                            { text: '\n' },
                            { text: 'Longitud promedio: ', bold: true },
                            document.getElementById('longitud-promedio')?.textContent || '0',
                            { text: '    ' },
                            { text: 'Caracteres eliminados: ', bold: true },
                            document.getElementById('caracteres-eliminados')?.textContent || '0'
                        ],
                        fontSize: 10,
                        lineHeight: 1.5,
                        margin: [0, 0, 0, 25]
                    },

                    // INTERPRETACIÓN IDEOLÓGICA
                    {
                        text: 'Interpretación Ideológica',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    {
                        text: document.getElementById('interpretacion-texto')?.textContent || 'No hay interpretación disponible',
                        fontSize: 10,
                        lineHeight: 1.4,
                        margin: [0, 0, 0, 15]
                    },
                    // AGREGAR LAS BARRAS DE DISTRIBUCIÓN
                    ...crearBarrasDistribucion(),
                    // CLUSTERS IDENTIFICADOS (Resumen)
                    {
                        text: 'Clusters Identificados',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    ...crearResumenClusters(agrupacion.interpretacion || {}, datos),

                    // MÉTRICAS DE CALIDAD
                    {
                        text: 'Métricas de Calidad del Clustering',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    ...crearMetricasClustering(agrupacion.metricas || {}),
                    // Agregar esta nueva sección después de las métricas de calidad
                    {
                        text: 'Distribución de Frases clasificadas por Cluster',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 20, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    ...crearDistribucionFrasesClusters(agrupacion.interpretacion || {}, datos),
                    // Agregar esta nueva sección después de la distribución de clusters
                    {
                        text: 'Documentos Completos con Frases Clasificadas',
                        fontSize: 14,
                        bold: true,
                        color: '#2e5aac',
                        margin: [0, 20, 0, 5]
                    },
                    {
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 1, 
                            lineColor: '#2e5aac' 
                        }],
                        margin: [0, 5, 0, 15]
                    },
                    ...crearDocumentosCompletosConFrases(agrupacion.interpretacion || {}, datos)
                ]
            };

            // GENERAR PDF
            console.log('Generando PDF continuo...');
            const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
            const nombreArchivo = `Reporte_Historial_${agrupacion.nombre || 'Analisis'}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            // Descargar el PDF
            pdfDocGenerator.download(nombreArchivo, () => {
                console.log('✅ PDF continuo generado exitosamente');
                resolve();
            });

        } catch (error) {
            console.error('❌ Error generando PDF:', error);
            reject(error);
        }
    });
}

//Funciones para el despliege de los clusteres
function crearResumenClusters(interpretacion, datosCompletos) {
    const contenido = [];
    
    if (Object.keys(interpretacion).length === 0) {
        contenido.push({
            text: 'No hay clusters disponibles.',
            fontSize: 14,
            color: '#666666',
            margin: [0, 0, 0, 10]
        });
        return contenido;
    }
    
    // Preparar análisis gramatical una sola vez
    const analisisGramaticalPorCluster = prepararAnalisisGramaticalParaPDF(datosCompletos);
    
    Object.entries(interpretacion).forEach(([idCluster, cluster]) => {
        const totalFrases = analisisGramaticalPorCluster[idCluster]?.totalFrases || 0;
        const analisisGramatical = analisisGramaticalPorCluster[idCluster];
        const analisisEconomico = cluster.analisis_economico || {};
        const esPolitico = cluster.ideologia && 
                          cluster.ideologia.toLowerCase() !== 'no_politico' && 
                          cluster.ideologia.toLowerCase() !== 'no politico';
        
        // Header del cluster
        contenido.push(
            {
                stack: [
                    {
                        table: {
                            widths: ['*'],
                            body: [[
                                {
                                    text: `Cluster ${idCluster} - ${cluster.ideologia || 'No definida'}`,
                                    bold: true,
                                    color: '#ffffff',
                                    fontSize: 14
                                }
                            ]]
                        },
                        layout: {
                            fillColor: function(rowIndex) {
                                return '#2e5aac';
                            }
                        },
                        margin: [0, 0, 0, 5]
                    }
                ]
            },
            {
                columns: [
                    {
                        width: '50%',
                        text: `Ocupación: ${cluster.porcentaje_ocupacion || 0}%`,
                        fontSize: 10,
                        color: '#666666'
                    },
                    {
                        width: '50%',
                        text: `Total de frases: ${totalFrases}`,
                        fontSize: 10,
                        color: '#666666',
                        alignment: 'right'
                    }
                ],
                margin: [0, 0, 0, 8]
            }
        );

        // SECCIÓN DE ANÁLISIS ECONÓMICO
        if (analisisEconomico.es_economico && esPolitico) {
            contenido.push(
                {
                    table: {
                        widths: ['*'],
                        body: [[
                            {
                                text: 'ANÁLISIS ECONÓMICO',
                                bold: true,
                                color: '#ffffff',
                                fontSize: 14
                            }
                        ]]
                    },
                    layout: {
                        fillColor: function(rowIndex) {
                            return '#f48b3a';
                        }
                    },
                    margin: [0, 0, 0, 5]
                }
            );

            const contenidoEconomico = [];

            // Tema económico
            if (analisisEconomico.tema) {
                contenidoEconomico.push({
                    text: [
                        { text: '• Tema: ', bold: true },
                        analisisEconomico.tema
                    ],
                    fontSize: 10,
                    margin: [0, 0, 0, 3]
                });
            }

            // Orientación
            if (analisisEconomico.orientacion) {
                contenidoEconomico.push({
                    text: [
                        { text: '• Orientación: ', bold: true },
                        analisisEconomico.orientacion
                    ],
                    fontSize: 10,
                    margin: [0, 0, 0, 3]
                });
            }

            // Palabras clave MARPOR
            if (analisisEconomico.palabras_clave && analisisEconomico.palabras_clave.length > 0) {
                const textoPalabras = analisisEconomico.palabras_clave.slice(0, ).join(', ');
                contenidoEconomico.push({
                    text: [
                        { text: '• Conceptos MARPOR: ', bold: true },
                        textoPalabras + (analisisEconomico.palabras_clave.length > 10 ? '...' : '')
                    ],
                    fontSize: 10,
                    margin: [0, 0, 0, 3]
                });
            }

            // Categorías económicas
            if (analisisEconomico.palabras_economicas && analisisEconomico.palabras_economicas.length > 0) {
                const textoCategorias = analisisEconomico.palabras_economicas.slice(0, ).join(', ');
                contenidoEconomico.push({
                    text: [
                        { text: '• Categorías MARPOR: ', bold: true },
                        textoCategorias + (analisisEconomico.palabras_economicas.length > 8 ? '...' : '')
                    ],
                    fontSize: 10,
                    margin: [0, 0, 0, 3]
                });
            }

            // Patrones identificados
            if (analisisEconomico.frases_asociadas && Object.keys(analisisEconomico.frases_asociadas).length > 0) {
                contenidoEconomico.push({
                    text: '• Patrones identificados:',
                    bold: true,
                    fontSize: 10,
                    margin: [0, 10, 0, 5]
                });

                let categoriasMostradas = 0;
                Object.entries(analisisEconomico.frases_asociadas).forEach(([categoria, frases]) => {
                    if (categoriasMostradas >= 3) return;

                    contenidoEconomico.push({
                        text: `  • ${categoria}:`,
                        bold: true,
                        fontSize: 10,
                        color: '#2e5aac',
                        margin: [0, 0, 0, 2]
                    });

                    // Mostrar primeras 2-3 frases de cada categoría
                    frases.slice(0, ).forEach((frase, index) => {
                        contenidoEconomico.push({
                            text: `    - ${frase}`,
                            fontSize: 10,
                            margin: [0, 0, 0, 1],
                            italics: true
                        });
                    });

    
                    categoriasMostradas++;
                });

                if (Object.keys(analisisEconomico.frases_asociadas).length > 3) {
                    contenidoEconomico.push({
                        text: `  ... ${Object.keys(analisisEconomico.frases_asociadas).length - 3} categorías adicionales`,
                        fontSize: 10,
                        color: '#666666',
                        margin: [0, 0, 0, 3]
                    });
                }
            }

            contenido.push({
                stack: contenidoEconomico,
                margin: [10, 5, 0, 10]
            });

            // Línea separadora económica
            contenido.push({
                canvas: [{ 
                    type: 'line', 
                    x1: 0, y1: 0, 
                    x2: 515, y2: 0, 
                    lineWidth: 0.5, 
                    lineColor: '#f48b3a' 
                }],
                margin: [0, 5, 0, 10]
            });
        }
        /* 
        // SECCIÓN DE DISTRIBUCIÓN GRAMATICAL
        if (analisisGramatical && analisisGramatical.estructurasComunes.length > 0) {
            contenido.push({
                text: 'Distribución Gramatical:',
                bold: true,
                color: '#2e5aac',
                fontSize: 10,
                margin: [0, 0, 0, 5]
            });

            // Crear tabla de distribución POS
            const tablaPOS = {
                table: {
                    headerRows: 1,
                    widths: ['*', '25%', '25%'],
                    body: [
                        [
                            { text: 'Etiqueta POS', style: 'tableHeader', fontSize: 10 },
                            { text: 'Frecuencia', style: 'tableHeader', fontSize: 10 },
                            { text: 'Porcentaje', style: 'tableHeader', fontSize: 10 }
                        ]
                    ]
                },
                layout: {
                    fillColor: function(rowIndex, node, columnIndex) {
                        return (rowIndex === 0) ? '#4d82ec' : 
                               (rowIndex % 2 === 0) ? '#f5f5f5' : '#ffffff';
                    }
                },
                margin: [0, 0, 0, 10]
            };

            // Agregar filas de datos POS
            analisisGramatical.estructurasComunes.forEach((pos) => {
                tablaPOS.table.body.push([
                    { text: pos.pos, fontSize: 10, color: '#000000' },
                    { text: pos.count.toString(), fontSize: 10, color: '#000000' },
                    { text: pos.porcentaje + '%', fontSize: 10, color: '#000000' }
                ]);
            });

            contenido.push(tablaPOS);
        }

        // SECCIÓN DE EJEMPLOS GRAMATICALES
        if (analisisGramatical && analisisGramatical.ejemplos.length > 0) {
            contenido.push({
                text: 'Ejemplos de Análisis:',
                bold: true,
                color: '#2e5aac',
                fontSize: 10,
                margin: [0, 0, 0, 5]
            });

            analisisGramatical.ejemplos.slice(0, 3).forEach((ejemplo, indice) => {
                const textoEtiquetas = ejemplo.pos_tags.slice(0, ).map(etiqueta => 
                    `${traducirPOSParaPDF(etiqueta.tag)}`
                ).join(', ');

                contenido.push(
                    {
                        text: `"${ejemplo.frase}"`,
                        italics: true,
                        fontSize: 10,
                        margin: [5, 0, 0, 2]
                    },
                    {
                        text: `Etiquetas: ${textoEtiquetas}${ejemplo.pos_tags.length > 6 ? '.' : ''}`,
                        fontSize: 7,
                        color: '#666666',
                        margin: [5, 0, 0, 8]
                    }
                );

                // Separador entre ejemplos (excepto el último)
                if (indice < Math.min(analisisGramatical.ejemplos.length - 1, 2)) {
                    contenido.push({
                        canvas: [{ 
                            type: 'line', 
                            x1: 0, y1: 0, 
                            x2: 515, y2: 0, 
                            lineWidth: 0.3, 
                            lineColor: '#c8c8c8' 
                        }],
                        margin: [0, 3, 0, 3]
                    });
                }
            });

            contenido.push({ text: '', margin: [0, 0, 0, 5] });
        }
        */

        // SECCIÓN DE FRASES REPRESENTATIVAS
        const palabras = cluster.palabras_representativas || [];
        if (palabras.length > 0) {
            contenido.push({
                text: 'Frases representativas (más cercanas al centroide):',
                bold: true,
                color: '#2e5aac',
                fontSize: 10,
                margin: [0, 0, 0, 5]
            });

            const frasesLista = palabras.slice(0, ).map((frase, index) => ({
                text: `• ${frase}`,
                fontSize: 10,
                margin: [5, 0, 0, 2]
            }));

            contenido.push(...frasesLista);
        }

        // Separador entre clusters
        contenido.push({
            canvas: [{ 
                type: 'line', 
                x1: 0, y1: 0, 
                x2: 515, y2: 0, 
                lineWidth: 0.5, 
                lineColor: '#c8c8c8' 
            }],
            margin: [0, 5, 0, 15]
        });
    });

    return contenido;
}

// Función auxiliar para preparar el análisis gramatical (la misma que tenías)
function prepararAnalisisGramaticalParaPDF(datos) {
    const nlp = datos.nlp;
    const agrupacion = datos.agrupacion;
    
    if (!nlp.etiquetas_pos_por_archivo || nlp.etiquetas_pos_por_archivo.length === 0 || 
        !agrupacion.asignacion_clusters) {
        return {};
    }

    const analisisPorCluster = {};
    const asignacionClusters = agrupacion.asignacion_clusters;
    const interpretacion = agrupacion.interpretacion || {};

    Object.keys(interpretacion).forEach(idCluster => {
        analisisPorCluster[idCluster] = {
            ideologia: interpretacion[idCluster]?.ideologia || 'Desconocida',
            totalFrases: 0,
            distribucionPOS: {},
            estructurasComunes: [],
            ejemplos: []
        };
    });

    nlp.etiquetas_pos_por_archivo.forEach(archivo => {
        archivo.forEach(objetoFrase => {
            const textoFrase = objetoFrase.frase;
            const idCluster = asignacionClusters[textoFrase];
            
            if (idCluster !== undefined && analisisPorCluster[idCluster]) {
                analisisPorCluster[idCluster].totalFrases++;
                
                objetoFrase.pos_tags.forEach(etiqueta => {
                    const posEspanol = traducirPOSParaPDF(etiqueta.tag);
                    if (!analisisPorCluster[idCluster].distribucionPOS[posEspanol]) {
                        analisisPorCluster[idCluster].distribucionPOS[posEspanol] = 0;
                    }
                    analisisPorCluster[idCluster].distribucionPOS[posEspanol]++;
                });
                
                if (analisisPorCluster[idCluster].ejemplos.length < 3) {
                    analisisPorCluster[idCluster].ejemplos.push(objetoFrase);
                }
            }
        });
    });

    Object.keys(analisisPorCluster).forEach(idCluster => {
        const distribucion = analisisPorCluster[idCluster].distribucionPOS;
        const totalEtiquetas = Object.values(distribucion).reduce((suma, conteo) => suma + conteo, 0);
        
        if (totalEtiquetas > 0) {
            analisisPorCluster[idCluster].estructurasComunes = Object.entries(distribucion)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([pos, conteo]) => ({
                    pos: pos,
                    porcentaje: Math.round((conteo / totalEtiquetas) * 100),
                    count: conteo
                }));
        }
    });

    return analisisPorCluster;
}

// VERSIÓN MEJORADA CON BORDES Y MEJOR LEGIBILIDAD
function crearBarrasDistribucion() {
    const contenedorBarras = document.querySelector('.distribucion-barras');
    if (!contenedorBarras) {
        return [];
    }

    const barras = contenedorBarras.querySelectorAll('.barra-ideologia');
    if (barras.length === 0) {
        return [];
    }

    const contenido = [];
    
    // Crear tabla simple
    const tableBody = [];
    const widths = [];
    const row = [];

    barras.forEach(barra => {
        const porcentaje = parseInt(barra.style.width);
        const textoCompleto = barra.textContent.trim();
        
        let colorFondo;
        if (barra.classList.contains('izquierda')) {
            colorFondo = '#f48b3a';
        } else if (barra.classList.contains('derecha')) {
            colorFondo = '#2e5aac';
        } else if (barra.classList.contains('no-politico') || barra.classList.contains('no_politico')) {
            colorFondo = '#808080';
        } else {
            colorFondo = '#2e5aac';
        }

        widths.push(`${porcentaje}%`);
        
        row.push({
            text: textoCompleto,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            color: 'white',
            fillColor: colorFondo,
            margin: [2, 6, 2, 6]
        });
    });

    tableBody.push(row);

    contenido.push(
        {
            table: {
                widths: widths,
                body: tableBody,
                heights: 25
            },
            layout: 'noBorders',
            margin: [0, 10, 0, 20]
        }
    );

    return contenido;
}

// Función para traducir etiquetas POS al español (la misma que tenías)
function traducirPOSParaPDF(etiquetaIngles) {
    const traducciones = {
        'NOUN': 'Sustantivo',
        'VERB': 'Verbo',
        'ADJ': 'Adjetivo',
        'ADV': 'Adverbio',
        'DET': 'Determinante',
        'ADP': 'Preposición',
        'PRON': 'Pronombre',
        'CCONJ': 'Conjunción',
        'SCONJ': 'Conjunción Sub.',
        'NUM': 'Número',
        'AUX': 'Verbo Auxiliar',
        'PART': 'Partícula',
        'PROPN': 'Nombre Propio',
        'INTJ': 'Interjección',
        'PUNCT': 'Puntuación',
        'SYM': 'Símbolo',
        'X': 'Otro'
    };
    
    return traducciones[etiquetaIngles] || etiquetaIngles;
}
//-------------------------------------------------
//Funcion para crear metricas generales
function crearMetricasClustering(metricas) {
    const metricasData = [
        { nombre: 'Silhouette Score', valor: metricas['Silhouette Score'] || 0, descripcion: 'Cohesión y separación' },
        { nombre: 'Calinski-Harabasz', valor: metricas['Calinski-Harabasz Index'] || 0, descripcion: 'Densidad y varianza' },
        { nombre: 'Davies-Bouldin', valor: metricas['Davies-Bouldin Index'] || 0, descripcion: 'Similaridad intra-cluster' }
    ];

    const contenido = [];
    
    metricasData.forEach(metrica => {
        contenido.push({
            text: [
                { text: `${metrica.nombre}: `, bold: true },
                { text: metrica.valor.toFixed(3) },
                { text: ` - ${metrica.descripcion}`, fontSize: 8, color: '#666666' }
            ],
            fontSize: 10,
            margin: [0, 3, 0, 3]
        });
    });

    return contenido;
}
//-------------------------------------------------
// Funciones para distribución de frases por cluster
function crearDistribucionFrasesClusters(interpretacion, datosCompletos) {
    debugEstructuraOrigenPDF(interpretacion);
    const contenido = [];
    
    if (Object.keys(interpretacion).length === 0) {
        contenido.push({
            text: 'No hay datos de frases clasificadas disponibles.',
            fontSize: 10,
            color: '#666666',
            margin: [0, 0, 0, 10]
        });
        return contenido;
    }
    
    // Obtener datos de documentos
    const { archivosDisponibles, textosDisponibles } = obtenerDatosDocumentosPDF(datosCompletos);
    
    console.log("📊 PDFMake - Datos disponibles:", {
        interpretacion: Object.keys(interpretacion).length,
        archivos: archivosDisponibles.length,
        textos: textosDisponibles.length
    });

    // Mostrar lista de clusters con distribución
    Object.entries(interpretacion).forEach(([clusterId, cluster]) => {
        if (!cluster.palabras || !Array.isArray(cluster.palabras)) {
            console.log(`⚠️ Cluster ${clusterId} sin palabras válidas`);
            return;
        }
        
        // Calcular distribución de frases
        const stats = calcularDistribucionFrasesPDF(cluster.palabras);
        
        // Solo mostrar clusters con frases
        if (stats.total === 0) {
            return;
        }
        
        // Header del cluster
        contenido.push(
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: `Cluster ${clusterId} - ${cluster.ideologia || 'No definida'}`,
                            bold: true,
                            color: '#ffffff',
                            fontSize: 10
                        }
                    ]]
                },
                layout: {
                    fillColor: function(rowIndex) {
                        return '#2e5aac';
                    }
                },
                margin: [0, 0, 0, 8]
            }
        );
        
        // Barra de distribución (solo si hay frases)
        if (stats.total > 0) {
            const barras = [];
            
            // Barra izquierda
            if (stats.izquierda > 0) {
                const porcentajeIzq = (stats.izquierda / stats.total) * 100;
                barras.push({
                    text: `Izq: ${stats.izquierda}`,
                    alignment: 'center',
                    fontSize: 10,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#f48b3a',
                    width: `${porcentajeIzq}%`
                });
            }
            
            // Barra derecha
            if (stats.derecha > 0) {
                const porcentajeDer = (stats.derecha / stats.total) * 100;
                barras.push({
                    text: `Der: ${stats.derecha}`,
                    alignment: 'center',
                    fontSize: 10,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#2e5aac',
                    width: `${porcentajeDer}%`
                });
            }
            
            // Barra no político
            if (stats.no_politico > 0) {
                const porcentajeNP = (stats.no_politico / stats.total) * 100;
                barras.push({
                    text: `NP: ${stats.no_politico}`,
                    alignment: 'center',
                    fontSize: 10,
                    bold: true,
                    color: '#ffffff',
                    fillColor: '#808080',
                    width: `${porcentajeNP}%`
                });
            }
            
            if (barras.length > 0) {
                contenido.push({
                    table: {
                        widths: barras.map(barra => barra.width),
                        body: [barras],
                        heights: 12
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 8]
                });
            }
        }
        
        // Estadísticas detalladas
        const porcentajeIzq = stats.total > 0 ? Math.round((stats.izquierda / stats.total) * 100) : 0;
        const porcentajeDer = stats.total > 0 ? Math.round((stats.derecha / stats.total) * 100) : 0;
        const porcentajeNP = stats.total > 0 ? Math.round((stats.no_politico / stats.total) * 100) : 0;
        
        contenido.push({
            text: `Total frases: ${stats.total} | Izquierda: ${stats.izquierda} (${porcentajeIzq}%) | Derecha: ${stats.derecha} (${porcentajeDer}%) | No Político: ${stats.no_politico} (${porcentajeNP}%)`,
            fontSize: 10,
            margin: [0, 0, 0, 5]
        });
        
        // SECCIÓN DE DOCUMENTOS DEL CLUSTER - ACTUALIZADA
        const documentos = obtenerDocumentosDelClusterPDF(cluster, archivosDisponibles, textosDisponibles);
        
        if (documentos.length > 0) {
            contenido.push({
                text: `Documentos del cluster: ${documentos.length}`,
                fontSize: 10,
                bold: true,
                color: '#2e5aac',
                margin: [0, 8, 0, 5]
            });
            
            // Mostrar hasta 5 documentos completos
            const documentosAMostrar = documentos.slice(0, );
            
            documentosAMostrar.forEach((doc, index) => {
                contenido.push({
                    text: `• ${doc}`,
                    fontSize: 10,
                    color: '#444444',
                    margin: [5, 0, 0, 2],
                    lineHeight: 1.2
                });
            });
            
        } else {
            contenido.push({
                text: 'No se encontraron documentos específicos para este cluster',
                fontSize: 6,
                color: '#999999',
                margin: [0, 0, 0, 8],
                italics: true
            });
        }
        
        // Separador entre clusters
        contenido.push({
            canvas: [{ 
                type: 'line', 
                x1: 0, y1: 0, 
                x2: 515, y2: 0, 
                lineWidth: 0.5, 
                lineColor: '#c8c8c8' 
            }],
            margin: [0, 5, 0, 15]
        });
    });
    
    return contenido;
}

// FUNCIÓN PARA OBTENER DATOS DE DOCUMENTOS PARA PDF
function obtenerDatosDocumentosPDF(datos) {
    const nlp = datos.nlp;
    let archivosDisponibles = [];
    let textosDisponibles = [];
    
    // Intentar obtener datos del cache global si existe
    if (typeof documentosCache !== 'undefined' && documentosCache.archivos && documentosCache.archivos.length > 0) {
        console.log("📁 PDFMake - Usando cache global");
        archivosDisponibles = documentosCache.archivos;
        textosDisponibles = documentosCache.textos;
    } else {
        // Si no hay cache, intentar con los datos de nlp
        console.log("📁 PDFMake - Intentando usar datos de nlp");
        const archivosOrigen = nlp.archivos || [];
        const textosCompletos = nlp.textos_completos || [];
        
        try {
            // Parsear archivosOrigen
            if (typeof archivosOrigen === 'string') {
                archivosDisponibles = JSON.parse(archivosOrigen);
            } else if (Array.isArray(archivosOrigen)) {
                archivosDisponibles = archivosOrigen;
            }
            
            // Parsear textosCompletos
            if (typeof textosCompletos === 'string') {
                textosDisponibles = JSON.parse(textosCompletos);
            } else if (Array.isArray(textosCompletos)) {
                textosDisponibles = textosCompletos;
            }
        } catch (error) {
            console.error("❌ PDFMake - Error parsing:", error);
            // Usar datos crudos como fallback
            archivosDisponibles = Array.isArray(archivosOrigen) ? archivosOrigen : [];
            textosDisponibles = Array.isArray(textosCompletos) ? textosCompletos : [];
        }
    }
    
    return { archivosDisponibles, textosDisponibles };
}

// FUNCIÓN CORREGIDA para calcular distribución de frases
function calcularDistribucionFrasesPDF(palabras) {
    const stats = {
        total: palabras.length,
        izquierda: 0,
        derecha: 0,
        no_politico: 0
    };
    
    if (!palabras || !Array.isArray(palabras) || palabras.length === 0) {
        return stats;
    }
    
    console.log("🔍 DEBUG - Primera frase estructura:", {
        tipo: typeof palabras[0],
        esObjeto: typeof palabras[0] === 'object',
        keys: typeof palabras[0] === 'object' ? Object.keys(palabras[0]) : 'no es objeto',
        muestra: palabras[0]
    });
    
    palabras.forEach(fraseInfo => {
        // BASADO EN TU HTML: cada frase tiene propiedad 'prediccion'
        if (typeof fraseInfo === 'object' && fraseInfo.prediccion) {
            const prediccion = fraseInfo.prediccion.toLowerCase();
            
            if (prediccion.includes('izquierda') || prediccion === 'izquierda') {
                stats.izquierda++;
            } else if (prediccion.includes('derecha') || prediccion === 'derecha') {
                stats.derecha++;
            } else if (prediccion.includes('no_politico') || prediccion.includes('no politico') || prediccion === 'neutral') {
                stats.no_politico++;
            } else {
                // Si no coincide con nada, contar como no político
                stats.no_politico++;
            }
        }
        // Si no tiene propiedad prediccion, verificar otras propiedades posibles
        else if (typeof fraseInfo === 'object') {
            // Intentar con otras propiedades comunes
            const posiblesPropiedades = ['ideologia', 'clasificacion', 'label', 'politica', 'tipo'];
            let encontrado = false;
            
            for (const prop of posiblesPropiedades) {
                if (fraseInfo[prop]) {
                    const valor = fraseInfo[prop].toLowerCase();
                    if (valor.includes('izquierda')) {
                        stats.izquierda++;
                        encontrado = true;
                        break;
                    } else if (valor.includes('derecha')) {
                        stats.derecha++;
                        encontrado = true;
                        break;
                    }
                }
            }
            
            // Si no se encontró ninguna propiedad válida, contar como no político
            if (!encontrado) {
                stats.no_politico++;
            }
        }
        // Si es solo string (no debería pasar según tu estructura)
        else if (typeof fraseInfo === 'string') {
            console.warn("⚠️ Frase como string, no se puede determinar ideología:", fraseInfo.substring(0, 50));
            stats.no_politico++;
        }
    });
    
    console.log(`📊 Distribución calculada: Total=${stats.total}, Izq=${stats.izquierda}, Der=${stats.derecha}, NP=${stats.no_politico}`);
    
    return stats;
}

// FUNCIÓN CORREGIDA para obtener documentos del cluster
function obtenerDocumentosDelClusterPDF(cluster, archivosDisponibles, textosDisponibles) {
    const documentosUnicos = new Set();
    
    console.log("🔍 Obteniendo documentos para cluster:", {
        tienePalabras: !!cluster.palabras,
        totalPalabras: cluster.palabras ? cluster.palabras.length : 0
    });
    
    if (cluster.palabras && Array.isArray(cluster.palabras)) {
        cluster.palabras.forEach(palabraInfo => {
            if (palabraInfo.origen && Array.isArray(palabraInfo.origen)) {
                palabraInfo.origen.forEach(origen => {
                    if (origen && typeof origen === 'string') {
                        documentosUnicos.add(origen);
                    }
                });
            }
            // También verificar si hay propiedad 'documento' como fallback
            else if (palabraInfo.documento && typeof palabraInfo.documento === 'string') {
                documentosUnicos.add(palabraInfo.documento);
            }
            // O si hay propiedad 'archivo'
            else if (palabraInfo.archivo && typeof palabraInfo.archivo === 'string') {
                documentosUnicos.add(palabraInfo.archivo);
            }
        });
    }
    
    const documentosArray = Array.from(documentosUnicos);
    
    console.log("📋 Documentos encontrados para cluster:", {
        total: documentosArray.length,
        documentos: documentosArray
    });
    
    return documentosArray;
}

// FUNCIÓN DE DEBUG MEJORADA para verificar la estructura de origen
function debugEstructuraOrigenPDF(interpretacion) {
    console.log("🔍 DEBUG - Estructura de propiedades 'origen':");
    
    Object.entries(interpretacion).forEach(([clusterId, cluster]) => {
        if (cluster.palabras && Array.isArray(cluster.palabras) && cluster.palabras.length > 0) {
            const primeraFrase = cluster.palabras[0];
            console.log(`Cluster ${clusterId}:`, {
                tieneOrigen: 'origen' in primeraFrase,
                tipoOrigen: typeof primeraFrase.origen,
                esArrayOrigen: Array.isArray(primeraFrase.origen),
                valorOrigen: primeraFrase.origen,
                otrasPropiedades: Object.keys(primeraFrase).filter(key => 
                    key.includes('doc') || key.includes('archivo') || key.includes('file')
                )
            });
            
            // Contar frases con origen
            const frasesConOrigen = cluster.palabras.filter(f => 
                f.origen && Array.isArray(f.origen) && f.origen.length > 0
            ).length;
            
            console.log(`  Frases con origen: ${frasesConOrigen}/${cluster.palabras.length}`);
            
            // Mostrar algunos orígenes únicos
            const origenesUnicos = new Set();
            cluster.palabras.forEach(frase => {
                if (frase.origen && Array.isArray(frase.origen)) {
                    frase.origen.forEach(origen => {
                        if (origen) origenesUnicos.add(origen);
                    });
                }
            });
            
            console.log(`  Documentos únicos encontrados:`, Array.from(origenesUnicos).slice(0, 3));
        }
    });
}

//-------------------------------------------------
// Funciones para documentos con frases 
function crearDocumentosCompletosConFrases(interpretacion, datosCompletos) {
    const contenido = [];
    
    if (Object.keys(interpretacion).length === 0) {
        contenido.push({
            text: 'No hay documentos disponibles para mostrar.',
            fontSize: 10,
            color: '#666666',
            margin: [0, 0, 0, 10]
        });
        return contenido;
    }
    
    // Obtener datos de documentos
    const { archivosDisponibles, textosDisponibles } = obtenerDatosDocumentosPDF(datosCompletos);
    
    if (archivosDisponibles.length === 0 || textosDisponibles.length === 0) {
        contenido.push({
            text: 'No se encontraron documentos completos para mostrar.',
            fontSize: 10,
            color: '#666666',
            margin: [0, 0, 0, 10]
        });
        return contenido;
    }
    
    console.log("📚 Procesando documentos completos:", {
        archivos: archivosDisponibles.length,
        textos: textosDisponibles.length
    });
    
    // Obtener todos los documentos únicos de todos los clusters
    const todosDocumentos = obtenerTodosDocumentosUnicos(interpretacion, archivosDisponibles);
    
    console.log("📋 Documentos únicos a procesar:", todosDocumentos.length);
    
    // Procesar cada documento
    todosDocumentos.forEach((documento, docIndex) => {
        const documentoInfo = obtenerInfoDocumento(documento, archivosDisponibles, textosDisponibles);
        
        if (!documentoInfo.textoCompleto) {
            return; // Saltar si no hay texto
        }
        
        // Header del documento
        contenido.push(
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            text: `Documento ${docIndex + 1}: ${documentoInfo.nombre}`,
                            bold: true,
                            color: '#ffffff',
                            fontSize: 10
                        }
                    ]]
                },
                layout: {
                    fillColor: function(rowIndex) {
                        return '#2e5aac';
                    }
                },
                margin: [0, docIndex === 0 ? 0 : 15, 0, 8]
            }
        );
        
        // Información del documento
        const frasesEnDocumento = obtenerFrasesPorDocumento(interpretacion, documentoInfo.nombre);
        const stats = calcularEstadisticasDocumento(frasesEnDocumento);
        
        contenido.push({
            text: [
                { text: 'Estadísticas: ', bold: true },
                `Total frases: ${stats.total} | `,
                { text: `Izquierda: ${stats.izquierda}`, color: '#f48b3a' }, ' | ',
                { text: `Derecha: ${stats.derecha}`, color: '#2e5aac' }, ' | ',
                { text: `No Político: ${stats.no_politico}`, color: '#808080' }
            ],
            fontSize: 10,
            margin: [0, 0, 0, 8]
        });
        
        // Contenido del documento con frases resaltadas
        contenido.push({
            text: 'Contenido del documento:',
            fontSize: 10,
            bold: true,
            color: '#2e5aac',
            margin: [0, 0, 0, 5]
        });
        
        // Texto del documento con frases resaltadas
        const textoFormateado = formatearTextoConFrases(
            documentoInfo.textoCompleto, 
            frasesEnDocumento, 
            interpretacion
        );
        
        contenido.push({
            text: textoFormateado,
            fontSize: 10,
            lineHeight: 1.3,
            margin: [0, 0, 0, 15],
            alignment: 'justify'
        });
        
        // Leyenda de colores
        contenido.push(crearLeyendaColores());
        
        // Separador entre documentos (excepto el último)
        if (docIndex < todosDocumentos.length - 1) {
            contenido.push({
                canvas: [{ 
                    type: 'line', 
                    x1: 0, y1: 0, 
                    x2: 515, y2: 0, 
                    lineWidth: 0.8, 
                    lineColor: '#e0e0e0',
                    dash: { length: 3 }
                }],
                margin: [0, 10, 0, 5]
            });
        }
    });
    
    return contenido;
}

// FUNCIÓN PARA OBTENER TODOS LOS DOCUMENTOS ÚNICOS
function obtenerTodosDocumentosUnicos(interpretacion, archivosDisponibles) {
    const documentosUnicos = new Set();
    
    // Primero, agregar todos los documentos de los clusters
    Object.values(interpretacion).forEach(cluster => {
        const docsCluster = obtenerDocumentosDelClusterPDF(cluster, archivosDisponibles, []);
        docsCluster.forEach(doc => documentosUnicos.add(doc));
    });
    
    // Si no hay documentos en clusters, usar todos los archivos disponibles
    if (documentosUnicos.size === 0) {
        archivosDisponibles.forEach(archivo => {
            if (archivo && typeof archivo === 'string') {
                documentosUnicos.add(archivo);
            }
        });
    }
    
    return Array.from(documentosUnicos);
}

// FUNCIÓN PARA OBTENER INFORMACIÓN DEL DOCUMENTO
function obtenerInfoDocumento(documentoNombre, archivosDisponibles, textosDisponibles) {
    // Buscar documento en archivos disponibles
    const docIndex = archivosDisponibles.findIndex(archivo => 
        archivo === documentoNombre || 
        (archivo && archivo.includes && archivo.includes(documentoNombre))
    );
    
    if (docIndex === -1) {
        console.warn(`⚠️ Documento no encontrado: ${documentoNombre}`);
        return { nombre: documentoNombre, textoCompleto: null };
    }
    
    const textoCompleto = textosDisponibles[docIndex];
    
    return {
        nombre: archivosDisponibles[docIndex],
        textoCompleto: textoCompleto || 'Texto no disponible',
        indice: docIndex
    };
}

// FUNCIÓN PARA OBTENER FRASES POR DOCUMENTO
function obtenerFrasesPorDocumento(interpretacion, documentoNombre) {
    const frasesEnDocumento = [];
    
    Object.entries(interpretacion).forEach(([clusterId, cluster]) => {
        if (cluster.palabras && Array.isArray(cluster.palabras)) {
            cluster.palabras.forEach(fraseInfo => {
                if (fraseInfo.origen && Array.isArray(fraseInfo.origen)) {
                    if (fraseInfo.origen.includes(documentoNombre)) {
                        frasesEnDocumento.push({
                            ...fraseInfo,
                            clusterId: clusterId
                        });
                    }
                }
                // Fallback: si no tiene origen, asumir que pertenece si el documento está en algún cluster
                else if (obtenerDocumentosDelClusterPDF(cluster, [], []).includes(documentoNombre)) {
                    frasesEnDocumento.push({
                        ...fraseInfo,
                        clusterId: clusterId
                    });
                }
            });
        }
    });
    
    // Ordenar por longitud descendente para evitar problemas de superposición
    frasesEnDocumento.sort((a, b) => b.frase.length - a.frase.length);
    
    return frasesEnDocumento;
}

// FUNCIÓN PARA CALCULAR ESTADÍSTICAS DEL DOCUMENTO
function calcularEstadisticasDocumento(frasesEnDocumento) {
    const stats = {
        total: frasesEnDocumento.length,
        izquierda: 0,
        derecha: 0,
        no_politico: 0
    };
    
    frasesEnDocumento.forEach(frase => {
        const prediccion = frase.prediccion ? frase.prediccion.toLowerCase() : 'no_politico';
        
        if (prediccion.includes('izquierda')) {
            stats.izquierda++;
        } else if (prediccion.includes('derecha')) {
            stats.derecha++;
        } else {
            stats.no_politico++;
        }
    });
    
    return stats;
}

/// FUNCIÓN PRINCIPAL PARA FORMATEAR TEXTO CON FRASES RESALTADAS
function formatearTextoConFrases(textoCompleto, frasesEnDocumento, interpretacion) {
    let textoFormateado = [];
    let textoRestante = textoCompleto;
    
    // Si no hay frases, devolver texto normal
    if (frasesEnDocumento.length === 0) {
        return [{ text: textoCompleto, fontSize: 10 }];
    }
    
    // Crear array de segmentos con sus posiciones
    const segmentos = [];
    
    // Primero: identificar todas las frases y sus posiciones
    frasesEnDocumento.forEach((fraseInfo, index) => {
        const frase = fraseInfo.frase;
        const prediccion = fraseInfo.prediccion ? fraseInfo.prediccion.toLowerCase() : 'no_politico';
        const clusterId = fraseInfo.clusterId;
        
        // Buscar todas las ocurrencias de la frase en el texto
        let indice = -1;
        let startIndex = 0;
        
        while ((indice = textoCompleto.indexOf(frase, startIndex)) !== -1) {
            segmentos.push({
                start: indice,
                end: indice + frase.length,
                texto: frase,
                tipo: 'frase',
                prediccion: prediccion,
                clusterId: clusterId
            });
            startIndex = indice + frase.length;
        }
    });
    
    // Ordenar segmentos por posición de inicio
    segmentos.sort((a, b) => a.start - b.start);
    
    // Segundo: procesar el texto por segmentos
    let lastEnd = 0;
    
    segmentos.forEach((segmento, index) => {
        // Texto normal antes de la frase
        if (segmento.start > lastEnd) {
            const textoNormal = textoCompleto.substring(lastEnd, segmento.start);
            if (textoNormal.length > 0) {
                textoFormateado.push({
                    text: textoNormal,
                    fontSize: 10
                });
            }
        }
        
        // Frase resaltada
        let colorFondo, colorTexto;
        
        if (segmento.prediccion.includes('izquierda')) {
            colorFondo = '#f48b3a'; // Naranja
            colorTexto = '#ffffff';
        } else if (segmento.prediccion.includes('derecha')) {
            colorFondo = '#2e5aac'; // Azul
            colorTexto = '#ffffff';
        } else {
            colorFondo = '#808080'; // Gris
            colorTexto = '#ffffff';
        }
        
        // Agregar la frase subrayada
        textoFormateado.push({
            text: segmento.texto,
            fontSize: 10,
            background: colorFondo,
            color: colorTexto,
            bold: true
        });
        
        // Determinar la abreviatura de la predicción
        let abreviaturaPrediccion = 'NP'; // Por defecto: No Político
        if (segmento.prediccion.includes('izquierda')) {
            abreviaturaPrediccion = 'I';
        } else if (segmento.prediccion.includes('derecha')) {
            abreviaturaPrediccion = 'D';
        }
        
        // Agregar la etiqueta del cluster con la clasificación DESPUÉS de la frase
        textoFormateado.push({
            text: `[C${segmento.clusterId}, ${abreviaturaPrediccion}]`,
            fontSize: 10,
            color: '#2e5aac',
            bold: true
        });
        
        lastEnd = segmento.end;
    });
    
    // Texto normal después de la última frase
    if (lastEnd < textoCompleto.length) {
        const textoFinal = textoCompleto.substring(lastEnd);
        if (textoFinal.length > 0) {
            textoFormateado.push({
                text: textoFinal,
                fontSize: 10
            });
        }
    }
    
    return textoFormateado;
}

// FUNCIÓN PARA CREAR LEYENDA DE COLORES
function crearLeyendaColores() {
    return {
        stack: [
            {
                text: 'Leyenda:',
                fontSize: 10,
                bold: true,
                margin: [0, 0, 0, 3]
            },
            {
                columns: [
                    {
                        width: 'auto',
                        stack: [
                            {
                                text: ' ',
                                fontSize: 10,
                                background: '#f48b3a',
                                color: '#ffffff',
                                margin: [0, 1, 3, 1]
                            }
                        ]
                    },
                    {
                        width: '*',
                        text: 'Izquierda [C0...Cn]',
                        fontSize: 10,
                        margin: [0, 0, 10, 0]
                    },
                    {
                        width: 'auto',
                        stack: [
                            {
                                text: ' ',
                                fontSize: 10,
                                background: '#2e5aac',
                                color: '#ffffff',
                                margin: [0, 1, 3, 1]
                            }
                        ]
                    },
                    {
                        width: '*',
                        text: 'Derecha [C0...Cn]',
                        fontSize: 10,
                        margin: [0, 0, 10, 0]
                    },
                    {
                        width: 'auto',
                        stack: [
                            {
                                text: ' ',
                                fontSize: 10,
                                background: '#808080',
                                color: '#ffffff',
                                margin: [0, 1, 3, 1]
                            }
                        ]
                    },
                    {
                        width: '*',
                        text: 'No Político [C0...Cn]',
                        fontSize: 10
                    }
                ],
                margin: [0, 0, 0, 5]
            },
            {
                text: 'Nota: [C0], [C1], etc. indican el cluster al que pertenece la frase',
                fontSize: 10,
                color: '#666666',
                italics: true
            }
        ],
        margin: [0, 10, 0, 0]
    };
}

//Funcion seccion documentos y frases clasificadas
let documentosData = {};
let documentosClusterIds = [];
let currentDocumentosClusterIndex = 0;
let currentIdeologiaFiltro = 'todas';
let currentDocumentoIndex = 0;

const documentosCache = {
    archivos: [],
    textos: [],
    interpretacion: {}
};

function procesarDocumentosClasificados(interpretacion, archivosOrigen, textosCompletos) {
    console.log("🚀 INICIANDO procesarDocumentosClasificados");
    console.log("📊 Parámetros recibidos:", {
        interpretacion: Object.keys(interpretacion || {}).length,
        archivosOrigen: archivosOrigen,
        textosCompletos: textosCompletos?.length
    });

    // CORREGIR: archivosOrigen es un STRING que contiene un array JSON
    let archivosParseados = [];
    try {
        if (typeof archivosOrigen === 'string') {
            console.log("🔧 Parseando archivosOrigen como JSON string...");
            archivosParseados = JSON.parse(archivosOrigen);
        } else if (Array.isArray(archivosOrigen)) {
            archivosParseados = archivosOrigen;
        }
    } catch (error) {
        console.error("❌ Error parseando archivosOrigen:", error);
        // Intentar como array simple si el JSON falla
        archivosParseados = [archivosOrigen].filter(Boolean);
    }

    // CORREGIR: textosCompletos también puede necesitar parsing
    let textosParseados = [];
    try {
        if (typeof textosCompletos === 'string') {
            console.log("🔧 Parseando textosCompletos como JSON string...");
            textosParseados = JSON.parse(textosCompletos);
        } else if (Array.isArray(textosCompletos)) {
            textosParseados = textosCompletos;
        } else {
            textosParseados = [textosCompletos].filter(Boolean);
        }
    } catch (error) {
        console.error("❌ Error parseando textosCompletos:", error);
        textosParseados = [textosCompletos].filter(Boolean);
    }

    console.log("🔧 Datos parseados:", {
        archivosParseados: archivosParseados,
        textosParseados: textosParseados
    });

    // ALMACENAR DATOS PARSEADOS
    documentosCache.interpretacion = interpretacion || {};
    documentosCache.archivos = Array.isArray(archivosParseados) ? archivosParseados : [];
    documentosCache.textos = Array.isArray(textosParseados) ? textosParseados : [];

    console.log("💾 CACHE ACTUALIZADO:", {
        interpretacion: Object.keys(documentosCache.interpretacion).length,
        archivos: documentosCache.archivos.length,
        textos: documentosCache.textos.length,
        archivosLista: documentosCache.archivos,
        textosMuestra: documentosCache.textos.slice(0, 1).map(t => t?.substring(0, 50) + '...')
    });

    const contenedor = document.getElementById("documentos-contenedor-historial");
    const selector = document.getElementById("documentos-cluster-selector");
    const navegacion = document.getElementById("documentos-navegacion");

    // Resetear estados
    currentIdeologiaFiltro = 'todas';
    currentDocumentoIndex = 0;
    currentDocumentosClusterIndex = 0;

    documentosData = documentosCache.interpretacion;
    documentosClusterIds = Object.keys(documentosData);

    // VERIFICACIÓN FINAL
    if (documentosCache.archivos.length === 0) {
        console.error("❌ ERROR: No hay archivos después del parsing");
        contenedor.innerHTML = `
            <div class="documentos-vacio">
                <p>Error: No se pudieron cargar los archivos</p>
                <small>Archivos originales: ${typeof archivosOrigen} - "${archivosOrigen}"</small>
            </div>
        `;
        return;
    }

    if (!interpretacion || documentosClusterIds.length === 0) {
        contenedor.innerHTML = '<div class="documentos-vacio"><p>No hay clusters para mostrar</p></div>';
        return;
    }

    // Configurar selector de clusters
    selector.innerHTML = '<option value="">Todos los clusters</option>';
    documentosClusterIds.forEach(clusterId => {
        const cluster = documentosData[clusterId];
        const option = document.createElement('option');
        option.value = clusterId;
        option.textContent = `Cluster ${clusterId} - ${cluster.ideologia} (${cluster.palabras?.length || 0} frases)`;
        selector.appendChild(option);
    });

    console.log("✅ Selector listo, mostrando primer cluster");
    mostrarDocumentosCluster(documentosClusterIds[0]);
    actualizarNavegacionDocumentos();

    // Event listener para selector
    selector.addEventListener('change', function() {
        const selectedClusterId = this.value;
        if (selectedClusterId) {
            const index = documentosClusterIds.indexOf(selectedClusterId);
            currentDocumentosClusterIndex = index;
            currentDocumentoIndex = 0;
            mostrarDocumentosCluster(selectedClusterId);
            actualizarNavegacionDocumentos();
        } else {
            mostrarTodosLosDocumentos();
        }
    });
}

function mostrarDocumentosCluster(clusterId) {
    console.log("📂 Mostrando cluster:", clusterId);
    console.log("📊 Cache disponible:", {
        archivos: documentosCache.archivos.length,
        textos: documentosCache.textos.length,
        archivosArray: documentosCache.archivos
    });

    const contenedor = document.getElementById("documentos-contenedor-historial");
    const cluster = documentosData[clusterId];

    if (!cluster) {
        contenedor.innerHTML = '<div class="documentos-vacio"><p>Cluster no encontrado</p></div>';
        return;
    }

    // Obtener documentos del cluster
    const documentosCluster = obtenerDocumentosDelCluster(cluster);
    console.log("📋 Documentos en cluster:", documentosCluster);

    if (documentosCluster.length === 0) {
        contenedor.innerHTML = '<div class="documentos-vacio"><p>No hay documentos en este cluster</p></div>';
        return;
    }

    // Mostrar primer documento
    mostrarDocumentoConFrases(documentosCluster[currentDocumentoIndex], cluster, documentosCluster);
}

function obtenerDocumentosDelCluster(cluster) {
    const documentosUnicos = new Set();
    
    if (cluster.palabras && Array.isArray(cluster.palabras)) {
        cluster.palabras.forEach(palabraInfo => {
            if (palabraInfo.origen && Array.isArray(palabraInfo.origen)) {
                palabraInfo.origen.forEach(origen => {
                    documentosUnicos.add(origen);
                });
            }
        });
    }
    
    return Array.from(documentosUnicos);
}

function mostrarDocumentoConFrases(documentoNombre, cluster, todosDocumentosCluster) {
    console.log("📖 Mostrando documento:", documentoNombre);
    console.log("🔍 Buscando en cache archivos:", documentosCache.archivos);
    console.log("🔍 Tipo de archivos:", typeof documentosCache.archivos, Array.isArray(documentosCache.archivos));

    const contenedor = document.getElementById("documentos-contenedor-historial");

    // VERIFICAR QUE archivos ES UN ARRAY
    if (!Array.isArray(documentosCache.archivos)) {
        console.error("❌ ERROR: documentosCache.archivos no es un array:", documentosCache.archivos);
        contenedor.innerHTML = `
            <div class="documentos-vacio">
                <p>Error: Los archivos no están en formato correcto</p>
                <small>Tipo: ${typeof documentosCache.archivos}</small>
            </div>
        `;
        return;
    }

    // BUSCAR DOCUMENTO EN CACHE
    const docIndex = documentosCache.archivos.findIndex(archivo => archivo === documentoNombre);
    console.log("📍 Índice encontrado:", docIndex);

    if (docIndex === -1) {
        console.log("🔍 Búsqueda flexible...");
        // Buscar coincidencia parcial
        const docIndexFlexible = documentosCache.archivos.findIndex(archivo => 
            archivo && archivo.includes && archivo.includes(documentoNombre)
        );
        
        if (docIndexFlexible !== -1) {
            console.log("✅ Encontrado con búsqueda flexible:", docIndexFlexible);
            const textoCompleto = documentosCache.textos[docIndexFlexible];
            procesarYMostrarDocumento(textoCompleto, documentoNombre, cluster, contenedor, todosDocumentosCluster);
            return;
        }
        
        contenedor.innerHTML = `
            <div class="documentos-vacio">
                <p>Documento no encontrado: "${documentoNombre}"</p>
                <small>Disponibles: ${documentosCache.archivos.join(', ')}</small>
            </div>
        `;
        return;
    }

    // OBTENER TEXTO
    const textoCompleto = documentosCache.textos[docIndex];
    console.log("📄 Texto obtenido:", textoCompleto ? `Longitud: ${textoCompleto.length}` : "UNDEFINED");

    if (!textoCompleto) {
        contenedor.innerHTML = '<div class="documentos-vacio"><p>Texto no disponible</p></div>';
        return;
    }

    procesarYMostrarDocumento(textoCompleto, documentoNombre, cluster, contenedor, todosDocumentosCluster);
}

function procesarYMostrarDocumento(textoCompleto, documentoNombre, cluster, contenedor, todosDocumentosCluster) {
    const frasesCluster = cluster.palabras.filter(p => 
        p.origen && p.origen.includes(documentoNombre)
    );

    console.log("🎯 Frases clasificadas:", frasesCluster.length);

    const stats = calcularEstadisticasFrases(frasesCluster);
    
    const html = `
        <div class="documentos-layout">
            <div class="panel-documentos">
                <div class="panel-documentos-header">
                    <div class="documento-header-superior">
                        <h4>${documentoNombre}</h4>
                        ${todosDocumentosCluster.length > 1 ? `
                        ` : ''}
                    </div>
                    <div class="documento-info">
                        <span class="documento-origen">Cluster ${cluster.ideologia}</span>
                        <span>${frasesCluster.length} frases</span>
                        <span>${todosDocumentosCluster.length} docs</span>
                    </div>
                </div>
                <div class="contenedor-texto-documento">
                    <div class="texto-documento">
                        ${resaltarFrasesEnTexto(textoCompleto, frasesCluster, currentIdeologiaFiltro)}
                    </div>
                </div>
            </div>
            
            <div class="panel-controles">
                <div class="controles-header">
                    <h4>Filtrar Frases</h4>
                    <p>Resaltar por ideología</p>
                </div>
                
                <div class="botones-ideologia">
                    <button class="btn-ideologia izquierda ${currentIdeologiaFiltro === 'izquierda' ? 'activo' : ''}" 
                            onclick="filtrarFrases('izquierda')">
                        <i class="fas fa-hand-point-left"></i>
                        Izquierda (${stats.izquierda})
                    </button>
                    
                    <button class="btn-ideologia derecha ${currentIdeologiaFiltro === 'derecha' ? 'activo' : ''}" 
                            onclick="filtrarFrases('derecha')">
                        <i class="fas fa-hand-point-right"></i>
                        Derecha (${stats.derecha})
                    </button>
                    
                    <button class="btn-ideologia no_politico ${currentIdeologiaFiltro === 'no_politico' ? 'activo' : ''}" 
                            onclick="filtrarFrases('no_politico')">
                        <i class="fas fa-ban"></i>
                        No Político (${stats.no_politico})
                    </button>
                    
                    <button class="btn-ideologia neutral ${currentIdeologiaFiltro === 'todas' ? 'activo' : ''}" 
                            onclick="filtrarFrases('todas')">
                        <i class="fas fa-eye"></i>
                        Todas (${stats.total})
                    </button>
                </div>
                
                <div class="estadisticas-ideologia">
                    <h5>Distribución</h5>
                    <div class="estadistica-item">
                        <span class="estadistica-ideologia">
                            <span class="estadistica-color izquierda"></span>
                            Izquierda
                        </span>
                        <span class="estadistica-cantidad">${stats.izquierda}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-ideologia">
                            <span class="estadistica-color derecha"></span>
                            Derecha
                        </span>
                        <span class="estadistica-cantidad">${stats.derecha}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-ideologia">
                            <span class="estadistica-color no_politico"></span>
                            No Político
                        </span>
                        <span class="estadistica-cantidad">${stats.no_politico}</span>
                    </div>
                    <div class="estadistica-item">
                        <span class="estadistica-ideologia">
                            <span class="estadistica-color neutral"></span>
                            Total
                        </span>
                        <span class="estadistica-cantidad">${stats.total}</span>
                    </div>
                </div>

                ${todosDocumentosCluster.length > 1 ? `
                <div class="lista-documentos-cluster">
                    <h5>Documentos del Cluster</h5>
                    <div class="documentos-lista">
                        ${todosDocumentosCluster.map((doc, index) => `
                            <div class="documento-item ${index === currentDocumentoIndex ? 'activo' : ''}" 
                                 onclick="seleccionarDocumento(${index})">
                                <i class="fas fa-file-alt"></i>
                                <span class="doc-nombre">${doc.substring(0, 40)}${doc.length > 40 ? '...' : ''}</span>
                                <span class="doc-indicador">${index + 1}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
    console.log("✅ Documento mostrado correctamente");
}
// Funciones auxiliares (mantener igual)
function resaltarFrasesEnTexto(textoCompleto, frasesCluster, filtro) {
    let textoResaltado = textoCompleto;
    const frasesOrdenadas = [...frasesCluster].sort((a, b) => b.frase.length - a.frase.length);
    
    function escaparRegex(texto) {
        return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    frasesOrdenadas.forEach(fraseInfo => {
        const frase = fraseInfo.frase;
        const prediccion = fraseInfo.prediccion || 'neutral';
        
        if (filtro === 'todas' || filtro === prediccion) {
            const spanClass = `frase-resaltada ${prediccion}`;
            const fraseEscapada = escaparRegex(frase);
            
            try {
                const regex = new RegExp(fraseEscapada, 'g');
                textoResaltado = textoResaltado.replace(regex, `<span class="${spanClass}">${frase}</span>`);
            } catch (error) {
                console.warn(`No se pudo resaltar: "${frase.substring(0, 30)}..."`);
            }
        }
    });
    
    return textoResaltado;
}

function calcularEstadisticasFrases(frasesCluster) {
    const stats = { izquierda: 0, derecha: 0, no_politico: 0, neutral: 0, total: frasesCluster.length };
    frasesCluster.forEach(fraseInfo => {
        const prediccion = fraseInfo.prediccion || 'neutral';
        if (stats.hasOwnProperty(prediccion)) stats[prediccion]++;
        else stats.neutral++;
    });
    return stats;
}

function filtrarFrases(ideologia) {
    currentIdeologiaFiltro = ideologia;
    const clusterId = documentosClusterIds[currentDocumentosClusterIndex];
    const cluster = documentosData[clusterId];
    const documentos = obtenerDocumentosDelCluster(cluster);
    if (documentos.length > 0) {
        mostrarDocumentoConFrases(documentos[currentDocumentoIndex], cluster, documentos);
    }
}

function navegarDocumento(direccion) {
    const clusterId = documentosClusterIds[currentDocumentosClusterIndex];
    const cluster = documentosData[clusterId];
    const documentos = obtenerDocumentosDelCluster(cluster);
    
    if (direccion === 'anterior' && currentDocumentoIndex > 0) {
        currentDocumentoIndex--;
    } else if (direccion === 'siguiente' && currentDocumentoIndex < documentos.length - 1) {
        currentDocumentoIndex++;
    }
    
    if (documentos.length > 0) {
        mostrarDocumentoConFrases(documentos[currentDocumentoIndex], cluster, documentos);
    }
}

function seleccionarDocumento(index) {
    currentDocumentoIndex = index;
    const clusterId = documentosClusterIds[currentDocumentosClusterIndex];
    const cluster = documentosData[clusterId];
    const documentos = obtenerDocumentosDelCluster(cluster);
    if (documentos.length > 0) {
        mostrarDocumentoConFrases(documentos[currentDocumentoIndex], cluster, documentos);
    }
}

function navegarClusterDocumentos(direccion) {
    if (direccion === 'anterior' && currentDocumentosClusterIndex > 0) {
        currentDocumentosClusterIndex--;
    } else if (direccion === 'siguiente' && currentDocumentosClusterIndex < documentosClusterIds.length - 1) {
        currentDocumentosClusterIndex++;
    }
    
    currentDocumentoIndex = 0;
    const clusterId = documentosClusterIds[currentDocumentosClusterIndex];
    const selector = document.getElementById("documentos-cluster-selector");
    selector.value = clusterId;
    mostrarDocumentosCluster(clusterId);
    actualizarNavegacionDocumentos();
}

function actualizarNavegacionDocumentos() {
    const navegacion = document.getElementById("documentos-navegacion");
    if (documentosClusterIds.length <= 1) {
        navegacion.style.display = 'none';
        return;
    }
    
    navegacion.style.display = 'flex';
    const navInfo = navegacion.querySelector('.cluster-nav-info');
    const btnAnterior = navegacion.querySelector('.btn-anterior-doc');
    const btnSiguiente = navegacion.querySelector('.btn-siguiente-doc');
    
    navInfo.textContent = `Cluster ${currentDocumentosClusterIndex + 1} de ${documentosClusterIds.length}`;
    btnAnterior.disabled = currentDocumentosClusterIndex === 0;
    btnSiguiente.disabled = currentDocumentosClusterIndex === documentosClusterIds.length - 1;
}

function mostrarTodosLosDocumentos() {
    const contenedor = document.getElementById("documentos-contenedor-historial");
    contenedor.innerHTML = '<div class="documentos-vacio"><p>Selecciona un cluster</p></div>';
}