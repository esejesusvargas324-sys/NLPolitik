//Mostrar y ocultar elmentos del menu para el inicio y cierre de sesión
document.addEventListener('DOMContentLoaded', () => {
  const logueado = document.body.dataset.logueado;

  const menuPrivado = document.getElementById('menu-privado');
  const botonConfigurar = document.querySelector('.boton-configurar-cuenta');

  if (menuPrivado) {
    menuPrivado.style.display = logueado === 'true' ? 'block' : 'none';
  }

  if (botonConfigurar) {
    botonConfigurar.style.display = logueado === 'true' ? 'block' : 'none';
  }
});


// Script para controlar la visibilidad de botones iniciales
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const botonProbar = document.getElementById('boton-probar');
    const botonAnalizar = document.getElementById('boton-analizar');
    const urlsConfig = document.getElementById('urls-config');
    
    // Obtener las URLs desde el div de configuración
    const urlLogin = urlsConfig.getAttribute('data-login');
    const urlAgrupamiento = urlsConfig.getAttribute('data-agrupamiento');
    
    const estaLogueado = body.getAttribute('data-logueado') === 'true';
    
    // Configurar visibilidad según el estado de login
    if (estaLogueado) {
        botonProbar.style.display = 'none';
        botonAnalizar.style.display = 'inline-block';
    } else {
        botonProbar.style.display = 'inline-block';
        botonAnalizar.style.display = 'none';
    }
    
    // Event listener para "Probar Ahora"
    botonProbar.addEventListener('click', function() {
        console.log('Redirigiendo a:', urlLogin); // Para debug
        window.location.href = urlLogin;
    });
    
    // Event listener para "Comenzar Análisis"
    botonAnalizar.addEventListener('click', function() {
        console.log('Redirigiendo a:', urlAgrupamiento); // Para debug
        window.location.href = urlAgrupamiento;
    });
});

//Cambiar los botones de inicio y cierre de sesion
document.addEventListener('DOMContentLoaded', () => {
  const estado = document.body.dataset.logueado;

  const botonLogin = document.querySelector(".boton-iniciar-sesion");
  const botonLogout = document.querySelector(".boton-cerrar-sesion");

  if (estado === "true") {
    botonLogin.style.display = "none";
    botonLogout.style.display = "block";
  } else {
    botonLogin.style.display = "block";
    botonLogout.style.display = "none";
  }
});
//Funcion para controlar la confirmacion de cierre de sesión
const cerrarSesion = document.getElementById("enlace-cerrar-sesion");

cerrarSesion.addEventListener("click", (e) => {
  e.preventDefault();

  const urlCerrarSesion = cerrarSesion.dataset.url;

  mostrarConfirmacion(
    "¿Cerrar sesión?",
    "¿Estás seguro de que deseas cerrar sesión?",
    () => {
      window.location.href = urlCerrarSesion;
    },
    () => {
      mostrarNotificacion("error", "Cancelado", "La sesión continúa activa.");
    }
  );
});


