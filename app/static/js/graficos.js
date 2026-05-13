// Variables globales para gestión del gráfico
let chartActual1 = null;
let rotationInterval = null;

let chartActual2 = null;

const COLOR_PALETTE = [
    "#27447dff",
    "#f5c9a8",
    "#4d82ecff",
    "#f48b3aff",
    "#98b6f1ff",
    "#894d1fff",
    "#4f5e7bff",    
];

const TITLE_STYLE = {
    color: '#2E5AAC',
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Segoe UI, Roboto, -apple-system, sans-serif',
    padding: [0, 0, 10, 0],
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const SUBTITLE_STYLE = {
    color: '#6D6D6D',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'Segoe UI, Roboto, -apple-system, sans-serif',
    lineHeight: 22
};

const AXIS_STYLE = {
    nameTextStyle: {
        color: '#4A4A4A',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'Segoe UI, Roboto, -apple-system, sans-serif',
        padding: [8, 0, 0, 0]
    },
    axisLine: {
        lineStyle: {
            color: '#D1D1D6',
            width: 2,
            opacity: 0.8
        }
    },
    axisTick: {
        lineStyle: {
            color: '#D1D1D6',
            width: 1
        },
        length: 4
    },
    axisLabel: {
        color: '#666666',
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Segoe UI, Roboto, -apple-system, sans-serif',
        margin: 8
    },
    splitLine: {
        lineStyle: {
            color: '#EAEAEA',
            type: 'solid',
            width: 1.5,
            opacity: 0.8
        }
    },
    splitArea: {
        show: false
    }
};

const TOOLTIP_STYLE = {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: '#2E5AAC',
    borderWidth: 1.8,
    padding: [16, 20],
    textStyle: {
        color: '#2C2C2C',
        fontSize: 13,
        fontWeight: '400',
        fontFamily: 'Segoe UI, Roboto, -apple-system, sans-serif',
        lineHeight: 20
    },
    extraCssText: `
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 
                    0 2px 6px rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    `,
    position: 'top',
    confine: true
};

const LEGEND_STYLE = {
    textStyle: {
        fontSize: 12,
        color: '#555',
        fontFamily: 'Arial, sans-serif'
    },
    pageIconColor: '#2E5AAC',
    pageTextStyle: {
        color: '#666',
        fontSize: 11
    },
    pageButtonItemGap: 6,
    pageButtonGap: 12,
    itemGap: 15,
    itemHeight: 14,
    itemWidth: 14
};

const ESCALA_IZQUIERDA = [
    "#ff7b00",
    "#f4c9a0",
    "#663406",
    "#675442",
    "#a25207",
    "#a57f5c",
];
const ESCALA_DERECHA = [   
    "#006aff",
    "#9dc1f3",
    "#03429a",
    "#5777a4",
    "#03285c",
    "#364c6a",
    
];

// MAPA GLOBAL DE COLORES ASIGNADOS (persistente entre llamadas)
if (typeof window.coloresAsignados === 'undefined') {
    window.coloresAsignados = {
        izquierda: {},  // { clusterId: color, ... }
        derecha: {},    // { clusterId: color, ... }
        otros: {}       // { clusterId: color, ... }
    };
}

// CONTADORES GLOBALES (solo para nuevos clusters)
if (typeof window.contadoresColores === 'undefined') {
    window.contadoresColores = { izquierda: 0, derecha: 0, otros: 0 };
}

//
function construirSeries(dataPorCluster, interpretacionIdeologica, tipo, totalPuntos) {
    // Solo ajustar tamaño si hay muchos puntos
    const baseSize = tipo === '3D' ? 10 : 12;
    const symbolSize = totalPuntos > 300 ? baseSize * 0.7 : baseSize;
    const opacity = totalPuntos > 300 ? 0.8 : 0.9;
    
    return Object.entries(dataPorCluster).map(([clusterId, puntos], index) => {
        const etiquetaObj = interpretacionIdeologica[String(clusterId)];
        const etiquetaTexto = etiquetaObj?.ideologia || 'Sin etiqueta';
        
        // Manejo especial para cluster -1 (ruido en DBSCAN)
        if (clusterId === '-1') {
            const etiqueta = `Cluster ${clusterId}: Puntos de ruido (clasificación individual)`;
            
            // Para cluster -1, procesamos cada punto individualmente
            const puntosIndividuales = puntos.map(punto => {
                let colorBorde = "#4f5e7bff"; // Color por defecto (gris)
                let prediccionIndividual = 'Desconocida';
                
                // Buscar la frase en la estructura de interpretación
                if (etiquetaObj && etiquetaObj.palabras) {
                    const fraseEncontrada = etiquetaObj.palabras.find(
                        item => item.frase === punto.name
                    );
                    
                    if (fraseEncontrada && fraseEncontrada.prediccion) {
                        prediccionIndividual = fraseEncontrada.prediccion;
                        const pred = prediccionIndividual.toLowerCase();
                        
                        if (pred.includes('izquierda')) {
                            colorBorde = "#f48b3aff"; // Naranja
                        } else if (pred.includes('derecha')) {
                            colorBorde = "#4d82ecff"; // Azul
                        } else if (pred.includes('no_politico') || pred.includes('no político')) {
                            colorBorde = "rgb(43, 43, 44)"; // Gris oscuro
                        } else if (pred.includes('neutral')) {
                            colorBorde = "#a0aec0ff"; // Gris claro
                        }
                    }
                }
                
                // Crear un nuevo objeto de punto con el estilo incluido
                return {
                    value: punto.value,
                    name: punto.name,
                    prediccionIndividual: prediccionIndividual,
                    // Agregar estilo directamente al punto de datos
                    itemStyle: {
                        color: 'transparent',
                        borderColor: colorBorde,
                        borderWidth: 2,
                        opacity: 0.8
                    }
                };
            });
            
            return {
                name: etiqueta,
                type: tipo === '3D' ? 'scatter3D' : 'scatter',
                data: puntosIndividuales,
                symbolSize: symbolSize * 1.1,
                emphasis: {
                    itemStyle: {
                        borderWidth: 3,
                        opacity: 1
                    },
                    label: {
                        show: true,
                        formatter: param => {
                            const pred = param.data.prediccionIndividual || 'Desconocida';
                            return `Ruido: ${pred}`;
                        },
                        position: 'top',
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        padding: [5, 10],
                        borderRadius: 5,
                        borderWidth: 1.2,
                        borderColor: '#EEE',
                        color: '#333',
                        fontSize: totalPuntos > 500 ? 11 : 12,
                        fontFamily: 'Arial, sans-serif',
                        distance: tipo === '3D' ? 20 : 0
                    }
                }
            };
        }
        
        // Para clusters normales (no -1)
        const etiqueta = `Cluster ${clusterId}: ${etiquetaTexto}`;

        // =============================================
        // 🎨 ASIGNACIÓN DE COLORES ÚNICOS POR CLUSTER
        // =============================================

        let color;

        // IZQUIERDA
        if (etiquetaTexto.toLowerCase().includes('izquierda')) {
            // ¿Ya tiene color asignado?
            if (window.coloresAsignados.izquierda[clusterId]) {
                color = window.coloresAsignados.izquierda[clusterId];
            } else {
                // Asignar nuevo color único
                const idx = window.contadoresColores.izquierda % ESCALA_IZQUIERDA.length;
                color = ESCALA_IZQUIERDA[idx];
                window.coloresAsignados.izquierda[clusterId] = color;
                window.contadoresColores.izquierda++;
            }
            
        // DERECHA
        } else if (etiquetaTexto.toLowerCase().includes('derecha')) {
            // ¿Ya tiene color asignado?
            if (window.coloresAsignados.derecha[clusterId]) {
                color = window.coloresAsignados.derecha[clusterId];
            } else {
                // Asignar nuevo color único
                const idx = window.contadoresColores.derecha % ESCALA_DERECHA.length;
                color = ESCALA_DERECHA[idx];
                window.coloresAsignados.derecha[clusterId] = color;
                window.contadoresColores.derecha++;
            }
            
        // NO POLÍTICO
        } else if (etiquetaTexto.toLowerCase().includes('no_politico') || 
                etiquetaTexto.toLowerCase().includes('no político')) {
            if (window.coloresAsignados.otros[clusterId]) {
                color = window.coloresAsignados.otros[clusterId];
            } else {
                color = "#4f5e7bff";
                window.coloresAsignados.otros[clusterId] = color;
            }
            
        // NEUTRAL
        } else if (etiquetaTexto.toLowerCase().includes('neutral')) {
            if (window.coloresAsignados.otros[clusterId]) {
                color = window.coloresAsignados.otros[clusterId];
            } else {
                color = "rgb(253, 153, 255)";
                window.coloresAsignados.otros[clusterId] = color;
            }
            
        // OTROS
        } else {
            if (window.coloresAsignados.otros[clusterId]) {
                color = window.coloresAsignados.otros[clusterId];
            } else {
                color = COLOR_PALETTE[window.contadoresColores.otros % COLOR_PALETTE.length];
                window.coloresAsignados.otros[clusterId] = color;
                window.contadoresColores.otros++;
            }
        }

        return {
            name: etiqueta,
            type: tipo === '3D' ? 'scatter3D' : 'scatter',
            data: puntos,
            symbolSize: symbolSize,
            itemStyle: {
                color: color,
                borderWidth: 0,
                opacity: opacity
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 12,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    opacity: 1
                },
                label: {
                    show: true,
                    formatter: param => param.data.name,
                    position: 'top',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: [5, 10],
                    borderRadius: 5,
                    borderWidth: 1.2,
                    borderColor: '#EEE',
                    color: '#333',
                    fontSize: totalPuntos > 500 ? 11 : 12,
                    fontFamily: 'Arial, sans-serif',
                    distance: tipo === '3D' ? 20 : 0,
                    shadowBlur: 8,
                    shadowColor: 'rgba(0,0,0,0.1)'
                }
            }
        };
    });
}

// Gráfico t-SNE 2D
function generarGraficoDispersionPorIdeologia(embeddingsLatentes, asignacionClusters, interpretacionIdeologica) {
     const contenedor = document.getElementById('grafico-general-descripcion');
    
    if (!contenedor) {
        console.error(`Contenedor ${'grafico-general-descripcion'} no encontrado`);
        return;
    }

    // Verificación robusta de instancia previa
    const existingChart = echarts.getInstanceByDom(contenedor);
    if (existingChart && !existingChart.isDisposed()) {
        existingChart.dispose();
    }

    // Crear contenedor interno con botón de alternancia
    contenedor.innerHTML = `
        <div id="grafico-umap-container" style="position: relative; width: 100%; height: 100%;">
            <div id="grafico-echarts-container" style="width: 100%; height: 100%;"></div>
            <button id="toggle-2d-3d" style="
                position: absolute;
                top: 30px;
                right: 10px;
                z-index: 100;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s;">
                Cambiar a Vista 2D
            </button>
        </div>
    `;
    
    const graficoContainer = document.getElementById('grafico-echarts-container');
    const toggleButton = document.getElementById('toggle-2d-3d');
    
    // Estado para alternar entre 2D y 3D
    let is3DView = true;
    let chartInstance = null;

    // Procesar datos para 3D y 2D
    const dataPorCluster = {};
    let totalPuntos = 0;
    
    // Rangos para escalado de ejes
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const palabra in embeddingsLatentes) {
        const vector = embeddingsLatentes[palabra];
        const clusterId = asignacionClusters[palabra];
        dataPorCluster[clusterId] = dataPorCluster[clusterId] || [];
        const punto = {
            value: [vector[0], vector[1], vector[2]], // 3D
            value2D: [vector[0], vector[1]], // Proyección XY para 2D
            name: palabra
        };
        dataPorCluster[clusterId].push(punto);
        totalPuntos++;
        
        // Calcular rangos para escalado automático
        minX = Math.min(minX, vector[0]);
        maxX = Math.max(maxX, vector[0]);
        minY = Math.min(minY, vector[1]);
        maxY = Math.max(maxY, vector[1]);
        minZ = Math.min(minZ, vector[2]);
        maxZ = Math.max(maxZ, vector[2]);
    }

    // Asegurar que haya un rango mínimo visible
    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    if (minZ === maxZ) { minZ -= 1; maxZ += 1; }
    
    // Añadir margen proporcional
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const zRange = maxZ - minZ;
    const xMargin = xRange * 0.1;
    const yMargin = yRange * 0.1;
    const zMargin = zRange * 0.1;
    
    // Margen mínimo para pocos datos
    const minMargin = 0.5;
    minX -= Math.max(xMargin, minMargin);
    maxX += Math.max(xMargin, minMargin);
    minY -= Math.max(yMargin, minMargin);
    maxY += Math.max(yMargin, minMargin);
    minZ -= Math.max(zMargin, minMargin);
    maxZ += Math.max(zMargin, minMargin);

    // Función para crear gráfico 3D con cuadrícula
    function crearGrafico3D() {
        const series = construirSeries(dataPorCluster, interpretacionIdeologica, '3D', totalPuntos);
        const numClusters = Object.keys(dataPorCluster).length;
        
        const option = {
            title: {
                text: 'Distribución PCA 3D por Clúster Ideológico',
                left: 'center',
                textStyle: TITLE_STYLE,
                subtext: `Visualización 3D con PCA (${totalPuntos} puntos, ${numClusters} clusters)`,
                subtextStyle: SUBTITLE_STYLE
            },
            tooltip: {
                ...TOOLTIP_STYLE,
                formatter: param => {
                    const formatearFrase = (texto) => {
                        const maxCaracteresPorLinea = 50;
                        const maxLineas = 4;
                        
                        if (texto.length <= maxCaracteresPorLinea) return texto;
                        
                        const palabras = texto.split(' ');
                        let lineas = [], lineaActual = '';
                        
                        for (const palabra of palabras) {
                            if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                lineas.push(lineaActual);
                                if (lineas.length >= maxLineas) {
                                    if (palabras.length > lineas.join(' ').split(' ').length) {
                                        lineas[maxLineas - 1] = lineas[maxLineas - 1] + '...';
                                    }
                                    break;
                                }
                                lineaActual = palabra;
                            } else {
                                lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                            }
                        }
                        
                        if (lineaActual && lineas.length < maxLineas) lineas.push(lineaActual);
                        return lineas.join('<br/>');
                    };
                    
                    const fraseFormateada = formatearFrase(param.data.name);
                    const necesitaMasLineas = param.data.name.length > (50 * 3);
                    
                    const esClusterRuido = param.seriesName.includes('Cluster -1');
                    const prediccionIndividual = param.data.prediccionIndividual;
                    
                    let infoClasificacion = '';
                    if (esClusterRuido && prediccionIndividual) {
                        let colorBordeInfo = '#666';
                        const pred = prediccionIndividual.toLowerCase();
                        if (pred.includes('izquierda')) colorBordeInfo = '#f48b3a';
                        else if (pred.includes('derecha')) colorBordeInfo = '#4d82ec';
                        else if (pred.includes('no_politico') || pred.includes('no político')) colorBordeInfo = '#4f5e7b';
                        else if (pred.includes('neutral')) colorBordeInfo = '#a0aec0';
                        
                        infoClasificacion = `
                            <div style="color:${colorBordeInfo}; margin-bottom: 5px; font-weight: bold; border-left: 4px solid ${colorBordeInfo}; padding-left: 8px;">
                                <strong>Clasificación individual:</strong> ${prediccionIndividual}
                            </div>
                            <div style="color:#666; margin-bottom: 5px; font-style: italic; font-size: 11px;">
                                (Punto de ruido - clasificado individualmente)
                            </div>
                        `;
                    } else {
                        infoClasificacion = `<div style="color:#666; margin-bottom: 5px;"><strong>Cluster:</strong> ${param.seriesName}</div>`;
                    }
                    
                    return `
                        <div style="max-width: 380px;">
                            <strong style="font-size:14px; color: #2c3e50;">Frase:</strong><br/>
                            <div style="color: #666; margin: 5px 0; font-style: italic; 
                                        line-height: 1.4; padding: 5px; background: #f9f9f9; 
                                        border-radius: 4px; ${necesitaMasLineas ? 'max-height: 100px; overflow-y: auto;' : ''}">
                                "${fraseFormateada}"
                            </div>
                            ${necesitaMasLineas ? '<div style="font-size: 10px; color: #888; text-align: right; margin-top: 2px;">(scroll para ver más)</div>' : ''}
                            <hr style="margin: 10px 0; border-color: #eee;">
                            ${infoClasificacion}
                            <div style="font-family: monospace; color: #444; font-size: 12px;">
                                UMAP X: <b>${param.data.value[0].toFixed(2)}</b><br/>
                                UMAP Y: <b>${param.data.value[1].toFixed(2)}</b><br/>
                                UMAP Z: <b>${param.data.value[2].toFixed(2)}</b>
                            </div>
                        </div>
                    `;
                },
                trigger: 'item'
            },
legend: {
    ...LEGEND_STYLE,
    top: 'bottom',          
    left: 'center',           
    orient: 'horizontal',     
    selectedMode: 'multiple',
    type: numClusters > 4 ? 'scroll' : 'plain',
    width: '80%',           // Ajusta el ancho para que no invada el gráfico
    pageIconSize: 10,
    pageButtonItemGap: 4,
    pageButtonPosition: 'end',
    pageTextStyle: { color: '#666', fontSize: 10 },
    data: series.map(s => s.name)
},
            xAxis3D: {
                name: 'PCA X',
                type: 'value',
                min: minX,
                max: maxX,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            yAxis3D: {
                name: 'PCA Y',
                type: 'value',
                min: minY,
                max: maxY,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            zAxis3D: {
                name: 'UMAP Z',
                type: 'value',
                min: minZ,
                max: maxZ,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            grid3D: {
                boxWidth: 100,
                boxHeight: 100,
                boxDepth: 100,
                viewControl: {
                    projection: 'perspective',
                    autoRotate: totalPuntos > 50,
                    autoRotateSpeed: 8,
                    rotateSensitivity: 1,
                    zoomSensitivity: 1,
                    panSensitivity: 1,
                    distance: 180,
                    minDistance: 80,
                    maxDistance: 300,
                    alpha: 25,
                    beta: 40,
                    center: [0, 0, 0]
                },
                axisPointer: {
                    show: true,
                    lineStyle: { color: '#aaa', width: 1 }
                },
                axisLine: {
                    lineStyle: { color: '#ccc', width: 1 }
                },
                splitLine: {
                    show: true,
                    lineStyle: { color: '#e0e0e0', width: 0.5, type: 'dashed' }
                },
                splitArea: {
                    show: true,
                    areaStyle: { color: ['rgba(250,250,250,0.2)', 'rgba(240,240,240,0.2)'] }
                },
                environment: '#fafafa',
                light: {
                    main: { intensity: 1.2, shadow: true },
                    ambient: { intensity: 0.3 }
                }
            },
            series: series,
            backgroundColor: '#FFF'
        };

        return option;
    }

    // Función para crear gráfico 2D (proyección XY)
    function crearGrafico2D() {
        // Crear datos 2D (usando proyección XY)
        const data2DPorCluster = {};
        for (const [clusterId, puntos] of Object.entries(dataPorCluster)) {
            data2DPorCluster[clusterId] = puntos.map(p => ({
                value: p.value2D,
                name: p.name,
                prediccionIndividual: p.prediccionIndividual
            }));
        }
        
        const series = construirSeries(data2DPorCluster, interpretacionIdeologica, '2D', totalPuntos);
        const numClusters = Object.keys(data2DPorCluster).length;
        
        const option = {
            title: {
                text: 'Distribución PCA 2D por Clúster Ideológico',
                left: 'center',
                textStyle: TITLE_STYLE,
                subtext: `Visualización 2D - Proyección XY (${totalPuntos} puntos, ${numClusters} clusters)`,
                subtextStyle: SUBTITLE_STYLE
            },
            tooltip: {
                ...TOOLTIP_STYLE,
                formatter: param => {
                    const formatearFrase = (texto) => {
                        const maxCaracteresPorLinea = 50;
                        if (texto.length <= maxCaracteresPorLinea) return texto;
                        
                        const palabras = texto.split(' ');
                        let lineas = [], lineaActual = '';
                        
                        for (const palabra of palabras) {
                            if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                lineas.push(lineaActual);
                                if (lineas.length >= 4) break;
                                lineaActual = palabra;
                            } else {
                                lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                            }
                        }
                        
                        if (lineaActual && lineas.length < 4) lineas.push(lineaActual);
                        return lineas.join('<br/>');
                    };
                    
                    const fraseFormateada = formatearFrase(param.data.name);
                    const esClusterRuido = param.seriesName.includes('Cluster -1');
                    const prediccionIndividual = param.data.prediccionIndividual;
                    
                    let infoClasificacion = '';
                    if (esClusterRuido && prediccionIndividual) {
                        let colorBordeInfo = '#666';
                        const pred = prediccionIndividual.toLowerCase();
                        if (pred.includes('izquierda')) colorBordeInfo = '#f48b3a';
                        else if (pred.includes('derecha')) colorBordeInfo = '#4d82ec';
                        else if (pred.includes('no_politico') || pred.includes('no político')) colorBordeInfo = '#4f5e7b';
                        else if (pred.includes('neutral')) colorBordeInfo = '#a0aec0';
                        
                        infoClasificacion = `
                            <div style="color:${colorBordeInfo}; margin-bottom: 5px; font-weight: bold; border-left: 4px solid ${colorBordeInfo}; padding-left: 8px;">
                                <strong>Clasificación individual:</strong> ${prediccionIndividual}
                            </div>
                        `;
                    } else {
                        infoClasificacion = `<div style="color:#666; margin-bottom: 5px;"><strong>Cluster:</strong> ${param.seriesName}</div>`;
                    }
                    
                    return `
                        <div style="max-width: 380px;">
                            <strong style="font-size:14px; color: #2c3e50;">Frase:</strong><br/>
                            <div style="color: #666; margin: 5px 0; font-style: italic; line-height: 1.4; padding: 5px; background: #f9f9f9; border-radius: 4px;">
                                "${fraseFormateada}"
                            </div>
                            <hr style="margin: 10px 0; border-color: #eee;">
                            ${infoClasificacion}
                            <div style="font-family: monospace; color: #444; font-size: 12px;">
                                X: <b>${param.data.value[0].toFixed(2)}</b><br/>
                                Y: <b>${param.data.value[1].toFixed(2)}</b>
                            </div>
                        </div>
                    `;
                },
                trigger: 'item'
            },
            legend: {
                ...LEGEND_STYLE,
                top: 'bottom',
                selectedMode: 'multiple',
                type: numClusters > 4 ? 'scroll' : 'plain',
                orient: 'horizontal',
                left: 'center',
                width: '80%',
                data: series.map(s => s.name)
            },
            xAxis: {
                name: 'PCA X',
                nameLocation: 'middle',
                nameGap: 25,
                nameTextStyle: { fontSize: 12, color: '#555' },
                min: minX,
                max: maxX,
                axisLine: { lineStyle: { color: '#888' } },
                splitLine: { show: true, lineStyle: { color: '#eee', type: 'dashed' } },
                axisLabel: { color: '#777', fontSize: 10 }
            },
            yAxis: {
                name: 'PCA Y',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { fontSize: 12, color: '#555' },
                min: minX,
                max: maxX,
                axisLine: { lineStyle: { color: '#888' } },
                splitLine: { show: true, lineStyle: { color: '#eee', type: 'dashed' } },
                axisLabel: { show: false }
            },
            series: series,
            grid: {
                top: 80,
                bottom: 100,
                left: 60,
                right: 60,
                containLabel: true
            },
            backgroundColor: '#FFF'
        };

        // Añadir zoom si hay muchos puntos
        if (totalPuntos > 20) {
            option.dataZoom = [
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true
                }
            ];
        }

        return option;
    }

    // Función para alternar entre vistas
    function toggleView() {
        is3DView = !is3DView;
        
        if (is3DView) {
            toggleButton.textContent = 'Cambiar a Vista 2D';
            chartInstance.setOption(crearGrafico3D(), true);
        } else {
            toggleButton.textContent = 'Cambiar a Vista 3D';
            chartInstance.setOption(crearGrafico2D(), true);
        }
    }

    // Inicializar gráfico 3D
    chartInstance = echarts.init(graficoContainer);
    chartInstance.setOption(crearGrafico3D());

    // Configurar evento del botón
    toggleButton.addEventListener('click', toggleView);

    // Manejo de redimensionamiento
    const resizeHandler = () => {
        if (chartInstance && !chartInstance.isDisposed()) {
            chartInstance.resize();
        }
    };
    window.addEventListener('resize', resizeHandler);

    return {
        chart: chartInstance,
        resizeHandler: resizeHandler,
        toggleView: toggleView
    };
}
//Grafica de dispersion por autor