// Script para animar la tubería de procesamiento de NLPolitik
const pasosTuberia = [
    {
        titulo: "Carga y Extracción de Contexto",
        descripcion: "Documentos políticos son procesados y se extraen frases contextuales clave",
        contenido: `
            <div class="visualizacion-contenida">
                <div class="contenido-animado">
                    <!-- Documento a la izquierda -->
                    <div class="seccion-documento">
                        <div class="documento-carga">
                            <i class="fas fa-file-alt"></i>
                            <div class="info-documento">
                                <div class="nombre-archivo-animacion">analisis.pdf</div>
                                <div class="estado">Procesando...</div>
                            </div>
                            <div class="progreso">
                                <div class="barra-progreso"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Texto a la derecha -->
                    <div class="seccion-texto">
                        <div class="texto-analisis">
                            <div class="contenido-textual">
                                La <span class="frase-contexto" data-frase="intervención estatal">intervención estatal</span> en economía es necesaria para 
                                <span class="frase-contexto" data-frase="corregir fallos del mercado">corregir fallos del mercado</span> y 
                                <span class="frase-contexto" data-frase="garantizar justicia social">garantizar justicia social</span> mediante políticas redistributivas.
                            </div>
                        </div>
                        <div class="contador-contexto">
                            <span class="contador">0</span> frases contextuales detectadas
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        titulo: "Vectorización con BERT",
        descripcion: "Las frases se convierten en embeddings densos representados como vectores numéricos",
        contenido: `
            <div class="visualizacion-bert">
                <div class="contenido-vectorizacion">
                    <!-- Lado izquierdo: Frases -->
                    <div class="lado-frases">
                        <div class="lista-frases">
                            <div class="frase-item-animacion" data-frase="intervención estatal">
                                <span class="texto-frase">intervención estatal</span>
                            </div>
                            <div class="frase-item-animacion" data-frase="corregir fallos mercado">
                                <span class="texto-frase">corregir fallos mercado</span>
                            </div>
                            <div class="frase-item-animacion" data-frase="garantizar justicia social">
                                <span class="texto-frase">garantizar justicia social</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Lado derecho: Matriz 5x5 -->
                    <div class="lado-matriz">
                        <div class="matriz-embeddings" id="matriz-embeddings">
                            <!-- Matriz 5x5 se genera dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        titulo: "Reducción Dimensional con Autoencoder", 
        descripcion: "Compresión inteligente que preserva las características semánticas más importantes",
        contenido: `
            <div class="visualizacion-autoencoder">
                <div class="contenido-autoencoder">
                    <!-- Matriz original 5x5 -->
                    <div class="matriz-original">
                        <div class="matriz-5x5" id="matriz-original"></div>
                    </div>
                    
                    <!-- Filtro de compresión -->
                    <div class="filtro-compresion">
                        <div class="icono-filtro">
                            <i class="fas fa-filter"></i>
                        </div>
                        <div class="puntos-procesando" id="puntos-procesando"></div>
                    </div>
                    
                    <!-- Matriz reducida 3x3 -->
                    <div class="matriz-reducida">
                        <div class="matriz-3x3" id="matriz-reducida"></div>
                    </div>
                </div>
            </div>
        `
    },
    {
        titulo: "Agrupamiento de Patrones",
        descripcion: "Clustering identifica grupos naturales de discursos con patrones similares",
        contenido: `
            <div class="visualizacion-clustering">
                <div class="contenido-clustering">
                    <div class="plano-cartesiano" id="plano-cartesiano">
                        <!-- Los puntos se generarán dinámicamente -->
                    </div>
                </div>
            </div>
        `
    },
    {
        titulo: "Clasificación Ideológica con SVM",
        descripcion: "Modelo entrenado con MARPOR clasifica cada grupo como izquierda o derecha", 
        contenido: `
            <div class="visualizacion-svm">
                <div class="contenido-svm">
                    <!-- Lado izquierdo: Gráfica simple -->
                    <div class="grafica-simple">
                        <div class="barra-izq-svm" id="barra-izq-svm"></div>
                        <div class="barra-der-svm" id="barra-der-svm"></div>
                    </div>
                    
                    <!-- Lado derecho: Porcentajes -->
                    <div class="porcentajes-svm">
                        <div class="porcentaje-izq">
                            <div class="numero" id="num-izq">0%</div>
                            <div class="etiqueta">Izquierda</div>
                        </div>
                        <div class="porcentaje-der">
                            <div class="numero" id="num-der">0%</div>
                            <div class="etiqueta">Derecha</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    {
        titulo: "Análisis de Temas Económicos con LDA (PLDA)",
        descripcion: "Identificación de prominencia de temas económicos en el discurso",
        contenido: `
            <div class="visualizacion-lda">
                <div class="contenido-lda">
                    <!-- Lado izquierdo: Gráfica -->
                    <div class="grafica-temas">
                        <div class="barra-economia-izq" id="barra-eco-izq"></div>
                        <div class="barra-economia-der" id="barra-eco-der"></div>
                        <div class="barra-mixto" id="barra-mixto"></div>
                    </div>
                    
                    <!-- Lado derecho: Porcentajes -->
                    <div class="porcentajes-temas">
                        <div class="porcentaje-eco-izq">
                            <div class="numero" id="num-eco-izq">0%</div>
                            <div class="etiqueta">Econ. Izquierda</div>
                        </div>
                        <div class="porcentaje-eco-der">
                            <div class="numero" id="num-eco-der">0%</div>
                            <div class="etiqueta">Econ. Derecha</div>
                        </div>
                        <div class="porcentaje-mixto">
                            <div class="numero" id="num-mixto">0%</div>
                            <div class="etiqueta">Mixto</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
];

// Funciones de animación separadas
const animaciones = {
    paso0: function(container) {
    const timeline = anime.timeline();
    const frases = container.querySelectorAll('.frase-contexto');
    const barraProgreso = container.querySelector('.barra-progreso');
    const contador = container.querySelector('.contador');
    const estado = container.querySelector('.estado');
    
    timeline
        // Animación inicial simultánea de ambas secciones
        .add({
            targets: [container.querySelector('.seccion-documento'), container.querySelector('.seccion-texto')],
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 800,
            easing: 'easeOutBack',
            delay: anime.stagger(100)
        })
        
        // Barra de progreso del documento
        .add({
            targets: barraProgreso,
            width: ['0%', '100%'],
            duration: 1200,
            easing: 'easeInOutQuart'
        })
        
        // Destacar frases en el texto
        .add({
            targets: frases,
            backgroundColor: [
                'rgba(244, 139, 58, 0)',
                'rgba(244, 139, 58, 0.25)'
            ],
            color: [
                'var(--color-texto)',
                'var(--color-acento-oscuro)'
            ],
            borderBottom: [
                '1px solid transparent',
                '2px solid var(--color-acento)'
            ],
            padding: ['1px 2px', '2px 6px'],
            borderRadius: ['2px', '4px'],
            delay: anime.stagger(500),
            duration: 600,
            easing: 'easeOutQuart',
            begin: function() {
                estado.textContent = 'Extrayendo contexto...';
            },
            update: function(anim) {
                // Actualizar contador en tiempo real
                const progress = anim.progress;
                const frasesCompletadas = Math.floor((progress / 100) * frases.length);
                contador.textContent = frasesCompletadas;
            }
        })
        
        // Efecto final
        .add({
            targets: estado,
            innerHTML: ['Extrayendo contexto...', 'Completado ✓'],
            color: ['var(--color-texto)', 'var(--color-acento)'],
            duration: 400,
            easing: 'easeOutSine'
        });
    },
    paso1: function(container) {
        // Generar matriz 5x5
        const matrizContainer = container.querySelector('#matriz-embeddings');
        matrizContainer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const fila = document.createElement('div');
            fila.className = 'fila-matriz';
            for (let j = 0; j < 5; j++) {
                const punto = document.createElement('div');
                punto.className = 'punto-vector';
                // Valor aleatorio para simular embedding
                const valor = Math.random() * 0.8 + 0.2;
                punto.style.opacity = valor;
                fila.appendChild(punto);
            }
            matrizContainer.appendChild(fila);
        }
        
        const timeline = anime.timeline();
        const frases = container.querySelectorAll('.frase-item');
        const puntos = container.querySelectorAll('.punto-vector');
        
        timeline
            // Las frases aparecen
            .add({
                targets: frases,
                translateX: [-30, 0],
                opacity: [0, 1],
                scale: [0.8, 1],
                delay: anime.stagger(200),
                duration: 600,
                easing: 'easeOutBack'
            })
            
            // Las frases se "transforman" y activan la matriz
            .add({
                targets: frases,
                backgroundColor: ['rgba(255,255,255,1)', 'rgba(77,130,236,0.2)'],
                duration: 400,
                delay: anime.stagger(150)
            })
            
            // La matriz aparece desde el centro
            .add({
                targets: puntos,
                opacity: [0, (el) => el.style.opacity],
                scale: [0, 1],
                delay: anime.stagger(30, {
                    grid: [5, 5],
                    from: 'center'
                }),
                duration: 800,
                easing: 'easeOutBack'
            })
            
            // Efecto de pulso en la matriz
            .add({
                targets: puntos,
                scale: [1, 1.1, 1],
                duration: 400,
                delay: anime.stagger(10, {
                    grid: [5, 5],
                    from: 'first'
                }),
                easing: 'easeInOutSine'
            });
    },
    paso2: function(container) {
    // Generar matriz original 5x5
    const matrizOriginal = container.querySelector('#matriz-original');
    matrizOriginal.innerHTML = '';
    const puntosOriginales = [];
    
    for (let i = 0; i < 5; i++) {
        const fila = document.createElement('div');
        fila.className = 'fila-5x5';
        for (let j = 0; j < 5; j++) {
            const punto = document.createElement('div');
            punto.className = 'punto-original';
            const valor = Math.random() * 0.7 + 0.3;
            punto.style.opacity = valor;
            punto.setAttribute('data-valor', valor);
            fila.appendChild(punto);
            puntosOriginales.push(punto);
        }
        matrizOriginal.appendChild(fila);
    }
    
    // Generar matriz reducida 3x3
    const matrizReducida = container.querySelector('#matriz-reducida');
    matrizReducida.innerHTML = '';
    const puntosReducidos = [];
    
    for (let i = 0; i < 3; i++) {
        const fila = document.createElement('div');
        fila.className = 'fila-3x3';
        for (let j = 0; j < 3; j++) {
            const punto = document.createElement('div');
            punto.className = 'punto-reducido';
            punto.style.opacity = 0;
            fila.appendChild(punto);
            puntosReducidos.push(punto);
        }
        matrizReducida.appendChild(fila);
    }
    
    const filtro = container.querySelector('#puntos-procesando');
    const iconoFiltro = container.querySelector('.icono-filtro');
    
    const timeline = anime.timeline();
    
    timeline
        // Mostrar matriz original
        .add({
            targets: puntosOriginales,
            opacity: [0, (el) => el.style.opacity],
            scale: [0, 1],
            delay: anime.stagger(40, {
                grid: [5, 5],
                from: 'center'
            }),
            duration: 500,
            easing: 'easeOutBack'
        })
        
        // Mostrar icono del filtro
        .add({
            targets: iconoFiltro,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        })
        
        // Los puntos viajan hacia el filtro uno por uno
        .add({
            targets: puntosOriginales,
            translateX: [0, 50],
            opacity: [1, 0.3],
            scale: [1, 0.6],
            duration: 400,
            delay: anime.stagger(60, {from: 'first'}),
            change: function(anim) {
                // Cuando cada punto llega al filtro, crear efecto de procesamiento
                const index = Math.floor(anim.progress / (100 / puntosOriginales.length));
                if (index < puntosOriginales.length) {
                    const punto = puntosOriginales[index];
                    const puntoFiltro = document.createElement('div');
                    puntoFiltro.className = 'punto-filtro';
                    puntoFiltro.style.backgroundColor = punto.style.backgroundColor;
                    filtro.appendChild(puntoFiltro);
                    
                    anime({
                        targets: puntoFiltro,
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        duration: 300,
                        easing: 'easeInOutSine',
                        complete: function() {
                            puntoFiltro.remove();
                        }
                    });
                }
            }
        })
        
        // Aparece la matriz reducida
        .add({
            targets: puntosReducidos,
            opacity: [0, 1],
            scale: [0, 1.2, 1],
            backgroundColor: (el, i) => {
                // Los puntos reducidos tienen valores promediados de los originales
                const valorBase = 0.6 + (i * 0.1);
                return `rgba(77, 130, 236, ${Math.min(valorBase, 0.9)})`;
            },
            delay: anime.stagger(150, {
                grid: [3, 3],
                from: 'center'
            }),
            duration: 600,
            easing: 'easeOutBack'
        })
        
        // Efecto de "conservación de información"
        .add({
            targets: puntosReducidos,
            scale: [1, 1.15, 1],
            boxShadow: [
                '0 0 0px rgba(77, 130, 236, 0)',
                '0 0 15px rgba(77, 130, 236, 0.7)',
                '0 0 0px rgba(77, 130, 236, 0)'
            ],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeInOutSine'
        });
    },
    paso3: function(container) {
    const plano = container.querySelector('#plano-cartesiano');
    plano.innerHTML = '';
    
    // Crear 3 clusters con puntos de diferentes colores
    const clusters = [
        { color: '#f48b3a', cantidad: 8, centro: { x: 25, y: 25 } }, // Naranja - Izquierda
        { color: '#27447d', cantidad: 8, centro: { x: 75, y: 75 } }, // Azul - Derecha  
        { color: '#894d1f', cantidad: 6, centro: { x: 50, y: 50 } }  // Verde - Centro
    ];
    
    const todosLosPuntos = [];
    
    clusters.forEach((cluster, clusterIndex) => {
        for (let i = 0; i < cluster.cantidad; i++) {
            const punto = document.createElement('div');
            punto.className = 'punto-cluster';
            
            // Posición aleatoria alrededor del centro del cluster
            const dispersion = 15;
            const x = cluster.centro.x + (Math.random() - 0.5) * dispersion;
            const y = cluster.centro.y + (Math.random() - 0.5) * dispersion;
            
            punto.style.left = `${x}%`;
            punto.style.top = `${y}%`;
            punto.style.backgroundColor = cluster.color;
            punto.style.opacity = '0';
            punto.style.transform = 'scale(0)';
            
            plano.appendChild(punto);
            todosLosPuntos.push(punto);
        }
    });
    
    const timeline = anime.timeline();
    
    timeline
        // Los puntos aparecen gradualmente
        .add({
            targets: todosLosPuntos,
            opacity: [0, 1],
            scale: [0, 1],
            delay: anime.stagger(30, {from: 'first'}),
            duration: 600,
            easing: 'easeOutBack'
        })
        
        // Los puntos se mueven ligeramente para mostrar que son grupos naturales
        .add({
            targets: todosLosPuntos,
            translateX: () => anime.random(-5, 5),
            translateY: () => anime.random(-5, 5),
            duration: 800,
            delay: anime.stagger(20),
            easing: 'easeInOutSine'
        })
        
        // Efecto de "agrupamiento" - los puntos se acercan a sus centros
        .add({
            targets: todosLosPuntos,
            translateX: 0,
            translateY: 0,
            duration: 600,
            delay: anime.stagger(10),
            easing: 'easeOutCirc'
        })
        
        // Resaltar los clusters con efectos de pulso
        .add({
            targets: todosLosPuntos,
            scale: [1, 1.2, 1],
            boxShadow: [
                '0 0 0px rgba(0,0,0,0)',
                (el) => `0 0 12px ${el.style.backgroundColor}`,
                '0 0 0px rgba(0,0,0,0)'
            ],
            duration: 800,
            delay: anime.stagger(30, {from: 'center'}),
            easing: 'easeInOutSine'
        })
        
        // Efecto final: mostrar áreas de influencia de los clusters
        .add({
            targets: '.punto-cluster',
            border: ['0px solid transparent', '2px solid rgba(255,255,255,0.8)'],
            duration: 400,
            delay: anime.stagger(20),
            easing: 'easeOutSine'
        });
    },
    paso4: function(container) {
    const barraIzq = container.querySelector('#barra-izq-svm');
    const barraDer = container.querySelector('#barra-der-svm');
    const numIzq = container.querySelector('#num-izq');
    const numDer = container.querySelector('#num-der');
    
    const resultadoIzquierda = 78;
    const resultadoDerecha = 22;
    
    const timeline = anime.timeline();
    
    timeline
        // Barras crecen simultáneamente
        .add({
            targets: [barraIzq, barraDer],
            width: ['0%', (el) => {
                if (el.id === 'barra-izq-svm') return `${resultadoIzquierda}%`;
                return `${resultadoDerecha}%`;
            }],
            duration: 1000,
            easing: 'easeOutQuart',
            delay: anime.stagger(100)
        })
        
        // Números se actualizan
        .add({
            targets: numIzq,
            innerHTML: [0, resultadoIzquierda],
            round: 1,
            duration: 800,
            easing: 'easeOutQuart',
            update: function(anim) {
                numIzq.textContent = Math.floor(anim.progress * resultadoIzquierda / 100) + '%';
            }
        })
        .add({
            targets: numDer,
            innerHTML: [0, resultadoDerecha],
            round: 1,
            duration: 800,
            easing: 'easeOutQuart',
            update: function(anim) {
                numDer.textContent = Math.floor(anim.progress * resultadoDerecha / 100) + '%';
            }
        }, '-=800')
        
        // Efecto final
        .add({
            targets: [numIzq, numDer],
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeInOutSine'
        });
    },
    paso5: function(container) {
    const barraEcoIzq = container.querySelector('#barra-eco-izq');
    const barraEcoDer = container.querySelector('#barra-eco-der');
    const barraMixto = container.querySelector('#barra-mixto');
    const numEcoIzq = container.querySelector('#num-eco-izq');
    const numEcoDer = container.querySelector('#num-eco-der');
    const numMixto = container.querySelector('#num-mixto');
    
    // Valores simulados para temas económicos
    const economiaIzquierda = 45;
    const economiaDerecha = 30;
    const mixto = 25;
    
    const timeline = anime.timeline();
    
    timeline
        // Barras crecen
        .add({
            targets: [barraEcoIzq, barraEcoDer, barraMixto],
            width: ['0%', (el) => {
                if (el.id === 'barra-eco-izq') return `${economiaIzquierda}%`;
                if (el.id === 'barra-eco-der') return `${economiaDerecha}%`;
                return `${mixto}%`;
            }],
            duration: 1000,
            easing: 'easeOutQuart',
            delay: anime.stagger(100)
        })
        
        // Números se actualizan
        .add({
            targets: numEcoIzq,
            innerHTML: [0, economiaIzquierda],
            round: 1,
            duration: 800,
            easing: 'easeOutQuart',
            update: function(anim) {
                numEcoIzq.textContent = Math.floor(anim.progress * economiaIzquierda / 100) + '%';
            }
        })
        .add({
            targets: numEcoDer,
            innerHTML: [0, economiaDerecha],
            round: 1,
            duration: 800,
            easing: 'easeOutQuart', 
            update: function(anim) {
                numEcoDer.textContent = Math.floor(anim.progress * economiaDerecha / 100) + '%';
            }
        }, '-=800')
        .add({
            targets: numMixto,
            innerHTML: [0, mixto],
            round: 1,
            duration: 800,
            easing: 'easeOutQuart',
            update: function(anim) {
                numMixto.textContent = Math.floor(anim.progress * mixto / 100) + '%';
            }
        }, '-=800')
        
        // Efecto final
        .add({
            targets: [numEcoIzq, numEcoDer, numMixto],
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeInOutSine'
        });
    }
};
// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const contenidoVisualizacion = document.getElementById('contenido-visualizacion');
    const tituloPaso = document.getElementById('titulo-paso');
    const descripcionPaso = document.getElementById('descripcion-paso');
    const barraProgreso = document.getElementById('barra-progreso-tuberia');
    const botonAnterior = document.getElementById('boton-anterior');
    const botonSiguiente = document.getElementById('boton-siguiente');
    const indicadoresContainer = document.querySelector('.indicadores-pasos');
    
    let pasoActual = 0;
    
    // Crear indicadores de pasos
    pasosTuberia.forEach((_, index) => {
        const indicador = document.createElement('div');
        indicador.classList.add('indicador-paso');
        if (index === 0) indicador.classList.add('activo');
        indicador.addEventListener('click', () => {
            cambiarPaso(index);
        });
        indicadoresContainer.appendChild(indicador);
    });
    
    // Función para cambiar paso
    function cambiarPaso(nuevoPaso) {
        pasoActual = nuevoPaso;
        
        // Actualizar contenido
        contenidoVisualizacion.innerHTML = pasosTuberia[pasoActual].contenido;
        tituloPaso.textContent = pasosTuberia[pasoActual].titulo;
        descripcionPaso.textContent = pasosTuberia[pasoActual].descripcion;
        
        // Actualizar barra de progreso
        barraProgreso.style.width = `${(pasoActual + 1) * (100 / pasosTuberia.length)}%`;
        
        // Actualizar botones
        botonAnterior.disabled = pasoActual === 0;
        botonSiguiente.disabled = pasoActual === pasosTuberia.length - 1;
        
        // Actualizar indicadores
        document.querySelectorAll('.indicador-paso').forEach((indicador, index) => {
            if (index === pasoActual) {
                indicador.classList.add('activo');
            } else {
                indicador.classList.remove('activo');
            }
        });
        
        // Ejecutar animación después de un pequeño delay
        setTimeout(() => {
            const animacionFunc = animaciones['paso' + pasoActual];
            if (animacionFunc && typeof anime !== 'undefined') {
                animacionFunc(contenidoVisualizacion);
            }
        }, 100);
    }
    
    // Event listeners para botones
    botonAnterior.addEventListener('click', () => {
        if (pasoActual > 0) {
            cambiarPaso(pasoActual - 1);
        }
    });
    
    botonSiguiente.addEventListener('click', () => {
        if (pasoActual < pasosTuberia.length - 1) {
            cambiarPaso(pasoActual + 1);
        }
    });
    
    // Iniciar
    cambiarPaso(0);
    
    // Cambio automático cada 5 segundos
    setInterval(() => {
        if (pasoActual < pasosTuberia.length - 1) {
            cambiarPaso(pasoActual + 1);
        } else {
            cambiarPaso(0);
        }
    }, 5000);
});