async function generarGraficoDispersionPorAutores(embeddingsLatentes, asignacionClusters, interpretacionIdeologica) {
    console.log("Iniciando gráfico por autores...");
    
    const contenedor = document.getElementById('grafico-general-descripcion');
    if (!contenedor) {
        throw new Error("Contenedor no encontrado");
    }
    
    // Limpiar gráfico anterior
    try {
        const existingChart = echarts.getInstanceByDom(contenedor);
        if (existingChart && !existingChart.isDisposed()) {
            existingChart.dispose();
        }
    } catch (error) {
        console.warn("Error al limpiar gráfico anterior:", error);
    }
    
    // Crear contenedor con botón de alternancia
    contenedor.innerHTML = `
        <div id="grafico-autores-container" style="position: relative; width: 100%; height: 100%;">
            <div id="grafico-autores-echarts" style="width: 100%; height: 100%;"></div>
            <button id="toggle-2d-3d-autores" style="
                position: absolute;
                top: 30px;
                right: 10px;
                z-index: 100;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s;
            ">
                Cambiar a Vista 3D
            </button>
        </div>
    `;
    
    const graficoContainer = document.getElementById('grafico-autores-echarts');
    const toggleButton = document.getElementById('toggle-2d-3d-autores');
    
    // Variables para manejar el gráfico y estado 2D/3D
    let chartInstance = null;
    let is3DView = false; // Comienza en 2D
    let datosProcesados = null; // Para almacenar los datos procesados

    try {
        // PASO 1: Crear un mapa de frase → título(s)
        const fraseTitulosMap = {};
        
        for (const clusterId in interpretacionIdeologica) {
            const cluster = interpretacionIdeologica[clusterId];
            if (cluster && cluster.palabras) {
                for (const palabraInfo of cluster.palabras) {
                    if (palabraInfo && palabraInfo.frase && palabraInfo.origen) {
                        const frase = palabraInfo.frase.toLowerCase().trim();
                        const origenes = Array.isArray(palabraInfo.origen) ? 
                            palabraInfo.origen : [palabraInfo.origen];
                        
                        if (!fraseTitulosMap[frase]) {
                            fraseTitulosMap[frase] = new Set();
                        }
                        
                        origenes.forEach(titulo => {
                            if (titulo && titulo.trim()) {
                                fraseTitulosMap[frase].add(titulo.trim());
                            }
                        });
                    }
                }
            }
        }
        
        console.log("Mapeo frase->títulos creado:", Object.keys(fraseTitulosMap).length, "frases");

        // PASO 2: Para cada título único, obtener el autor UNA SOLA VEZ
        const titulosUnicos = new Set();
        Object.values(fraseTitulosMap).forEach(titulosSet => {
            titulosSet.forEach(titulo => titulosUnicos.add(titulo));
        });
        
        console.log("Títulos únicos encontrados:", Array.from(titulosUnicos).length);
        
        const tituloAutorMap = {};
        const titulosArray = Array.from(titulosUnicos);
        
        // Usar Promise.all para hacer todas las solicitudes en paralelo
        const autorPromises = titulosArray.map(async (titulo) => {
            try {
                console.log("Buscando autor para:", titulo);
                const response = await fetch('/obtener-autor-por-titulo', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ titulo: titulo })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return { titulo, autor: data.autor || "Desconocido" };
                } else {
                    console.warn(`Error HTTP para "${titulo}":`, response.status);
                    return { titulo, autor: "Desconocido" };
                }
            } catch (error) {
                console.warn(`Error obteniendo autor para "${titulo}":`, error);
                return { titulo, autor: "Desconocido" };
            }
        });
        
        const autorResults = await Promise.all(autorPromises);
        
        // Construir el mapa título→autor
        autorResults.forEach(({ titulo, autor }) => {
            tituloAutorMap[titulo] = autor;
        });
        
        console.log("Mapa título->autor completado:", tituloAutorMap);

        // PASO 3: Crear mapa final frase→autor
        const fraseAutorMap = {};
        
        for (const [frase, titulosSet] of Object.entries(fraseTitulosMap)) {
            // Para cada frase, obtener todos los autores posibles
            const autoresSet = new Set();
            
            titulosSet.forEach(titulo => {
                if (tituloAutorMap[titulo]) {
                    autoresSet.add(tituloAutorMap[titulo]);
                }
            });
            
            // Si hay múltiples autores, usar el primero o combinar
            if (autoresSet.size > 0) {
                fraseAutorMap[frase] = Array.from(autoresSet).join("; ");
            } else {
                fraseAutorMap[frase] = "Desconocido";
            }
        }
        
        console.log("Mapa frase->autor final:", Object.keys(fraseAutorMap).length, "frases");

        // PASO 4: Identificar qué clusters son "no_politico" y cuales son ruido (-1)
        const clustersNoPolitico = new Set();
        const clustersRuido = new Set(); // Nuevo: para identificar cluster -1
        const clusterEtiquetas = {};
        
        for (const clusterId in interpretacionIdeologica) {
            const cluster = interpretacionIdeologica[clusterId];
            const etiquetaTexto = cluster?.ideologia || 'Sin etiqueta';
            const etiquetaLower = etiquetaTexto.toLowerCase();
            
            // Guardar etiqueta del cluster
            clusterEtiquetas[String(clusterId)] = etiquetaTexto;
            
            // Identificar si es no político
            if (etiquetaLower.includes('no_politico') || 
                etiquetaLower.includes('no político')) {
                clustersNoPolitico.add(String(clusterId));
                console.log(`✅ Cluster ${clusterId} identificado como NO POLÍTICO: "${etiquetaTexto}"`);
            }
            
            // Identificar si es cluster de ruido (-1)
            if (clusterId === '-1') {
                clustersRuido.add(String(clusterId));
                console.log(`⚠️ Cluster ${clusterId} identificado como RUIDO (DBSCAN)`);
            }
        }
        
        console.log("Clusters no políticos encontrados:", Array.from(clustersNoPolitico));
        console.log("Clusters de ruido encontrados:", Array.from(clustersRuido));

        // PASO 5: Procesar embeddings y crear estructura de datos
        const dataPorAutor = {};
        const autoresConPuntos = new Set();
        const autoresConPuntosPoliticos = new Set();
        const autoresConPuntosRuido = new Set(); // Nuevo: autores con puntos en ruido
        let totalPuntos = 0;
        
        // Variables para rangos (2D y 3D)
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        // Contadores para debug
        let puntosNoPoliticos = 0;
        let puntosPoliticos = 0;
        let puntosRuido = 0; // Nuevo: contador de puntos en ruido
        let autoresMixtos = new Set();
        
        for (const fraseKey in embeddingsLatentes) {
            const vector = embeddingsLatentes[fraseKey];
            let clusterId = asignacionClusters[fraseKey];
            
            if (!vector || vector.length < 2) continue;
            
            // Convertir clusterId a string para comparación consistente
            clusterId = String(clusterId);
            
            // Buscar autor usando la frase normalizada
            const fraseNormalizada = fraseKey.toLowerCase().trim();
            let autor = fraseAutorMap[fraseNormalizada] || "Desconocido";
            
            // Si no hay coincidencia exacta, buscar la frase más similar
            if (autor === "Desconocido") {
                for (const fraseMapeada in fraseAutorMap) {
                    if (fraseNormalizada.includes(fraseMapeada) || 
                        fraseMapeada.includes(fraseNormalizada)) {
                        autor = fraseAutorMap[fraseMapeada];
                        break;
                    }
                }
            }
            
            // Determinar el tipo de punto
            const esPuntoRuido = clustersRuido.has(clusterId); // Primero verificar si es ruido
            const esPuntoNoPolitico = !esPuntoRuido && clustersNoPolitico.has(clusterId);
            const esPuntoPolitico = !esPuntoRuido && !esPuntoNoPolitico;
            
            // Contar para estadísticas
            if (esPuntoRuido) {
                puntosRuido++;
                autoresConPuntosRuido.add(autor);
            } else if (esPuntoNoPolitico) {
                puntosNoPoliticos++;
            } else {
                puntosPoliticos++;
                autoresConPuntosPoliticos.add(autor);
            }
            
            // Agrupar por autor
            if (!dataPorAutor[autor]) {
                dataPorAutor[autor] = [];
            }
            
            const punto = {
                value: [vector[0], vector[1]], // 2D
                value3D: vector.length >= 3 ? [vector[0], vector[1], vector[2]] : [vector[0], vector[1], 0], // 3D
                name: fraseKey.length > 40 ? fraseKey.substring(0, 37) + "..." : fraseKey,
                cluster: `Cluster ${clusterId} (${clusterEtiquetas[clusterId] || 'Sin etiqueta'})`,
                autor: autor,
                fraseCompleta: fraseKey,
                esNoPolitico: esPuntoNoPolitico,
                esRuido: esPuntoRuido, // Nuevo campo
                esPolitico: esPuntoPolitico,
                clusterId: clusterId,
                etiquetaCluster: clusterEtiquetas[clusterId] || 'Sin etiqueta'
            };
            
            dataPorAutor[autor].push(punto);
            autoresConPuntos.add(autor);
            totalPuntos++;
            
            // Calcular rangos para 2D
            minX = Math.min(minX, vector[0]);
            maxX = Math.max(maxX, vector[0]);
            minY = Math.min(minY, vector[1]);
            maxY = Math.max(maxY, vector[1]);
            
            // Calcular rangos para 3D (si existe tercera dimensión)
            if (vector.length >= 3) {
                minZ = Math.min(minZ, vector[2]);
                maxZ = Math.max(maxZ, vector[2]);
            }
        }
        
        // Identificar autores mixtos (con puntos políticos, no políticos y/o ruido)
        for (const autor in dataPorAutor) {
            const puntosAutor = dataPorAutor[autor];
            const tienePoliticos = puntosAutor.some(p => p.esPolitico);
            const tieneNoPoliticos = puntosAutor.some(p => p.esNoPolitico);
            const tieneRuido = puntosAutor.some(p => p.esRuido);
            
            if ((tienePoliticos && tieneNoPoliticos) || 
                (tienePoliticos && tieneRuido) || 
                (tieneNoPoliticos && tieneRuido)) {
                autoresMixtos.add(autor);
                console.log(`⚠️ Autor mixto detectado: "${autor}" tiene:
                    ${puntosAutor.filter(p => p.esPolitico).length} puntos políticos,
                    ${puntosAutor.filter(p => p.esNoPolitico).length} puntos no políticos,
                    ${puntosAutor.filter(p => p.esRuido).length} puntos de ruido`);
            }
        }
        
        console.log(`DEBUG: Total puntos: ${totalPuntos}, 
            Políticos: ${puntosPoliticos}, 
            No políticos: ${puntosNoPoliticos}, 
            Ruido: ${puntosRuido}`);
        console.log(`Autores con puntos en ruido: ${Array.from(autoresConPuntosRuido).length > 0 ? Array.from(autoresConPuntosRuido).join(', ') : 'Ninguno'}`);

        if (totalPuntos === 0) {
            throw new Error("No se encontraron datos para graficar");
        }

        // PASO 6: Agrupar autores con muy pocos puntos en "Otros autores"
        const autoresAgrupados = {};
        const MIN_PUNTOS_POR_AUTOR = 3;
        
        for (const autor in dataPorAutor) {
            if (dataPorAutor[autor].length >= MIN_PUNTOS_POR_AUTOR) {
                autoresAgrupados[autor] = dataPorAutor[autor];
            } else {
                if (!autoresAgrupados["Otros autores"]) {
                    autoresAgrupados["Otros autores"] = [];
                }
                autoresAgrupados["Otros autores"] = autoresAgrupados["Otros autores"].concat(dataPorAutor[autor]);
            }
        }
        
        // Ajustar rangos para 2D
        if (minX === maxX) { minX -= 1; maxX += 1; }
        if (minY === maxY) { minY -= 1; maxY += 1; }
        
        // Ajustar rangos para 3D
        if (minZ === Infinity || maxZ === -Infinity) {
            minZ = -1; maxZ = 1; // Valores por defecto si no hay tercera dimensión
        }
        if (minZ === maxZ) { minZ -= 1; maxZ += 1; }
        
        const xRange = maxX - minX;
        const yRange = maxY - minY;
        const zRange = maxZ - minZ;
        const xMargin = xRange * 0.1;
        const yMargin = yRange * 0.1;
        const zMargin = zRange * 0.1;
        
        const minMargin = 0.5;
        minX -= Math.max(xMargin, minMargin);
        maxX += Math.max(xMargin, minMargin);
        minY -= Math.max(yMargin, minMargin);
        maxY += Math.max(yMargin, minMargin);
        minZ -= Math.max(zMargin, minMargin);
        maxZ += Math.max(zMargin, minMargin);

        // Almacenar datos procesados para reutilizar
        datosProcesados = {
            autoresAgrupados,
            clusterEtiquetas,
            puntosPoliticos,
            puntosNoPoliticos,
            puntosRuido,
            totalPuntos,
            autoresConPuntosPoliticos,
            minX, maxX, minY, maxY, minZ, maxZ
        };

        // Paleta de colores para autores POLÍTICOS
        const COLOR_PALETTE_AUTORES = [
            "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2", 
            "#EF476F", "#7B68EE", "#20B2AA", "#FFA500", "#9370DB",
            "#1E90FF", "#32CD32", "#FF69B4", "#8A2BE2", "#DC143C",
            "#00CED1", "#8FBC8F", "#DA70D6", "#F0E68C", "#87CEEB"
        ];
        
        // Color para puntos NO POLÍTICOS (gris)
        const COLOR_NO_POLITICO = "#4f5e7bff";
        
        // Color para puntos de RUIDO (-1) - Mismo que no político pero con estilo diferente
        const COLOR_RUIDO = "#4f5e7bff"; // Mismo color gris

        // Función para crear series de datos (compatible con 2D y 3D)
        function crearSeries(tipo) {
            const series = [];
            const legendData = [];
            
            // Asignar colores a cada autor (solo para sus puntos políticos)
            const autorColorMap = {};
            let colorIndex = 0;
            
            Object.keys(autoresAgrupados).forEach(autor => {
                if (autor !== "Otros autores" && autoresConPuntosPoliticos.has(autor)) {
                    autorColorMap[autor] = COLOR_PALETTE_AUTORES[colorIndex % COLOR_PALETTE_AUTORES.length];
                    colorIndex++;
                }
            });
            
            // Para "Otros autores", usar color gris claro
            autorColorMap["Otros autores"] = "#CCCCCC";
            
            // Crear series para cada autor
            Object.entries(autoresAgrupados).forEach(([autor, puntos]) => {
                const autorCorto = autor.length > 20 ? autor.substring(0, 17) + "..." : autor;
                
                // Separar puntos por tipo
                const puntosPoliticos = puntos.filter(p => p.esPolitico);
                const puntosNoPoliticos = puntos.filter(p => p.esNoPolitico);
                const puntosRuido = puntos.filter(p => p.esRuido);
                
                // Agregar serie para puntos POLÍTICOS de este autor
                if (puntosPoliticos.length > 0) {
                    const etiquetaPolitica = `${autorCorto} (${puntosPoliticos.length} políticos)`;
                    
                    series.push({
                        name: etiquetaPolitica,
                        type: tipo === '3D' ? 'scatter3D' : 'scatter',
                        data: puntosPoliticos.map(p => ({
                            value: tipo === '3D' ? p.value3D : p.value,
                            name: p.name,
                            autor: p.autor,
                            fraseCompleta: p.fraseCompleta,
                            esNoPolitico: p.esNoPolitico,
                            esRuido: p.esRuido,
                            esPolitico: p.esPolitico,
                            clusterId: p.clusterId,
                            etiquetaCluster: p.etiquetaCluster
                        })),
                        symbolSize: totalPuntos > 300 ? 8 : 10,
                        itemStyle: {
                            color: autorColorMap[autor] || COLOR_PALETTE_AUTORES[0],
                            borderWidth: 0,
                            opacity: 0.85
                        },
                        emphasis: {
                            itemStyle: {
                                opacity: 1,
                                borderColor: '#000',
                                borderWidth: 1
                            }
                        }
                    });
                    
                    legendData.push(etiquetaPolitica);
                }
                
                // Agregar serie para puntos NO POLÍTICOS de este autor
                if (puntosNoPoliticos.length > 0) {
                    const etiquetaNoPolitica = `${autorCorto} (${puntosNoPoliticos.length} no políticos)`;
                    
                    series.push({
                        name: etiquetaNoPolitica,
                        type: tipo === '3D' ? 'scatter3D' : 'scatter',
                        data: puntosNoPoliticos.map(p => ({
                            value: tipo === '3D' ? p.value3D : p.value,
                            name: p.name,
                            autor: p.autor,
                            fraseCompleta: p.fraseCompleta,
                            esNoPolitico: p.esNoPolitico,
                            esRuido: p.esRuido,
                            esPolitico: p.esPolitico,
                            clusterId: p.clusterId,
                            etiquetaCluster: p.etiquetaCluster
                        })),
                        symbolSize: totalPuntos > 300 ? 8 : 10,
                        itemStyle: {
                            color: COLOR_NO_POLITICO,
                            borderWidth: 0,
                            opacity: 0.9
                        },
                        emphasis: {
                            itemStyle: {
                                opacity: 1,
                                borderColor: '#333',
                                borderWidth: 1.5
                            }
                        }
                    });
                    
                    legendData.push(etiquetaNoPolitica);
                }
                
                // Agregar serie para puntos de RUIDO (-1) de este autor
                if (puntosRuido.length > 0) {
                    const etiquetaRuido = `${autorCorto} (${puntosRuido.length} ruido)`;
                    
                    series.push({
                        name: etiquetaRuido,
                        type: tipo === '3D' ? 'scatter3D' : 'scatter',
                        data: puntosRuido.map(p => ({
                            value: tipo === '3D' ? p.value3D : p.value,
                            name: p.name,
                            autor: p.autor,
                            fraseCompleta: p.fraseCompleta,
                            esNoPolitico: p.esNoPolitico,
                            esRuido: p.esRuido,
                            esPolitico: p.esPolitico,
                            clusterId: p.clusterId,
                            etiquetaCluster: p.etiquetaCluster
                        })),
                        symbolSize: totalPuntos > 300 ? 9 : 11,
                        itemStyle: {
                            color: 'transparent',
                            borderColor: COLOR_RUIDO,
                            borderWidth: 2,
                            opacity: 0.9
                        },
                        emphasis: {
                            itemStyle: {
                                opacity: 1,
                                borderColor: '#000',
                                borderWidth: 3,
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        }
                    });
                    
                    legendData.push(etiquetaRuido);
                }
            });
            
            return { series, legendData };
        }

        // Función para crear gráfico 2D
        function crearGrafico2D() {
            const { series, legendData } = crearSeries('2D');
            const numAutores = Object.keys(autoresAgrupados).length;
            
            const option = {
                title: {
                    text: 'Distribución PCA 2D por Autor',
                    left: 'center',
                    textStyle: TITLE_STYLE,
                    subtext: `Visualización 2D por autores (${totalPuntos} frases, ${numAutores} autores) | 
                             Políticos: ${puntosPoliticos}, No políticos: ${puntosNoPoliticos}, Ruido: ${puntosRuido}`,
                    subtextStyle: SUBTITLE_STYLE
                },
                tooltip: {
                    ...TOOLTIP_STYLE,
                    formatter: param => {
                        if (!param.data) return '';
                        const punto = param.data;
                        const frase = punto.fraseCompleta || punto.name;
                        const autor = punto.autor;
                        const esRuido = punto.esRuido;
                        const esNoPolitico = punto.esNoPolitico;
                        const esPolitico = punto.esPolitico;
                        const clusterId = punto.clusterId;
                        const etiquetaCluster = punto.etiquetaCluster;
                        
                        const formatearFrase = (texto) => {
                            const maxCaracteresPorLinea = 60;
                            if (texto.length <= maxCaracteresPorLinea) {
                                return texto;
                            }
                            
                            const palabras = texto.split(' ');
                            let lineas = [];
                            let lineaActual = '';
                            
                            for (const palabra of palabras) {
                                if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                    lineas.push(lineaActual);
                                    lineaActual = palabra;
                                } else {
                                    lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                                }
                            }
                            
                            if (lineaActual) {
                                lineas.push(lineaActual);
                            }
                            
                            return lineas.join('<br/>');
                        };
                        
                        const fraseFormateada = formatearFrase(frase);
                        
                        let indicadorTipo = '';
                        if (esRuido) {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #4f5e7b; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold; border: 1px solid #333;">
                                    Ruido (-1)
                                </div>
                            `;
                        } else if (esNoPolitico) {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #4f5e7b; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold;">
                                    No político
                                </div>
                            `;
                        } else {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #2E5AAC; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold;">
                                    Político
                                </div>
                            `;
                        }
                        
                        let infoAdicional = '';
                        if (esRuido) {
                            infoAdicional = `
                                <div style="margin-top: 5px; padding: 5px; background: #f8f8f8; border-radius: 4px; border-left: 3px solid #4f5e7b;">
                                    <small><strong>Nota:</strong> Punto identificado como ruido por DBSCAN.<br>
                                    Clasificado individualmente por el modelo.</small>
                                </div>
                            `;
                        }
                        
                        const coords = esRuido ? 
                            `X: ${punto.value[0].toFixed(2)}, Y: ${punto.value[1].toFixed(2)}` :
                            `[${punto.value[0].toFixed(2)}, ${punto.value[1].toFixed(2)}]`;
                        
                        return `
                            <div style="max-width: 400px;">
                                <strong style="font-size:14px;">Frase:</strong><br/>
                                <div style="color: #666; margin: 5px 0; font-style: italic; 
                                            line-height: 1.4; max-height: 150px; overflow-y: auto;
                                            padding: 5px; background: #f9f9f9; border-radius: 4px;">
                                    "${fraseFormateada}"
                                </div>
                                <hr style="margin: 8px 0; border-color: #eee;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                    <span><strong>Autor:</strong> <b style="color: #2E5AAC;">${autor}</b></span>
                                    ${indicadorTipo}
                                </div>
                                <div><strong>Cluster:</strong> <b>${clusterId}</b> - ${etiquetaCluster}</div>
                                <div><strong>Coordenadas:</strong> ${coords}</div>
                                ${infoAdicional}
                            </div>
                        `;
                    },
                    trigger: 'item'
                },
                legend: {
                    ...LEGEND_STYLE,
                    top: 'bottom',
                    selectedMode: 'multiple',
                    type: legendData.length > 4 ? 'scroll' : 'plain',
                    orient: 'horizontal',
                    left: 'center',
                    width: '90%',
                    pageIconSize: 12,
                    pageButtonItemGap: 5,
                    pageButtonPosition: 'end',
                    pageTextStyle: { color: '#666' },
                    data: legendData
                },
                grid: {
                    top: 80,
                    bottom: 100,
                    left: 50,
                    right: 50,
                    containLabel: true
                },
                xAxis: {
                    name: 'PCA X',
                    nameLocation: 'middle',
                    nameGap: 25,
                    ...AXIS_STYLE,
                    min: minX,
                    max: maxX,
                    axisLabel: { show: false }
                },
                yAxis: {
                    name: 'PCA Y',
                    nameLocation: 'middle',
                    nameGap: 30,
                    ...AXIS_STYLE,
                    min: minY,
                    max: maxY,
                    axisLabel: { show: false }
                },
                series: series,
                backgroundColor: '#FFF'
            };

            if (totalPuntos > 20) {
                option.dataZoom = [
                    {
                        type: 'inside',
                        xAxisIndex: 0,
                        start: 0,
                        end: 100,
                        zoomOnMouseWheel: true
                    },
                    {
                        type: 'inside',
                        yAxisIndex: 0,
                        start: 0,
                        end: 100,
                        zoomOnMouseWheel: true
                    }
                ];
            }

            return option;
        }

        // Función para crear gráfico 3D
        function crearGrafico3D() {
            const { series, legendData } = crearSeries('3D');
            const numAutores = Object.keys(autoresAgrupados).length;
            
            const option = {
                title: {
                    text: 'Distribución PCA 3D por Autor',
                    left: 'center',
                    textStyle: TITLE_STYLE,
                    subtext: `Visualización 3D por autores (${totalPuntos} frases, ${numAutores} autores) | 
                             Políticos: ${puntosPoliticos}, No políticos: ${puntosNoPoliticos}, Ruido: ${puntosRuido}`,
                    subtextStyle: SUBTITLE_STYLE
                },
                tooltip: {
                    ...TOOLTIP_STYLE,
                    formatter: param => {
                        if (!param.data) return '';
                        const punto = param.data;
                        const frase = punto.fraseCompleta || punto.name;
                        const autor = punto.autor;
                        const esRuido = punto.esRuido;
                        const esNoPolitico = punto.esNoPolitico;
                        const esPolitico = punto.esPolitico;
                        const clusterId = punto.clusterId;
                        const etiquetaCluster = punto.etiquetaCluster;
                        
                        const formatearFrase = (texto) => {
                            const maxCaracteresPorLinea = 60;
                            if (texto.length <= maxCaracteresPorLinea) {
                                return texto;
                            }
                            
                            const palabras = texto.split(' ');
                            let lineas = [];
                            let lineaActual = '';
                            
                            for (const palabra of palabras) {
                                if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                    lineas.push(lineaActual);
                                    lineaActual = palabra;
                                } else {
                                    lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                                }
                            }
                            
                            if (lineaActual) {
                                lineas.push(lineaActual);
                            }
                            
                            return lineas.join('<br/>');
                        };
                        
                        const fraseFormateada = formatearFrase(frase);
                        
                        let indicadorTipo = '';
                        if (esRuido) {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #4f5e7b; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold; border: 1px solid #333;">
                                    Ruido (-1)
                                </div>
                            `;
                        } else if (esNoPolitico) {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #4f5e7b; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold;">
                                    No político
                                </div>
                            `;
                        } else {
                            indicadorTipo = `
                                <div style="display: inline-block; background: #2E5AAC; color: white; 
                                            padding: 2px 8px; border-radius: 10px; font-size: 11px; 
                                            margin-left: 8px; font-weight: bold;">
                                    Político
                                </div>
                            `;
                        }
                        
                        let infoAdicional = '';
                        if (esRuido) {
                            infoAdicional = `
                                <div style="margin-top: 5px; padding: 5px; background: #f8f8f8; border-radius: 4px; border-left: 3px solid #4f5e7b;">
                                    <small><strong>Nota:</strong> Punto identificado como ruido por DBSCAN.<br>
                                    Clasificado individualmente por el modelo.</small>
                                </div>
                            `;
                        }
                        
                        return `
                            <div style="max-width: 400px;">
                                <strong style="font-size:14px;">Frase:</strong><br/>
                                <div style="color: #666; margin: 5px 0; font-style: italic; 
                                            line-height: 1.4; max-height: 150px; overflow-y: auto;
                                            padding: 5px; background: #f9f9f9; border-radius: 4px;">
                                    "${fraseFormateada}"
                                </div>
                                <hr style="margin: 8px 0; border-color: #eee;">
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                    <span><strong>Autor:</strong> <b style="color: #2E5AAC;">${autor}</b></span>
                                    ${indicadorTipo}
                                </div>
                                <div><strong>Cluster:</strong> <b>${clusterId}</b> - ${etiquetaCluster}</div>
                                <div><strong>Coordenadas:</strong> 
                                    X: ${punto.value[0].toFixed(2)}, 
                                    Y: ${punto.value[1].toFixed(2)}, 
                                    Z: ${punto.value[2].toFixed(2)}
                                </div>
                                ${infoAdicional}
                            </div>
                        `;
                    },
                    trigger: 'item'
                },
                legend: {
                    ...LEGEND_STYLE,
                    top: 'bottom',
                    selectedMode: 'multiple',
                    type: legendData.length > 4 ? 'scroll' : 'plain',
                    orient: 'horizontal',
                    left: 'center',
                    width: '90%',
                    pageIconSize: 12,
                    pageButtonItemGap: 5,
                    pageButtonPosition: 'end',
                    pageTextStyle: { color: '#666', fontSize: 10 },
                    data: legendData
                },
                xAxis3D: {
                    name: 'PCA X',
                    type: 'value',
                    min: minX,
                    max: maxX,
                    nameTextStyle: { fontSize: 12, color: '#555' },
                    axisLine: { lineStyle: { color: '#888' } },
                    splitLine: { show: false },
                    axisLabel: { textStyle: { color: '#777', fontSize: 10 } }
                },
                yAxis3D: {
                    name: 'PCA Y',
                    type: 'value',
                    min: minY,
                    max: maxY,
                    nameTextStyle: { fontSize: 12, color: '#555' },
                    axisLine: { lineStyle: { color: '#888' } },
                    splitLine: { show: false },
                    axisLabel: { textStyle: { color: '#777', fontSize: 10 } }
                },
                zAxis3D: {
                    name: 'PCA Z',
                    type: 'value',
                    min: minZ,
                    max: maxZ,
                    nameTextStyle: { fontSize: 12, color: '#555' },
                    axisLine: { lineStyle: { color: '#888' } },
                    splitLine: { show: false },
                    axisLabel: { textStyle: { color: '#777', fontSize: 10 } }
                },
                grid3D: {
                    boxWidth: 100,
                    boxHeight: 100,
                    boxDepth: 100,
                    viewControl: {
                        projection: 'perspective',
                        autoRotate: totalPuntos > 50,
                        autoRotateSpeed: 8,
                        rotateSensitivity: 1,
                        zoomSensitivity: 1,
                        panSensitivity: 1,
                        distance: 180,
                        minDistance: 80,
                        maxDistance: 300,
                        alpha: 25,
                        beta: 40,
                        center: [0, 0, 0]
                    },
                    axisPointer: {
                        show: true,
                        lineStyle: { color: '#aaa', width: 1 }
                    },
                    axisLine: {
                        lineStyle: { color: '#ccc', width: 1 }
                    },
                    splitLine: {
                        show: true,
                        lineStyle: { color: '#e0e0e0', width: 0.5, type: 'dashed' }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: { color: ['rgba(250,250,250,0.2)', 'rgba(240,240,240,0.2)'] }
                    },
                    environment: '#fafafa',
                    light: {
                        main: { intensity: 1.2, shadow: true },
                        ambient: { intensity: 0.3 }
                    }
                },
                series: series,
                backgroundColor: '#FFF'
            };

            return option;
        }

        // Función para alternar entre vistas
        function toggleView() {
            is3DView = !is3DView;
            
            if (is3DView) {
                toggleButton.textContent = 'Cambiar a Vista 2D';
                chartInstance.setOption(crearGrafico3D(), true);
            } else {
                toggleButton.textContent = 'Cambiar a Vista 3D';
                chartInstance.setOption(crearGrafico2D(), true);
            }
        }

        // Inicializar gráfico en 2D
        chartInstance = echarts.init(graficoContainer);
        chartInstance.setOption(crearGrafico2D());

        // Configurar evento del botón
        toggleButton.addEventListener('click', toggleView);

        // Manejo de redimensionamiento
        const resizeHandler = () => {
            if (chartInstance && !chartInstance.isDisposed()) {
                chartInstance.resize();
            }
        };
        window.addEventListener('resize', resizeHandler);
        
        chartInstance._resizeHandler = resizeHandler;
        
        console.log(`✅ Gráfico por autores creado: ${Object.keys(autoresAgrupados).length} autores, ${totalPuntos} puntos`);
        console.log(`Puntos políticos: ${puntosPoliticos}, Puntos no políticos: ${puntosNoPoliticos}, Puntos ruido: ${puntosRuido}`);
        
        return chartInstance;
        
    } catch (error) {
        console.error("❌ Error en generarGraficoDispersionPorAutores:", error);
        
        // Mostrar error
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 400px; color: #f44336; padding: 20px;';
        errorDiv.innerHTML = `
            <div style="text-align: center;">
                <h3>Error al cargar gráfico por autores</h3>
                <p>${error.message}</p>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                    Verifica la consola para más detalles.
                </p>
            </div>
        `;
        contenedor.appendChild(errorDiv);
        
        throw error;
    }
}
// Grafico de dispersion economico

// Función para generar gráfico de dispersión por patrones económicos
function generarGraficoDispersionPorClustersEconomicos(embeddingsLatentes, asignacionClusters, interpretacion) {
    console.log("Iniciando gráfico por patrones económicos...");
    
    const contenedor = document.getElementById('grafico-general-descripcion');
    
    if (!contenedor) {
        console.error(`Contenedor ${'grafico-general-descripcion'} no encontrado`);
        return;
    }

    // Verificación robusta de instancia previa
    const existingChart = echarts.getInstanceByDom(contenedor);
    if (existingChart && !existingChart.isDisposed()) {
        existingChart.dispose();
    }

    // Crear contenedor con botón de alternancia
    contenedor.innerHTML = `
        <div id="grafico-economico-container" style="position: relative; width: 100%; height: 100%;">
            <div id="grafico-economico-echarts" style="width: 100%; height: 100%;"></div>
            <button id="toggle-2d-3d-economico" style="
                position: absolute;
                top: 30px;
                right: 10px;
                z-index: 100;
                border-radius: 4px;
                padding: 6px 12px;
                font-size: 12px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.3s;
            ">
                Cambiar a Vista 3D
            </button>
        </div>
    `;
    
    const graficoContainer = document.getElementById('grafico-economico-echarts');
    const toggleButton = document.getElementById('toggle-2d-3d-economico');
    
    // Variables para manejar el gráfico y estado 2D/3D
    let chartInstance = null;
    let is3DView = false; // Comienza en 2D
    let datosProcesados = null; // Para almacenar los datos procesados

    // PASO 1: Mapear las frases económicas de frases_asociadas
    const frasePatronMap = new Map(); // Map: frase -> {clusterId, patron, esEconomico}
    const todosLosPatrones = new Set(); // Todos los patrones únicos
    
    // Recorrer todos los clusters para mapear frases de frases_asociadas
    for (const clusterId in interpretacion) {
        const cluster = interpretacion[clusterId];
        const analisisEconomico = cluster?.analisis_economico;
        
        // Solo procesar si es económico y tiene frases_asociadas
        if (analisisEconomico?.es_economico === true && analisisEconomico.frases_asociadas) {
            const frasesAsociadas = analisisEconomico.frases_asociadas;
            
            // Para cada patrón en este cluster
            for (const [patron, frasesLista] of Object.entries(frasesAsociadas)) {
                todosLosPatrones.add(patron);
                
                // Para cada frase en este patrón
                frasesLista.forEach(frase => {
                    const fraseKey = frase.toLowerCase().trim();
                    frasePatronMap.set(fraseKey, {
                        clusterId: String(clusterId),
                        patron: patron,
                        esEconomico: true,
                        orientacion: analisisEconomico.orientacion || 'sin_orientacion'
                    });
                    console.log(`Frase económica mapeada: "${frase.substring(0, 50)}..." -> Patrón: ${patron}`);
                });
            }
        }
    }
    
    console.log(`Patrones económicos únicos encontrados:`, Array.from(todosLosPatrones));
    console.log(`Total de frases económicas mapeadas: ${frasePatronMap.size}`);

    // PASO 2: Procesar TODOS los embeddings (económicos y no económicos)
    const dataPorPatron = {}; // Agrupar por patrón (solo económicos)
    const dataNoEconomico = []; // Puntos no económicos
    let totalPuntosEconomicos = 0;
    let totalPuntosNoEconomicos = 0;
    
    // Variables para rangos (2D y 3D)
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    // Datos por cluster para estadísticas
    const clustersConEconomicos = new Set();
    const clustersTodos = new Set();
    
    for (const fraseKey in embeddingsLatentes) {
        const vector = embeddingsLatentes[fraseKey];
        const clusterId = asignacionClusters[fraseKey];
        
        if (!vector || vector.length < 2) continue;
        
        clustersTodos.add(clusterId);
        
        // Normalizar la frase para búsqueda
        const fraseNormalizada = fraseKey.toLowerCase().trim();
        
        // Buscar si es una frase económica
        const infoFrase = frasePatronMap.get(fraseNormalizada);
        
        const punto = {
            value: [vector[0], vector[1]], // 2D
            value3D: vector.length >= 3 ? [vector[0], vector[1], vector[2]] : [vector[0], vector[1], 0], // 3D
            name: fraseKey,
            clusterId: clusterId,
            fraseCompleta: fraseKey
        };
        
        if (infoFrase) {
            // Es una frase económica
            punto.patron = infoFrase.patron;
            punto.esEconomico = true;
            punto.orientacion = infoFrase.orientacion;
            
            // Agrupar por patrón
            if (!dataPorPatron[infoFrase.patron]) {
                dataPorPatron[infoFrase.patron] = [];
            }
            dataPorPatron[infoFrase.patron].push(punto);
            
            clustersConEconomicos.add(clusterId);
            totalPuntosEconomicos++;
        } else {
            // Es una frase no económica
            punto.patron = 'No económico';
            punto.esEconomico = false;
            punto.orientacion = null;
            
            dataNoEconomico.push(punto);
            totalPuntosNoEconomicos++;
        }
        
        // Calcular rangos para 2D
        minX = Math.min(minX, vector[0]);
        maxX = Math.max(maxX, vector[0]);
        minY = Math.min(minY, vector[1]);
        maxY = Math.max(maxY, vector[1]);
        
        // Calcular rangos para 3D (si existe tercera dimensión)
        if (vector.length >= 3) {
            minZ = Math.min(minZ, vector[2]);
            maxZ = Math.max(maxZ, vector[2]);
        }
    }

    console.log(`Frases económicas encontradas: ${totalPuntosEconomicos}`);
    console.log(`Frases no económicas encontradas: ${totalPuntosNoEconomicos}`);
    console.log(`Total frases: ${totalPuntosEconomicos + totalPuntosNoEconomicos}`);

    // Asegurar que haya un rango mínimo visible para 2D
    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    
    // Asegurar que haya un rango mínimo visible para 3D
    if (minZ === Infinity || maxZ === -Infinity) {
        minZ = -1; maxZ = 1; // Valores por defecto si no hay tercera dimensión
    }
    if (minZ === maxZ) { minZ -= 1; maxZ += 1; }
    
    // Añadir margen proporcional
    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const zRange = maxZ - minZ;
    const xMargin = xRange * 0.1;
    const yMargin = yRange * 0.1;
    const zMargin = zRange * 0.1;
    
    // Asegurar margen mínimo
    const minMargin = 0.5;
    minX -= Math.max(xMargin, minMargin);
    maxX += Math.max(xMargin, minMargin);
    minY -= Math.max(yMargin, minMargin);
    maxY += Math.max(yMargin, minMargin);
    minZ -= Math.max(zMargin, minMargin);
    maxZ += Math.max(zMargin, minMargin);

    // Calcular estadísticas
    const numClustersTotales = clustersTodos.size;
    const numClustersEconomicos = clustersConEconomicos.size;
    const patronesEconomicos = Array.from(todosLosPatrones);
    const numPatronesEconomicos = patronesEconomicos.length;

    // Paleta de colores para patrones
    const COLOR_PALETTE_PATRONES = [
    "#1E90FF", // azul
    "#FFD700", // amarillo
    "#32CD32", // verde
    "#FF0000", // rojo
    "#800080", // morado
    "#ff7505", // coral (extra)
    "#20B2AA"  // verde agua (extra)
    ];
    // Asignar colores a patrones económicos
    const patronColorMap = new Map();
    let colorIndex = 0;
    
    Array.from(todosLosPatrones).sort().forEach(patron => {
        patronColorMap.set(patron, COLOR_PALETTE_PATRONES[colorIndex % COLOR_PALETTE_PATRONES.length]);
        colorIndex++;
    });
    
    // Color para "No económico" (gris)
    patronColorMap.set('No económico', "#9aa6b2");

    // Almacenar datos procesados para reutilizar
    datosProcesados = {
        dataPorPatron,
        dataNoEconomico,
        patronColorMap,
        patronesEconomicos,
        numClustersTotales,
        numClustersEconomicos,
        numPatronesEconomicos,
        totalPuntosEconomicos,
        totalPuntosNoEconomicos,
        minX, maxX, minY, maxY, minZ, maxZ,
        interpretacion,
        frasePatronMap
    };

    // Función para crear series de datos (compatible con 2D y 3D)
    function crearSeries(tipo) {
        const series = [];
        
        // Primero, añadir series para cada patrón económico
        Object.entries(dataPorPatron).forEach(([patron, puntos]) => {
            const color = patronColorMap.get(patron);
            
            // Contar cuántos clusters tienen este patrón
            const clustersUnicos = new Set(puntos.map(p => p.clusterId));
            const numClusters = clustersUnicos.size;
            
            let etiqueta = `${patron} (${puntos.length} frases, ${numClusters} ${numClusters === 1 ? 'cluster' : 'clusters'})`;
            
            const baseSize = 10;
            const symbolSize = (totalPuntosEconomicos + totalPuntosNoEconomicos) > 300 ? baseSize * 0.7 : baseSize;
            
            series.push({
                name: etiqueta,
                type: tipo === '3D' ? 'scatter3D' : 'scatter',
                data: puntos.map(p => ({
                    value: tipo === '3D' ? p.value3D : p.value,
                    name: p.name,
                    clusterId: p.clusterId,
                    patron: p.patron,
                    esEconomico: p.esEconomico,
                    orientacion: p.orientacion,
                    fraseCompleta: p.fraseCompleta
                })),
                symbolSize: symbolSize,
                itemStyle: {
                    color: color,
                    borderWidth: 0,
                    opacity: 0.85
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                        opacity: 1,
                        borderColor: '#000',
                        borderWidth: 1
                    }
                }
            });
        });
        
        // Añadir serie para puntos no económicos (si existen)
        if (dataNoEconomico.length > 0) {
            series.push({
                name: `No económico (${dataNoEconomico.length} frases)`,
                type: tipo === '3D' ? 'scatter3D' : 'scatter',
                data: dataNoEconomico.map(p => ({
                    value: tipo === '3D' ? p.value3D : p.value,
                    name: p.name,
                    clusterId: p.clusterId,
                    patron: p.patron,
                    esEconomico: p.esEconomico,
                    orientacion: p.orientacion,
                    fraseCompleta: p.fraseCompleta
                })),
                symbolSize: (totalPuntosEconomicos + totalPuntosNoEconomicos) > 300 ? 7 : 8,
                itemStyle: {
                    color: patronColorMap.get('No económico'),
                    borderWidth: 0,
                    opacity: 0.4
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        opacity: 0.8,
                        borderColor: '#333',
                        borderWidth: 1
                    }
                }
            });
        }

        return series;
    }

    // Función para crear gráfico 2D
    function crearGrafico2D() {
        const series = crearSeries('2D');
        
        const option = {
            title: {
                text: 'Distribución PCA 2D por Frases con Contenido Económico',
                left: 'center',
                textStyle: TITLE_STYLE,
                subtext: `Visualización 2D (${totalPuntosEconomicos} frases económicas, ${totalPuntosNoEconomicos} no económicas, ${numClustersEconomicos}/${numClustersTotales} clusters con economía)`,
                subtextStyle: SUBTITLE_STYLE
            },
            tooltip: {
                ...TOOLTIP_STYLE,
                formatter: param => {
                    if (!param.data) return '';
                    
                    const frase = param.data.fraseCompleta || param.data.name;
                    const patron = param.data.patron;
                    const clusterId = param.data.clusterId;
                    const esEconomico = param.data.esEconomico;
                    const orientacion = param.data.orientacion;
                    
                    // Función para formatear frases largas
                    const formatearFrase = (texto) => {
                        const maxCaracteresPorLinea = 60;
                        if (texto.length <= maxCaracteresPorLinea) {
                            return texto;
                        }
                        
                        const palabras = texto.split(' ');
                        let lineas = [];
                        let lineaActual = '';
                        
                        for (const palabra of palabras) {
                            if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                lineas.push(lineaActual);
                                lineaActual = palabra;
                            } else {
                                lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                            }
                        }
                        
                        if (lineaActual) {
                            lineas.push(lineaActual);
                        }
                        
                        return lineas.join('<br/>');
                    };
                    
                    const fraseFormateada = formatearFrase(frase);
                    const necesitaMasLineas = frase.length > (60 * 3);
                    const colorPatron = patronColorMap.get(patron) || '#666';
                    
                    // Obtener información del cluster
                    const cluster = interpretacion[clusterId];
                    const analisisEconomico = cluster?.analisis_economico;
                    
                    let infoDetallada = '';
                    
                    if (esEconomico && analisisEconomico) {
                        infoDetallada = `
                            <div style="margin: 8px 0; padding: 10px; background: #e8f4fd; border-radius: 4px; border-left: 3px solid ${colorPatron};">
                                <strong style="color: #2E5AAC;">📊 Información del Patrón Económico:</strong><br/>
                                
                                <div style="margin-top: 6px;">
                                    <div style="display: flex; align-items: center;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px; margin-right: 5px;">Patrón:</span>
                                        <span style="background: ${colorPatron}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">
                                            ${patron}
                                        </span>
                                    </div>
                                </div>
                                
                                ${orientacion && orientacion !== 'sin_orientacion' ? `
                                    <div style="margin-top: 6px;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px;">Orientación:</span>
                                        <span style="margin-left: 5px; color: ${orientacion === 'izquierda' ? '#f48b3a' : orientacion === 'derecha' ? '#4d82ec' : '#666'}; font-weight: bold;">
                                            ${orientacion}
                                        </span>
                                    </div>
                                ` : ''}
                                
                                <div style="margin-top: 6px;">
                                    <span style="font-weight: bold; color: #444; font-size: 12px;">Cluster:</span>
                                    <span style="margin-left: 5px; color: #2E5AAC; font-weight: bold;">
                                        ${clusterId}
                                    </span>
                                </div>
                                
                                ${analisisEconomico?.score_total ? `
                                    <div style="margin-top: 6px;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px;">Score económico:</span>
                                        <span style="margin-left: 5px; color: #2E5AAC; font-weight: bold;">
                                            ${analisisEconomico.score_total.toFixed(1)}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    } else {
                        infoDetallada = `
                            <div style="margin: 8px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid ${colorPatron};">
                                <strong style="color: #666;">📊 Sin contenido económico identificado</strong>
                                <div style="margin-top: 5px; font-size: 11px; color: #777;">
                                    Esta frase no está asociada a patrones económicos específicos.
                                </div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div style="max-width: 500px;">
                            <strong style="font-size:14px; color: #2c3e50;">Frase:</strong><br/>
                            <div style="color: #666; margin: 5px 0; font-style: italic; 
                                        line-height: 1.4; padding: 5px; background: #f9f9f9; 
                                        border-radius: 4px; ${necesitaMasLineas ? 'max-height: 120px; overflow-y: auto;' : ''}">
                                "${fraseFormateada}"
                            </div>
                            ${necesitaMasLineas ? '<div style="font-size: 10px; color: #888; text-align: right; margin-top: 2px;">(scroll para ver más)</div>' : ''}
                            ${infoDetallada}
                            <hr style="margin: 10px 0; border-color: #eee;">
                            <div style="font-family: monospace; color: #444;">
                                X: <b>${param.data.value[0].toFixed(2)}</b><br/>
                                Y: <b>${param.data.value[1].toFixed(2)}</b>
                            </div>
                        </div>
                    `;
                },
                trigger: 'item'
            },
            legend: {
                ...LEGEND_STYLE,
                top: 'bottom',
                selectedMode: 'multiple',
                type: (numPatronesEconomicos + 1) > 3 ? 'scroll' : 'plain',
                orient: 'horizontal',
                left: 'center',
                width: '85%',
                pageIconSize: 12,
                pageButtonItemGap: 5,
                pageButtonPosition: 'end',
                pageTextStyle: {
                    color: '#666'
                },
                data: series.map(s => s.name)
            },
            grid: {
                top: 80,
                bottom: (numPatronesEconomicos + 1) > 3 ? 120 : 100,
                left: 50,
                right: 50,
                containLabel: true
            },
            xAxis: {
                name: 'PCA X',
                nameLocation: 'middle',
                nameGap: 25,
                ...AXIS_STYLE,
                min: minX,
                max: maxX,
                axisLabel: {
                    show: false
                }
            },
            yAxis: {
                name: 'PCA Y',
                nameLocation: 'middle',
                nameGap: 30,
                ...AXIS_STYLE,
                min: minY,
                max: maxY,
                axisLabel: {
                    show: false
                }
            },
            series: series,
            backgroundColor: '#FFF'
        };

        // Solo añadir zoom interno si hay bastantes puntos
        if ((totalPuntosEconomicos + totalPuntosNoEconomicos) > 20) {
            option.dataZoom = [
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true
                },
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    start: 0,
                    end: 100,
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true
                }
            ];
        }

        return option;
    }

    // Función para crear gráfico 3D
    function crearGrafico3D() {
        const series = crearSeries('3D');
        
        const option = {
            title: {
                text: 'Distribución PCA 3D por Frases con Contenido Económico',
                left: 'center',
                textStyle: TITLE_STYLE,
                subtext: `Visualización 3D (${totalPuntosEconomicos} frases económicas, ${totalPuntosNoEconomicos} no económicas, ${numClustersEconomicos}/${numClustersTotales} clusters con economía)`,
                subtextStyle: SUBTITLE_STYLE
            },
            tooltip: {
                ...TOOLTIP_STYLE,
                formatter: param => {
                    if (!param.data) return '';
                    
                    const frase = param.data.fraseCompleta || param.data.name;
                    const patron = param.data.patron;
                    const clusterId = param.data.clusterId;
                    const esEconomico = param.data.esEconomico;
                    const orientacion = param.data.orientacion;
                    
                    // Función para formatear frases largas
                    const formatearFrase = (texto) => {
                        const maxCaracteresPorLinea = 60;
                        if (texto.length <= maxCaracteresPorLinea) {
                            return texto;
                        }
                        
                        const palabras = texto.split(' ');
                        let lineas = [];
                        let lineaActual = '';
                        
                        for (const palabra of palabras) {
                            if ((lineaActual + ' ' + palabra).length > maxCaracteresPorLinea && lineaActual.length > 0) {
                                lineas.push(lineaActual);
                                lineaActual = palabra;
                            } else {
                                lineaActual = lineaActual ? lineaActual + ' ' + palabra : palabra;
                            }
                        }
                        
                        if (lineaActual) {
                            lineas.push(lineaActual);
                        }
                        
                        return lineas.join('<br/>');
                    };
                    
                    const fraseFormateada = formatearFrase(frase);
                    const colorPatron = patronColorMap.get(patron) || '#666';
                    
                    // Obtener información del cluster
                    const cluster = interpretacion[clusterId];
                    const analisisEconomico = cluster?.analisis_economico;
                    
                    let infoDetallada = '';
                    
                    if (esEconomico && analisisEconomico) {
                        infoDetallada = `
                            <div style="margin: 8px 0; padding: 10px; background: #e8f4fd; border-radius: 4px; border-left: 3px solid ${colorPatron};">
                                <strong style="color: #2E5AAC;">📊 Información del Patrón Económico:</strong><br/>
                                
                                <div style="margin-top: 6px;">
                                    <div style="display: flex; align-items: center;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px; margin-right: 5px;">Patrón:</span>
                                        <span style="background: ${colorPatron}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">
                                            ${patron}
                                        </span>
                                    </div>
                                </div>
                                
                                ${orientacion && orientacion !== 'sin_orientacion' ? `
                                    <div style="margin-top: 6px;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px;">Orientación:</span>
                                        <span style="margin-left: 5px; color: ${orientacion === 'izquierda' ? '#f48b3a' : orientacion === 'derecha' ? '#4d82ec' : '#666'}; font-weight: bold;">
                                            ${orientacion}
                                        </span>
                                    </div>
                                ` : ''}
                                
                                <div style="margin-top: 6px;">
                                    <span style="font-weight: bold; color: #444; font-size: 12px;">Cluster:</span>
                                    <span style="margin-left: 5px; color: #2E5AAC; font-weight: bold;">
                                        ${clusterId}
                                    </span>
                                </div>
                                
                                ${analisisEconomico?.score_total ? `
                                    <div style="margin-top: 6px;">
                                        <span style="font-weight: bold; color: #444; font-size: 12px;">Score económico:</span>
                                        <span style="margin-left: 5px; color: #2E5AAC; font-weight: bold;">
                                            ${analisisEconomico.score_total.toFixed(1)}
                                        </span>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    } else {
                        infoDetallada = `
                            <div style="margin: 8px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; border-left: 3px solid ${colorPatron};">
                                <strong style="color: #666;">📊 Sin contenido económico identificado</strong>
                                <div style="margin-top: 5px; font-size: 11px; color: #777;">
                                    Esta frase no está asociada a patrones económicos específicos.
                                </div>
                            </div>
                        `;
                    }
                    
                    return `
                        <div style="max-width: 500px;">
                            <strong style="font-size:14px; color: #2c3e50;">Frase:</strong><br/>
                            <div style="color: #666; margin: 5px 0; font-style: italic; 
                                        line-height: 1.4; max-height: 150px; overflow-y: auto;
                                        padding: 5px; background: #f9f9f9; border-radius: 4px;">
                                "${fraseFormateada}"
                            </div>
                            ${infoDetallada}
                            <hr style="margin: 10px 0; border-color: #eee;">
                            <div style="font-family: monospace; color: #444; font-size: 12px;">
                                X: <b>${param.data.value[0].toFixed(2)}</b><br/>
                                Y: <b>${param.data.value[1].toFixed(2)}</b><br/>
                                Z: <b>${param.data.value[2].toFixed(2)}</b>
                            </div>
                        </div>
                    `;
                },
                trigger: 'item'
            },
            legend: {
                ...LEGEND_STYLE,
                top: 'bottom',
                selectedMode: 'multiple',
                type: (numPatronesEconomicos + 1) > 3 ? 'scroll' : 'plain',
                orient: 'horizontal',
                left: 'center',
                width: '85%',
                pageIconSize: 12,
                pageButtonItemGap: 5,
                pageButtonPosition: 'end',
                pageTextStyle: { color: '#666', fontSize: 10 },
                data: series.map(s => s.name)
            },
            xAxis3D: {
                name: 'PCA X',
                type: 'value',
                min: minX,
                max: maxX,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            yAxis3D: {
                name: 'PCA Y',
                type: 'value',
                min: minY,
                max: maxY,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            zAxis3D: {
                name: 'PCA Z',
                type: 'value',
                min: minZ,
                max: maxZ,
                nameTextStyle: { fontSize: 12, color: '#555' },
                axisLine: { lineStyle: { color: '#888', width: 2 } },
                splitLine: { show: true, lineStyle: { color: '#eee', width: 0.5, type: 'solid' } },
                axisLabel: { textStyle: { color: '#777', fontSize: 10 } },
                grid3D: { show: true }
            },
            grid3D: {
                boxWidth: 100,
                boxHeight: 100,
                boxDepth: 100,
                viewControl: {
                    projection: 'perspective',
                    autoRotate: (totalPuntosEconomicos + totalPuntosNoEconomicos) > 50,
                    autoRotateSpeed: 8,
                    rotateSensitivity: 1,
                    zoomSensitivity: 1,
                    panSensitivity: 1,
                    distance: 180,
                    minDistance: 80,
                    maxDistance: 300,
                    alpha: 25,
                    beta: 40,
                    center: [0, 0, 0]
                },
                axisPointer: {
                    show: true,
                    lineStyle: { color: '#aaa', width: 1 }
                },
                axisLine: {
                    lineStyle: { color: '#ccc', width: 1 }
                },
                splitLine: {
                    show: true,
                    lineStyle: { color: '#e0e0e0', width: 0.5, type: 'dashed' }
                },
                splitArea: {
                    show: true,
                    areaStyle: { color: ['rgba(250,250,250,0.2)', 'rgba(240,240,240,0.2)'] }
                },
                environment: '#fafafa',
                light: {
                    main: { intensity: 1.2, shadow: true },
                    ambient: { intensity: 0.3 }
                }
            },
            series: series,
            backgroundColor: '#FFF'
        };

        return option;
    }

    // Función para alternar entre vistas
    function toggleView() {
        is3DView = !is3DView;
        
        if (is3DView) {
            toggleButton.textContent = 'Cambiar a Vista 2D';
            chartInstance.setOption(crearGrafico3D(), true);
        } else {
            toggleButton.textContent = 'Cambiar a Vista 3D';
            chartInstance.setOption(crearGrafico2D(), true);
        }
    }

    // Inicializar gráfico en 2D
    chartInstance = echarts.init(graficoContainer);
    chartInstance.setOption(crearGrafico2D());

    // Configurar evento del botón
    toggleButton.addEventListener('click', toggleView);

    // Manejo de redimensionamiento
    const resizeHandler = () => {
        if (chartInstance && !chartInstance.isDisposed()) {
            chartInstance.resize();
        }
    };
    window.addEventListener('resize', resizeHandler);

    console.log(`✅ Gráfico de frases económicas creado: ${totalPuntosEconomicos} frases económicas, ${totalPuntosNoEconomicos} no económicas, ${numClustersEconomicos}/${numClustersTotales} clusters con economía`);
    
    return {
        chart: chartInstance,
        resizeHandler: resizeHandler,
        frasePatronMap: frasePatronMap,
        patronColorMap: patronColorMap,
        dataPorPatron: dataPorPatron,
        dataNoEconomico: dataNoEconomico,
        toggleView: toggleView
    };
}
//
function generarGraficoDistribucionArchivos(archivos_vocabularios) {
    const contenedor = document.getElementById('grafico-secundario-descripcion');
    
    if (!contenedor) {
        console.error(`Contenedor ${'grafico-secundario-descripcion'} no encontrado`);
        return;
    }

    // Verificación robusta de instancia previa
    const existingChart = echarts.getInstanceByDom(contenedor);
    if (existingChart && !existingChart.isDisposed()) {
        existingChart.dispose();
    }
    
    // Limpia contenido HTML y crea nuevo gráfico
    contenedor.innerHTML = ""; 
    const chart = echarts.init(contenedor);
    
    // Procesar datos con asignación de colores
    const datos = archivos_vocabularios
        .filter(archivo => Array.isArray(archivo.vocabulario))
        .map((archivo, index) => {
            const colorIndex = index % COLOR_PALETTE.length;
            return {
                name: archivo.titulo.length > 25 ? 
                     archivo.titulo.substring(0, 25) + '...' : 
                     archivo.titulo,
                value: archivo.vocabulario.length,
                tituloCompleto: archivo.titulo,
                itemStyle: {
                    color: COLOR_PALETTE[colorIndex],
                    borderColor: '#FFF',
                    borderWidth: 1
                }
            };
        })
        .sort((a, b) => b.value - a.value); // Ordenar de mayor a menor

    // Determinar si hay más de 5 archivos para añadir scroll
    const hayMuchosArchivos = datos.length > 5;
    const barWidth = hayMuchosArchivos ? '40%' : '60%'; // Barras más delgadas si hay muchos
    
    // Configuración base del gráfico
    const opciones = {
        title: {
            text: 'Distribución de Frases por Documento',
            left: 'center',
            textStyle: TITLE_STYLE,
            subtext: `Cantidad de términos únicos por archivo (${datos.length} archivos)`,
            subtextStyle: SUBTITLE_STYLE   
        },
        grid: {
            top: 100, 
            bottom: hayMuchosArchivos ? 90 : 60, // Más espacio abajo para el scroll
            left: datos.length > 10 ? 80 : 60, // Más espacio izquierdo si hay muchos nombres
            right: 40
        },
        tooltip: {
            ...TOOLTIP_STYLE,
            formatter: params => {
                if (!params.data) return '';
                return `
                    <strong>${params.data.tituloCompleto || params.name}</strong><br/>
                    Palabras: <b>${params.value || params.data.value}</b>
                `;
            }
        },
        xAxis: {
            type: 'category',
            data: datos.map(d => d.name),
            nameLocation: 'middle',
            nameGap: 30,
            ...AXIS_STYLE,
            // Si hay muchos archivos, rotar etiquetas para mejor visualización
            axisLabel: {
                ...AXIS_STYLE.axisLabel,
                rotate: hayMuchosArchivos && datos.length > 8 ? 45 : 0,
                interval: 0, // Mostrar todas las etiquetas
                margin: hayMuchosArchivos ? 12 : 8,
                fontSize: hayMuchosArchivos && datos.length > 10 ? 10 : 12
            }
        },
        yAxis: {
            type: 'value',
            name: 'Cantidad de Frases',
            nameLocation: 'middle',
            nameGap: 30,
            ...AXIS_STYLE
        },
        series: [{
            name: 'Palabras',
            type: 'bar',
            data: datos,
            barWidth: barWidth,
            itemStyle: {
                borderRadius: [4, 4, 0, 0]
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
            },
            label: {
                show: true,
                position: 'top',
                color: '#2E5AAC',
                fontWeight: 'bold',
                fontSize: hayMuchosArchivos ? 10 : 11,
                formatter: '{c}'
            }
        }],
        backgroundColor: '#FFF'
    };

    // AGREGAR SCROLL HORIZONTAL SI HAY MÁS DE 5 ARCHIVOS
    if (hayMuchosArchivos) {
        opciones.dataZoom = [
            {
                type: 'slider', // Slider para navegación manual
                show: true,
                xAxisIndex: 0,
                left: '10%',
                right: '10%',
                bottom: 20,
                height: 25,
                borderColor: 'transparent',
                backgroundColor: '#e9ecef',
                fillerColor: 'rgba(77, 130, 236, 0.2)',
                handleStyle: {
                    color: '#4D82EC',
                    borderColor: '#2E5AAC'
                },
                textStyle: {
                    color: '#2E5AAC'
                },
                start: 0,
                end: Math.min(100, (5 / datos.length) * 100) // Mostrar máximo 5 archivos inicialmente
            },
            {
                type: 'inside', // Zoom con rueda del mouse
                xAxisIndex: 0,
                zoomOnMouseWheel: true,
                moveOnMouseMove: true,
                start: 0,
                end: Math.min(100, (5 / datos.length) * 100)
            }
        ];
        
        // Añadir indicador visual del scroll
        opciones.title.subtext += ' • Usa el scroll para navegar';
    }

    // Establecer opciones y renderizar
    chart.setOption(opciones);

    // Manejar redimensionamiento
    window.addEventListener('resize', function() {
        chart.resize();
    });

    // Opcional: Añadir botón para resetear vista
    if (hayMuchosArchivos) {
        setTimeout(() => {
            const resetButton = document.createElement('button');
            resetButton.innerHTML = '<i class="fas fa-expand-arrows-alt"></i> Ver todos';
            resetButton.style.cssText = `
                position: absolute;
                bottom: 55px;
                right: 20px;
                background: #4D82EC;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                z-index: 1000;
                opacity: 0.8;
                transition: opacity 0.3s;
            `;
            resetButton.onmouseover = () => resetButton.style.opacity = '1';
            resetButton.onmouseout = () => resetButton.style.opacity = '0.8';
            resetButton.onclick = () => {
                chart.dispatchAction({
                    type: 'dataZoom',
                    start: 0,
                    end: 100
                });
            };
            contenedor.appendChild(resetButton);
        }, 100);
    }

    return chart;
}
//
function generarGraficoDistribucionClusters(interpretacion_ideologica) {
    const contenedor = document.getElementById('grafico-secundario-descripcion');
    
    if (!contenedor) {
        console.error(`Contenedor ${'grafico-secundario-descripcion'} no encontrado`);
        return;
    }

    // Verificación robusta de instancia previa
    const existingChart = echarts.getInstanceByDom(contenedor);
    if (existingChart && !existingChart.isDisposed()) {
        existingChart.dispose();
    }

    contenedor.innerHTML = ""; // Limpia contenido HTML
    const chart = echarts.init(contenedor);

    // Procesar datos
    const clusters = Object.entries(interpretacion_ideologica).map(([clusterId, datos]) => {
        return {
            id: clusterId,
            ideologia: datos.ideologia.toLowerCase() || 'default',
            cantidadPalabras: datos.palabras.length,
            palabras: datos.palabras
        };
    });

    // Agrupar por ideología
    const ideologias = [...new Set(clusters.map(c => c.ideologia))];
    
    // DEFINIR PALETA DE COLORES ESPECÍFICA
    const COLORES_IDEOLOGIA = {
        'izquierda': '#f48b3aff',     // Naranja
        'derecha': '#4d82ecff',       // Azul
        'neutral': '#a0aec0ff',       // Gris claro
        'no_politico': '#000000',     // Negro
        'no político': '#000000',     // Negro (alternativa)
        'desconocido': '#4f5e7bff',   // Gris oscuro (para valores por defecto)
        'default': '#4f5e7bff'        // Gris oscuro
    };
    
    // Configuración de series para área apilada con colores específicos
    const seriesData = ideologias.map(ideologia => {
        // Determinar color según ideología (case-insensitive)
        const ideologiaKey = ideologia.toLowerCase();
        let color;
        
        if (ideologiaKey.includes('izquierda')) {
            color = COLORES_IDEOLOGIA.izquierda;
        } else if (ideologiaKey.includes('derecha')) {
            color = COLORES_IDEOLOGIA.derecha;
        } else if (ideologiaKey.includes('neutral')) {
            color = COLORES_IDEOLOGIA.neutral;
        } else if (ideologiaKey.includes('no_politico') || ideologiaKey.includes('no político')) {
            color = COLORES_IDEOLOGIA.no_politico;
        } else {
            color = COLORES_IDEOLOGIA[ideologiaKey] || COLORES_IDEOLOGIA.default;
        }
        
        // Formatear nombre para mostrar
        let nombreDisplay;
        if (ideologiaKey.includes('no_politico') || ideologiaKey.includes('no político')) {
            nombreDisplay = 'No político';
        } else {
            nombreDisplay = ideologia.charAt(0).toUpperCase() + ideologia.slice(1);
        }
        
        return {
            name: nombreDisplay,
            type: 'line',
            stack: 'total',
            areaStyle: {
                color: color,
                opacity: 0.7
            },
            lineStyle: {
                width: 1.5,
                color: color
            },
            symbol: 'circle',
            symbolSize: 6,
            data: clusters.map(cluster => {
                return cluster.ideologia.toLowerCase() === ideologiaKey ? cluster.cantidadPalabras : 0;
            }),
            emphasis: {
                focus: 'series',
                lineStyle: {
                    width: 2.5
                },
                areaStyle: {
                    opacity: 0.9
                }
            }
        };
    });

    // Configuración del gráfico
    const opciones = {
        title: {
            text: 'Distribución de Frases por Cluster Ideológico',
            left: 'center',
            textStyle: TITLE_STYLE,
            subtext: 'Cantidad de frases por agrupación ideológica',
            subtextStyle: SUBTITLE_STYLE    
        },
        grid: {
            top: 100, 
            bottom: 60,
            left: 60,
            right: 40
        },
        tooltip: {
            trigger: 'axis',
            ...TOOLTIP_STYLE, 
            axisPointer: {
                type: 'cross'
            },
            formatter: function(params) {
                let tooltip = `<b>Cluster ${params[0].axisValue}</b><br/>`;
                let total = 0;
                
                params.forEach(param => {
                    if (param.value > 0) {
                        tooltip += `
                            <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color}"></span>
                            ${param.seriesName}: <b>${param.value}</b> palabras<br/>
                        `;
                        total += param.value;
                    }
                });
                
                tooltip += `<hr style="margin:5px 0"><strong>Total: ${total} palabras</strong>`;
                return tooltip;
            }
        },
        legend: {
            data: seriesData.map(s => s.name),
            right: 10,
            top: 'center',
            orient: 'vertical',
            textStyle: {
                fontSize: 12,
                color: '#555',
                fontFamily: 'Arial, sans-serif'
            },
            itemWidth: 14,
            itemHeight: 14,
            itemGap: 10
        },
        xAxis: {
            type: 'category',
            nameLocation: 'middle',
            nameGap: 30,
            ...AXIS_STYLE,
            data: clusters.map(c => `Cluster ${c.id}`),
        },
        yAxis: {
            type: 'value',
            name: 'Cantidad de Frases',
            nameLocation: 'middle',
            nameGap: 30,
            ...AXIS_STYLE,
        },
        series: seriesData,
        backgroundColor: '#FFF'
    };

    chart.setOption(opciones);
    
    // Manejar redimensionamiento
    window.addEventListener('resize', function() {
        chart.resize();
    });
    
    return chart;
}

//Grafico para el informe detallado

//Informe
function generarGraficoPorcentajeCluster(porcentaje) {
  const contenedor = document.getElementById("grafico-porcentaje-cluster");
  if (!contenedor) {
    console.error("Contenedor #grafico-porcentaje-cluster no encontrado");
    return;
  }

  // Eliminar instancia previa si existe
  const existingChart = echarts.getInstanceByDom(contenedor);
  if (existingChart && !existingChart.isDisposed()) {
    existingChart.dispose();
  }

  contenedor.innerHTML = ""; 
  const chart = echarts.init(contenedor);

  // FUNCIÓN PARA FORMATEAR PORCENTAJES CON MÁXIMO 3 DECIMALES
  function formatearPorcentaje(valor, mostrarSimbolo = true) {
    // Redondear a máximo 3 decimales
    const redondeado = Math.round(valor * 1000) / 1000;
    
    // Formatear: eliminar ceros decimales innecesarios
    const partes = redondeado.toString().split('.');
    if (partes.length === 1) {
      // Entero
      return mostrarSimbolo ? `${redondeado}%` : redondeado.toString();
    } else {
      // Tiene decimales
      const decimales = partes[1];
      // Mantener solo dígitos significativos (eliminar ceros a la derecha)
      const decimalesSignificativos = decimales.replace(/0+$/, '');
      
      if (decimalesSignificativos === '') {
        // Todos los decimales eran ceros
        return mostrarSimbolo ? `${partes[0]}%` : partes[0];
      } else {
        // Mantener máximo 3 decimales, pero eliminar ceros finales
        const decimalesFinal = decimalesSignificativos.length > 3 ? 
          decimalesSignificativos.substring(0, 3) : decimalesSignificativos;
        return mostrarSimbolo ? `${partes[0]}.${decimalesFinal}%` : `${partes[0]}.${decimalesFinal}`;
      }
    }
  }

  // Calcular porcentajes formateados
  const porcentajeOcupado = porcentaje;
  const porcentajeLibre = 100 - porcentaje;
  
  const porcentajeOcupadoFormateado = formatearPorcentaje(porcentajeOcupado, false);
  const porcentajeLibreFormateado = formatearPorcentaje(porcentajeLibre, false);

  const opciones = {
    series: [{
      type: 'pie',
      radius: ['75%', '95%'],
      avoidLabelOverlap: false,
      label: { 
        show: false 
      },
      labelLine: { 
        show: false 
      },
      emphasis: {
        scale: false,
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      },
      data: [
        {
          value: porcentajeOcupado, // Valor numérico original para cálculos
          name: 'Ocupado',
          itemStyle: {
            color: '#f48b3a',
            borderRadius: 10,
            borderWidth: 0
          }
        },
        {
          value: porcentajeLibre, // Valor numérico original para cálculos
          name: 'Libre',
          itemStyle: {
            color: '#152d5ee3',
            borderWidth: 0
          }
        }
      ]
    }]
  };

  chart.setOption(opciones);

  // Añadir número centrado con formato
  const centro = document.createElement("div");
  centro.className = "porcentaje-centro";
  centro.textContent = formatearPorcentaje(porcentajeOcupado);
  contenedor.appendChild(centro);

  // Actualizar estadísticas si existen
  document.querySelectorAll('.estadistica .valor').forEach((el, index) => {
    if (index === 0) {
      el.textContent = formatearPorcentaje(porcentajeOcupado);
    } else {
      el.textContent = formatearPorcentaje(porcentajeLibre);
    }
  });

  // Manejar redimensionamiento
  window.addEventListener('resize', function() {
    chart.resize();
  });

  return chart;
}
//
function generarGraficoSankeyCluster(interpretacion, clusterId) {
  const contenedor = document.getElementById("grafico-general-informe");
  if (!contenedor) return;

  if (echarts.getInstanceByDom(contenedor)) {
    echarts.dispose(echarts.getInstanceByDom(contenedor));
  }
  contenedor.innerHTML = ""; 
  const chart = echarts.init(contenedor);

  const linksMap = new Map();
  const nodesSet = new Set();
  const clusterIdeologias = {};
  const archivoColores = {};
  const clusterNodes = {}; // Para agrupar nodos por cluster
  
  // Contar clusters y determinar si necesitamos paginación
  const totalClusters = Object.keys(interpretacion).length;
  const hayMuchosClusters = totalClusters > 4; // Cambiado a 4
  
  let colorIndex = 0;

  // Procesar TODOS los clusters siempre
  Object.entries(interpretacion).forEach(([id, data]) => {
    const clusterLabel = `Cluster ${id} (${data.ideologia})`;
    clusterIdeologias[`Cluster ${id}`] = clusterLabel;
    clusterNodes[clusterLabel] = []; // Inicializar array para este cluster
    
    nodesSet.add(clusterLabel);
    clusterNodes[clusterLabel].push(clusterLabel); // Añadir cluster a su propio grupo

    data.palabras.forEach(({ origen }) => {
      const origenes = Array.isArray(origen) ? origen : [origen];
      origenes.forEach(titulo => {
        const truncatedTitulo = titulo.length > 40 ? titulo.slice(0, 37) + "..." : titulo;
        nodesSet.add(truncatedTitulo);
        clusterNodes[clusterLabel].push(truncatedTitulo); // Añadir archivo al grupo del cluster

        const key = `${truncatedTitulo}→${clusterLabel}`;
        linksMap.set(key, (linksMap.get(key) || 0) + 1);

        if (!archivoColores[truncatedTitulo]) {
          archivoColores[truncatedTitulo] = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];
          colorIndex++;
        }
      });
    });
  });

  // Convertir a arrays para manipulación
  const nodesArray = Array.from(nodesSet);
  const clusterEntries = Object.entries(clusterNodes);
  
  // Determinar qué clusters mostrar inicialmente 
  const clustersPorPagina = 3; 
  let paginaActual = 0;
  
  // Encontrar en qué página está el cluster seleccionado
  const selectedClusterLabel = `Cluster ${clusterId} (${interpretacion[clusterId]?.ideologia})`;
  const selectedClusterIndex = clusterEntries.findIndex(([label]) => label === selectedClusterLabel);
  if (selectedClusterIndex !== -1) {
    paginaActual = Math.floor(selectedClusterIndex / clustersPorPagina);
  }
  
  // Filtrar nodos a mostrar según página actual
  const inicio = paginaActual * clustersPorPagina;
  const fin = inicio + clustersPorPagina;
  const clustersAMostrar = clusterEntries.slice(inicio, fin);
  
  // Crear conjunto de nodos visibles
  const nodosVisibles = new Set();
  clustersAMostrar.forEach(([, nodos]) => {
    nodos.forEach(nodo => nodosVisibles.add(nodo));
  });

  const links = [];
  linksMap.forEach((value, key) => {
    const [source, target] = key.split("→");
    
    // Solo incluir conexiones donde ambos nodos sean visibles
    if (nodosVisibles.has(source) && nodosVisibles.has(target)) {
      // Determinar si esta conexión va al cluster seleccionado
      const isActive = target === selectedClusterLabel;
      
      links.push({
        source,
        target,
        value,
        lineStyle: {
          color: archivoColores[source] || "#2a6ca3",
          opacity: isActive ? 1 : 0.15 // Cluster seleccionado: 100%, otros: 15%
        }
      });
    }
  });

  const nodes = Array.from(nodosVisibles).map(name => {
    // Determinar si este nodo es el cluster seleccionado
    const isActive = name === selectedClusterLabel;
    
    return {
      name: name,
      itemStyle: {
        color: archivoColores[name] || "#2a6ca3",
        opacity: isActive ? 1 : 0.6 // Cluster seleccionado: 100%, otros: 60%
      },
      label: {
        fontSize: hayMuchosClusters ? 10 : 11,
        fontWeight: isActive ? 'bold' : 'normal',
        color: isActive ? '#2E5AAC' : '#666',
        overflow: "truncate",
        ellipsis: "...",
        width: hayMuchosClusters ? 100 : 120
      }
    };
  });

  // Determinar título
  const tituloGrafico = 'Flujo de palabras por clúster';
  const subtitulo = `Mostrando clusters ${inicio + 1}-${Math.min(fin, totalClusters)} de ${totalClusters} totales`;

  // Configuración base
  const opciones = {
    backgroundColor: "#ffffff",  
    title: {
      text: tituloGrafico,
      left: 'center',
      textStyle: TITLE_STYLE,
      subtext: subtitulo,
      subtextStyle: SUBTITLE_STYLE
    },
    grid: {
      top: 100,   
      bottom: hayMuchosClusters ? 70 : 60, // Menos espacio abajo
      left: 60,
      right: 40
    },
    tooltip: { 
      trigger: "item",
      ...TOOLTIP_STYLE,
      formatter: function(params) {
        if (params.dataType === 'node') {
          const isSelected = params.name === selectedClusterLabel;
          const enfasis = isSelected ? '<span style="color:#f48b3a;">★ Seleccionado</span><br/>' : '';
          return `${enfasis}<strong>${params.name}</strong>`;
        } else if (params.dataType === 'edge') {
          const isSelected = params.data.target === selectedClusterLabel;
          const enfasis = isSelected ? '<span style="color:#f48b3a;">→ Cluster seleccionado</span><br/>' : '';
          return `${enfasis}<strong>${params.data.source} → ${params.data.target}</strong><br/>
                  <span style="color:#666;">Flujo: ${params.data.value} palabra(s)</span>`;
        }
        return params.name;
      }
    },
    series: [{
      type: "sankey",
      layout: "none",
      top: 50,
      left: '10%',
      right: '10%',
      bottom: hayMuchosClusters ? 30 : 20,
      data: nodes,
      links: links,
      emphasis: { focus: "adjacency" },
      lineStyle: { 
        curveness: 0.3,
        width: 1.5
      },
      nodeWidth: 12,
      nodeGap: 20,
      label: {
        fontSize: 11,
        overflow: "truncate",
        ellipsis: "...",
        width: 120,
        position: 'right',
        distance: 8
      },
      draggable: true
    }]
  };

  chart.setOption(opciones);
  // Manejar redimensionamiento
  window.addEventListener('resize', function() {
    chart.resize();
  });
  
  return chart;
}
//
function generarNubeFrasesRepresentativas(clusterId, interpretacion) {
  const contenedor = document.getElementById("grafico-general-informe");
  if (!contenedor) return;

  if (echarts.getInstanceByDom(contenedor)) {
    echarts.dispose(echarts.getInstanceByDom(contenedor));
  }

  const frases = interpretacion[clusterId]?.palabras_representativas || [];
  if (frases.length === 0) {
    contenedor.innerHTML = "<p style='text-align:center;'>No hay frases representativas disponibles para este clúster.</p>";
    return;
  }

  // 1. Extraer todas las palabras de las frases
  const palabrasContador = new Map();
  
  frases.forEach((frase) => {
    const palabras = frase.toLowerCase()
      .replace(/[.,!?;:()"'-]/g, '')
      .split(/\s+/)
      .filter(palabra => palabra.length > 2);
    
    palabras.forEach(palabra => {
      if (!palabrasContador.has(palabra)) {
        palabrasContador.set(palabra, 0);
      }
      palabrasContador.set(palabra, palabrasContador.get(palabra) + 1);
    });
  });

  // 2. Convertir a formato para ECharts
  const datosNube = Array.from(palabrasContador.entries()).map(([palabra, count], index) => ({
    name: palabra,
    value: count * 30 + 20,
    textStyle: {
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      fontFamily: 'Arial, sans-serif',
      fontWeight: count > 2 ? 'bold' : 'normal'
    }
  }));
  contenedor.innerHTML = ""; 
  const chart = echarts.init(contenedor);

  const opciones = {
    title: {
      text: `Palabras Clave - Clúster ${clusterId}`,
      left: 'center',
      textStyle: TITLE_STYLE,
      subtext: `${palabrasContador.size} palabras únicas de ${frases.length} frases`,
      subtextStyle: SUBTITLE_STYLE
    },
    tooltip: {
      trigger: 'item',
      formatter: params => {
        return `<div style="text-align:center">
                  <strong style="font-size:14px">${params.name}</strong><br/>
                  <span style="color:#666">Frecuencia: ${Math.round((params.value - 20) / 30)}</span>
                </div>`;
      }
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '95%',
      height: '90%',
      gridSize: 6,
      sizeRange: [40, 100],
      rotationRange: [-30, 30],
      rotationStep: 30,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold'
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 15,
          shadowColor: '#333'
        }
      },
      data: datosNube
    }],
    backgroundColor: '#FFF'
  };

  // Ajustes según cantidad de palabras
  const totalPalabras = palabrasContador.size;
  if (totalPalabras <= 15) {
    opciones.series[0].sizeRange = [25, 90];
    opciones.series[0].gridSize = 8;
  } else if (totalPalabras <= 30) {
    opciones.series[0].sizeRange = [20, 70];
    opciones.series[0].gridSize = 6;
  } else {
    opciones.series[0].sizeRange = [18, 60];
    opciones.series[0].gridSize = 5;
  }

  chart.setOption(opciones);

  window.addEventListener('resize', function() {
    chart.resize();
  });
}

//
// ========== FUNCIÓN PRINCIPAL PARA MOSTRAR ANÁLISIS ECONÓMICO ==========

function mostrarAnalisisEconomicoParaCluster(clusterId, interpretacion) {
    console.log(`Mostrando análisis económico para cluster ${clusterId}`);
    
    // Verificar si el contenedor existe ya
    const estadoVacio = document.getElementById('estado-vacio-temas');
    const estadoNoEconomico = document.getElementById('estado-no-economico');
    const contenedorAnalisis = document.getElementById('contenedor-analisis-economico');
    
    // Si NO existen los elementos, esperar a que se creen
    if (!estadoVacio || !estadoNoEconomico || !contenedorAnalisis) {
        console.log('Elementos económicos aún no disponibles - esperando creación...');
        
        // Esperar a que el DOM se actualice
        setTimeout(() => {
            // Intentar nuevamente después de un tiempo
            const estadoVacioNuevo = document.getElementById('estado-vacio-temas');
            const estadoNoEconomicoNuevo = document.getElementById('estado-no-economico');
            const contenedorAnalisisNuevo = document.getElementById('contenedor-analisis-economico');
            
            if (estadoVacioNuevo && estadoNoEconomicoNuevo && contenedorAnalisisNuevo) {
                // Ahora sí existen, proceder con la lógica
                ejecutarAnalisisEconomico(clusterId, interpretacion);
            } else {
                // Si aún no existen, esperar más tiempo o mostrar error
                console.error('Elementos económicos no se han creado después del timeout');
            }
        }, 300); // Aumentar a 300ms
        
        return; // Salir de la función original
    }
    
    // Si los elementos existen, ejecutar directamente
    ejecutarAnalisisEconomico(clusterId, interpretacion);
}

// Función separada para la lógica del análisis económico
function ejecutarAnalisisEconomico(clusterId, interpretacion) {
    const estadoVacio = document.getElementById('estado-vacio-temas');
    const estadoNoEconomico = document.getElementById('estado-no-economico');
    const contenedorAnalisis = document.getElementById('contenedor-analisis-economico');
    
    // Verificar nuevamente que existen
    if (!estadoVacio || !estadoNoEconomico || !contenedorAnalisis) {
        console.error('Elementos económicos no encontrados');
        return;
    }
    
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

// ========== FUNCIÓN PARA ACTUALIZAR TODO EL CONTENIDO ECONÓMICO ==========

function actualizarContenidoEconomicoCompleto(ideologiaCluster, analisisEconomico, interpretacion) {
    // Verificar que analisisEconomico existe
    if (!analisisEconomico) return;
    
    // 1. Actualizar título y badge
    const tituloTema = document.getElementById('titulo-tema-economico');
    const badge = document.getElementById('badge-orientacion');
    
    if (tituloTema && analisisEconomico.tema) {
        tituloTema.textContent = analisisEconomico.tema;
    }
    
    if (badge) {
        const orientacion = analisisEconomico.orientacion || ideologiaCluster || 'desconocida';
        badge.textContent = orientacion.charAt(0).toUpperCase() + orientacion.slice(1);
        badge.className = 'badge-orientacion';
        if (orientacion.toLowerCase() === 'derecha') {
            badge.classList.add('derecha');
        } else if (orientacion.toLowerCase() === 'izquierda') {
            badge.classList.add('izquierda');
        }
    }
    
    // 2. Actualizar palabras clave
    const contenedorPalabras = document.getElementById('contenedor-palabras-clave');
    if (contenedorPalabras) {
        const palabras = analisisEconomico.palabras_clave || [];
        contenedorPalabras.innerHTML = '';
        
        if (palabras.length === 0) {
            const span = document.createElement('span');
            span.textContent = 'No hay palabras clave identificadas';
            contenedorPalabras.appendChild(span);
        } else {
            palabras.slice(0, 12).forEach(palabra => {
                const span = document.createElement('span');
                span.textContent = palabra;
                contenedorPalabras.appendChild(span);
            });
        }
    }
    
    // 3. Actualizar frases asociadas
    const contenedorFrases = document.getElementById('contenedor-frases');
    if (contenedorFrases) {
        const frases = analisisEconomico.frases_asociadas || {};
        contenedorFrases.innerHTML = '';
        
        if (Object.keys(frases).length === 0) {
            const div = document.createElement('div');
            div.textContent = 'No hay frases asociadas por tema';
            contenedorFrases.appendChild(div);
        } else {
            Object.entries(frases).slice(0, 3).forEach(([tema, frasesLista]) => {
                const div = document.createElement('div');
                div.innerHTML = `<h5>${tema} (${Math.min(frasesLista.length, 3)}/${frasesLista.length})</h5>`;
                
                frasesLista.slice(0, 3).forEach((frase, i) => {
                    const p = document.createElement('p');
                    p.textContent = `${i + 1}. ${frase.length > 150 ? frase.substring(0, 147) + '...' : frase}`;
                    div.appendChild(p);
                });
                
                contenedorFrases.appendChild(div);
            });
        }
    }
    
    // 4. Generar gráfico de patrones (con retardo para asegurar dimensiones)
    setTimeout(() => {
        generarGraficoPatronesPorIdeologia(interpretacion);
    }, 100);
}

// ========== FUNCIÓN DEL GRÁFICO CON VERIFICACIÓN ==========

function generarGraficoPatronesPorIdeologia(interpretacion) {
    const contenedor = document.getElementById('contenedor-grafico-patrones'); 
    if (!contenedor) {
        console.log("Contenedor de gráfico no encontrado aún");
        return;
    }
    
    // Asegurar dimensiones
    contenedor.style.minHeight = "250px";
    contenedor.style.minWidth = "350px";
    
    // Pequeño delay para asegurar que el contenedor tenga dimensiones
    setTimeout(() => {
        if (contenedor.offsetWidth === 0 || contenedor.offsetHeight === 0) {
            console.log('Esperando dimensiones del gráfico...');
            setTimeout(() => generarGraficoPatronesPorIdeologia(interpretacion), 100);
            return;
        }
        
        // Limpiar gráfico anterior si existe
        const existingChart = echarts.getInstanceByDom(contenedor);
        if (existingChart && !existingChart.isDisposed()) {
            existingChart.dispose();
        }
        
        const chart = echarts.init(contenedor);
        
        // Procesar datos para el gráfico
        const datosProcesados = procesarDatosParaGrafico(interpretacion);
        
        if (datosProcesados.categorias.length === 0) {
            contenedor.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; 
                            color: #666; font-style: italic; text-align: center; padding: 30px;">
                    <div>
                        <i class="fas fa-chart-bar" style="font-size: 1.8em; margin-bottom: 12px; opacity: 0.5;"></i><br>
                        <span style="font-size: 14px; font-weight: 500;">No hay suficientes datos para el gráfico</span><br>
                        <span style="font-size: 12px; margin-top: 5px; color: #888;">Faltan clusters económicos con orientación definida</span>
                    </div>
                </div>
            `;
            return;
        }
        
        // Calcular estadísticas
        const totalIzquierda = datosProcesados.datosIzquierda.reduce((a, b) => a + b, 0);
        const totalDerecha = datosProcesados.datosDerecha.reduce((a, b) => a + b, 0);
        const totalGeneral = totalIzquierda + totalDerecha;
        const porcentajeIzquierda = totalGeneral > 0 ? ((totalIzquierda / totalGeneral) * 100).toFixed(1) : 0;
        const porcentajeDerecha = totalGeneral > 0 ? ((totalDerecha / totalGeneral) * 100).toFixed(1) : 0;
        
        // Configuración del gráfico con el estilo unificado
        const option = {
            title: {
                text: 'Distribución de Patrones MARPOR por Ideología',
                left: 'center',
                top: 8,
                textStyle: {
                    ...TITLE_STYLE,
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#2E5AAC'
                },
                subtext: `Total: ${totalGeneral} patrones | Izquierda: ${porcentajeIzquierda}% | Derecha: ${porcentajeDerecha}%`,
                subtextStyle: {
                    ...SUBTITLE_STYLE,
                    fontSize: 12,
                    color: '#6D6D6D',
                    margin: [5, 0, 0, 0]
                }
            },
            tooltip: {
                ...TOOLTIP_STYLE,
                trigger: 'axis',
                axisPointer: { 
                    type: 'shadow',
                    shadowStyle: {
                        color: 'rgba(150, 150, 150, 0.15)'
                    }
                },
                formatter: function(params) {
                    const data = datosProcesados.datosConPorcentaje[params[0].dataIndex];
                    return `
                        <div style="max-width: 350px;">
                            <strong style="font-size:13px; color: #2c3e50;">${data.categoria}</strong><br/>
                            <hr style="margin: 8px 0; border-color: #eee;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-size: 12px; color: #555;">Izquierda:</span>
                                <span style="font-weight: bold; color: #f48b3a;">${data.izquierda} (${data.porcentajeIzquierda}%)</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <span style="font-size: 12px; color: #555;">Derecha:</span>
                                <span style="font-weight: bold; color: #4d82ec;">${data.derecha} (${data.porcentajeDerecha}%)</span>
                            </div>
                            <hr style="margin: 8px 0; border-color: #eee;">
                            <div style="display: flex; justify-content: space-between; margin-top: 3px; padding-top: 3px; border-top: 1px solid #eee;">
                                <span style="font-weight: bold; font-size: 12px;">Total:</span>
                                <span style="font-weight: bold; font-size: 13px; color: #2E5AAC;">${data.total}</span>
                            </div>
                        </div>
                    `;
                }
            },
            legend: {
                data: ['Izquierda', 'Derecha'],
                top: 50,
                left: 'center',
                textStyle: {
                    ...LEGEND_STYLE.textStyle,
                    fontSize: 11,
                    fontWeight: '500'
                },
                itemWidth: 12,
                itemHeight: 12,
                itemGap: 15,
                icon: 'roundRect',
                borderRadius: 2
            },
            grid: {
                left: '35%',
                right: '5%',
                bottom: '15%',
                top: '25%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: 'Frecuencia',
                nameLocation: 'middle',
                nameGap: 18,
                nameTextStyle: {
                    ...AXIS_STYLE.nameTextStyle,
                    fontSize: 11,
                    fontWeight: '600'
                },
                axisLine: {
                    lineStyle: {
                        ...AXIS_STYLE.axisLine.lineStyle,
                        width: 1.5
                    }
                },
                axisTick: {
                    ...AXIS_STYLE.axisTick,
                    length: 3
                },
                axisLabel: {
                    ...AXIS_STYLE.axisLabel,
                    fontSize: 10,
                    margin: 6
                },
                splitLine: {
                    ...AXIS_STYLE.splitLine,
                    lineStyle: {
                        ...AXIS_STYLE.splitLine.lineStyle,
                        width: 1,
                        opacity: 0.6
                    }
                }
            },
            yAxis: {
                type: 'category',
                data: datosProcesados.categorias,
                axisLabel: {
                    ...AXIS_STYLE.axisLabel,
                    fontSize: 10,
                    margin: 6,
                    color: '#4A4A4A',
                    fontWeight: '500',
                    formatter: function(value) {
                        // Limitar longitud y añadir puntos suspensivos si es necesario
                        if (value.length > 30) {
                            return value.substring(0, 27) + '...';
                        }
                        return value;
                    }
                },
                axisLine: { 
                    show: true,
                    lineStyle: {
                        ...AXIS_STYLE.axisLine.lineStyle,
                        width: 1.5
                    }
                },
                axisTick: { 
                    show: true,
                    lineStyle: {
                        ...AXIS_STYLE.axisTick.lineStyle,
                        width: 1
                    },
                    length: 3
                }
            },
            series: [
                {
                    name: 'Izquierda',
                    type: 'bar',
                    stack: 'total',
                    barWidth: '70%',
                    label: {
                        show: true,
                        position: 'insideLeft',
                        fontSize: 9,
                        color: '#fff',
                        fontWeight: 'bold',
                        formatter: function(params) {
                            const data = datosProcesados.datosConPorcentaje[params.dataIndex];
                            return data.porcentajeIzquierda > 10 ? `${data.porcentajeIzquierda}%` : '';
                        }
                    },
                    data: datosProcesados.datosIzquierda,
                    itemStyle: {
                        color: '#f48b3aff',
                        borderRadius: [0, 4, 4, 0],
                        borderWidth: 0
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 8,
                            shadowColor: 'rgba(244, 139, 58, 0.3)',
                            opacity: 0.95
                        }
                    }
                },
                {
                    name: 'Derecha',
                    type: 'bar',
                    stack: 'total',
                    barWidth: '70%',
                    label: {
                        show: true,
                        position: 'insideRight',
                        fontSize: 9,
                        color: '#fff',
                        fontWeight: 'bold',
                        formatter: function(params) {
                            const data = datosProcesados.datosConPorcentaje[params.dataIndex];
                            return data.porcentajeDerecha > 10 ? `${data.porcentajeDerecha}%` : '';
                        }
                    },
                    data: datosProcesados.datosDerecha,
                    itemStyle: {
                        color: '#4d82ecff',
                        borderRadius: [4, 0, 0, 4],
                        borderWidth: 0
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 8,
                            shadowColor: 'rgba(77, 130, 236, 0.3)',
                            opacity: 0.95
                        }
                    }
                }
            ],
            backgroundColor: '#FFF'
        };
        
        // Añadir dataZoom si hay muchas categorías
        if (datosProcesados.categorias.length > 8) {
            option.dataZoom = [
                {
                    type: 'inside',
                    yAxisIndex: 0,
                    start: 0,
                    end: 100,
                    zoomLock: false,
                    moveOnMouseMove: true
                }
            ];
            option.grid.bottom = '20%';
        }
        
        chart.setOption(option);
        
        // Forzar resize
        setTimeout(() => {
            if (chart && !chart.isDisposed()) {
                chart.resize();
            }
        }, 50);
        
        // Manejar redimensionamiento
        const resizeHandler = () => {
            if (chart && !chart.isDisposed()) {
                chart.resize();
            }
        };
        window.addEventListener('resize', resizeHandler);
        chart._resizeHandler = resizeHandler;
        
        console.log(`✅ Gráfico de patrones por ideología creado: ${datosProcesados.categorias.length} categorías, ${totalGeneral} patrones totales`);
        
    }, 50); // Delay inicial
}

// ========== FUNCIÓN AUXILIAR PARA PROCESAR DATOS ==========

function procesarDatosParaGrafico(interpretacion) {
    const categoriasMap = new Map();
    
    Object.values(interpretacion).forEach(cluster => {
        const analisis = cluster.analisis_economico;
        const ideologia = cluster.ideologia?.toLowerCase();
        
        if (analisis?.es_economico && (ideologia === 'izquierda' || ideologia === 'derecha')) {
            if (analisis.categorias_economicas) {
                Object.entries(analisis.categorias_economicas).forEach(([categoria, valor]) => {
                    const cuenta = typeof valor === 'number' ? valor : 1;
                    procesarCategoria(categoria, cuenta, ideologia, categoriasMap);
                });
            }
            
            if (analisis.patrones_detectados) {
                Object.entries(analisis.patrones_detectados).forEach(([categoria, patrones]) => {
                    const cuenta = Array.isArray(patrones) ? patrones.length : 1;
                    procesarCategoria(categoria, cuenta, ideologia, categoriasMap);
                });
            }
            
            if (analisis.tema && !analisis.categorias_economicas && !analisis.patrones_detectados) {
                procesarCategoria(analisis.tema, 1, ideologia, categoriasMap);
            }
        }
    });
    
    const categoriasArray = Array.from(categoriasMap.entries()).map(([categoria, datos]) => ({
        categoria,
        izquierda: datos.izquierda,
        derecha: datos.derecha,
        total: datos.izquierda + datos.derecha
    })).sort((a, b) => b.total - a.total);
    
    const categoriasLimitadas = categoriasArray.slice(0, 10); // Aumentado a 10 categorías
    const categorias = categoriasLimitadas.map(item => item.categoria);
    const datosIzquierda = categoriasLimitadas.map(item => item.izquierda);
    const datosDerecha = categoriasLimitadas.map(item => item.derecha);
    
    const datosConPorcentaje = categoriasLimitadas.map(item => {
        const total = item.total;
        return {
            categoria: item.categoria,
            izquierda: item.izquierda,
            derecha: item.derecha,
            total,
            porcentajeIzquierda: total > 0 ? Math.round((item.izquierda / total) * 100) : 0,
            porcentajeDerecha: total > 0 ? Math.round((item.derecha / total) * 100) : 0
        };
    });
    
    return { categorias, datosIzquierda, datosDerecha, datosConPorcentaje };
}