//Funcion para pasar en elnaces
document.addEventListener('DOMContentLoaded', function() {
// Función para scroll suave
function scrollSuave(hash) {
    const target = document.querySelector(hash);
    if (target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - 80; // Ajuste para el header fijo
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Manejar clics en enlaces de navegación
document.querySelectorAll('.enlaces-inicio a').forEach(enlace => {
    enlace.addEventListener('click', function(e) {
        e.preventDefault();
        
        const hash = this.getAttribute('href');
        
        // Actualizar clase activa
        document.querySelectorAll('.enlaces-inicio a').forEach(a => {
            a.classList.remove('activo');
        });
        this.classList.add('activo');
        
        // Scroll suave a la sección
        scrollSuave(hash);
        
        // Actualizar URL
        history.pushState(null, null, hash);
    });
});

// Actualizar enlace activo al hacer scroll
function actualizarEnlaceActivo() {
    const secciones = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.enlaces-navegacion a');
    
    let seccionActual = '';
    
    secciones.forEach(seccion => {
        const rect = seccion.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            seccionActual = '#' + seccion.id;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('activo');
        if (link.getAttribute('href') === seccionActual) {
            link.classList.add('activo');
        }
    });
}

// Ejecutar al cargar y al hacer scroll
window.addEventListener('scroll', actualizarEnlaceActivo);
window.addEventListener('load', actualizarEnlaceActivo);

// Manejar la carga inicial con hash en la URL
if (window.location.hash) {
    setTimeout(() => {
        scrollSuave(window.location.hash);
    }, 100);
}
});