function procesarCategoria(categoria, cuenta, ideologia, categoriasMap) {
    if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, { izquierda: 0, derecha: 0 });
    }
    
    const datos = categoriasMap.get(categoria);
    if (ideologia === 'izquierda') {
        datos.izquierda += cuenta;
    } else if (ideologia === 'derecha') {
        datos.derecha += cuenta;
    }
}

// ========== FUNCIÓN AUXILIAR PARA PROCESAR DATOS ==========

function procesarDatosParaGrafico(interpretacion) {
    const categoriasMap = new Map();
    
    Object.values(interpretacion).forEach(cluster => {
        const analisis = cluster.analisis_economico;
        const ideologia = cluster.ideologia?.toLowerCase();
        
        if (analisis?.es_economico && (ideologia === 'izquierda' || ideologia === 'derecha')) {
            if (analisis.categorias_economicas) {
                Object.entries(analisis.categorias_economicas).forEach(([categoria, valor]) => {
                    const cuenta = typeof valor === 'number' ? valor : 1;
                    procesarCategoria(categoria, cuenta, ideologia, categoriasMap);
                });
            }
            
            if (analisis.patrones_detectados) {
                Object.entries(analisis.patrones_detectados).forEach(([categoria, patrones]) => {
                    const cuenta = Array.isArray(patrones) ? patrones.length : 1;
                    procesarCategoria(categoria, cuenta, ideologia, categoriasMap);
                });
            }
            
            if (analisis.tema && !analisis.categorias_economicas && !analisis.patrones_detectados) {
                procesarCategoria(analisis.tema, 1, ideologia, categoriasMap);
            }
        }
    });
    
    const categoriasArray = Array.from(categoriasMap.entries()).map(([categoria, datos]) => ({
        categoria,
        izquierda: datos.izquierda,
        derecha: datos.derecha,
        total: datos.izquierda + datos.derecha
    })).sort((a, b) => b.total - a.total);
    
    const categoriasLimitadas = categoriasArray.slice(0, 8);
    const categorias = categoriasLimitadas.map(item => item.categoria);
    const datosIzquierda = categoriasLimitadas.map(item => item.izquierda);
    const datosDerecha = categoriasLimitadas.map(item => item.derecha);
    
    const datosConPorcentaje = categoriasLimitadas.map(item => {
        const total = item.total;
        return {
            categoria: item.categoria,
            izquierda: item.izquierda,
            derecha: item.derecha,
            total,
            porcentajeIzquierda: total > 0 ? Math.round((item.izquierda / total) * 100) : 0,
            porcentajeDerecha: total > 0 ? Math.round((item.derecha / total) * 100) : 0
        };
    });
    
    return { categorias, datosIzquierda, datosDerecha, datosConPorcentaje };
}

function procesarCategoria(categoria, cuenta, ideologia, categoriasMap) {
    if (!categoriasMap.has(categoria)) {
        categoriasMap.set(categoria, { izquierda: 0, derecha: 0 });
    }
    
    const datos = categoriasMap.get(categoria);
    if (ideologia === 'izquierda') {
        datos.izquierda += cuenta;
    } else if (ideologia === 'derecha') {
        datos.derecha += cuenta;
    }
}

// ========== FUNCIÓN PARA CONFIGURAR EVENTOS DE TARJETAS ==========

function configurarEventosTarjetas(clusterId, interpretacion) {
    const tarjetaArchivos = document.getElementById('tarjeta-dashboard-archivos-informe');
    const tarjetaPalabras = document.getElementById('tarjeta-dashboard-palabras-informe');
    
    if (tarjetaArchivos) {
        const nuevaTarjetaArchivos = tarjetaArchivos.cloneNode(true);
        tarjetaArchivos.parentNode.replaceChild(nuevaTarjetaArchivos, tarjetaArchivos);
        nuevaTarjetaArchivos.addEventListener('click', () => {
            generarGraficoSankeyCluster(interpretacion, clusterId);
        });
    }
    
    if (tarjetaPalabras) {
        const nuevaTarjetaPalabras = tarjetaPalabras.cloneNode(true);
        tarjetaPalabras.parentNode.replaceChild(nuevaTarjetaPalabras, tarjetaPalabras);
        nuevaTarjetaPalabras.addEventListener('click', () => {
            generarNubeFrasesRepresentativas(clusterId, interpretacion);
        });
    }
}

// ========== EXPORTAR FUNCIONES ==========

window.mostrarAnalisisEconomicoParaCluster = mostrarAnalisisEconomicoParaCluster;
window.configurarEventosTarjetas = configurarEventosTarjetas;



