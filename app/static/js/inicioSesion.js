// Paleta de colores
const colores = ['#fba35b', '#2e7acc', '#072b47'];

// Configuración adaptable según el tamaño de pantalla
let contadorNodos, distanciaConexion;

// Almacenar posiciones relativas para el redimensionamiento
let posicionesRelativas = [];

// Ajustar configuración según el tamaño de la pantalla
function ajustarConfiguracion() {
    if (window.innerWidth < 768) {
        // Para tablets y móviles
        contadorNodos = 120;
        distanciaConexion = 150;
    } else {
        // Para escritorio
        contadorNodos = 200;
        distanciaConexion = 200;
    }
}

let circulos = [];
let mouseX = 0;
let mouseY = 0;

// Referencias DOM
const fondo = document.getElementById('fondo-animado');

// Función para generar círculos
function generarCirculos(cantidad) {
    fondo.innerHTML = '';
    circulos = [];
    posicionesRelativas = [];
    
    for (let i = 0; i < cantidad; i++) {
        const circulo = document.createElement('div');
        circulo.className = 'circulo';
        
        // Tamaño responsive
        const baseSize = window.innerWidth < 480 ? 8 : 10;
        const tamaño = Math.floor(Math.random() * 10 + baseSize);
        const color = colores[Math.floor(Math.random() * colores.length)];
        
        // Estilo del círculo
        circulo.style.width = `${tamaño}px`;
        circulo.style.height = `${tamaño}px`;
        circulo.style.background = color;
        circulo.style.boxShadow = `0 0 10px ${color}`;
        
        // Posición inicial aleatoria (almacenar como porcentaje)
        const topPercent = Math.random() * 100;
        const leftPercent = Math.random() * 100;
        
        circulo.style.top = `${topPercent}%`;
        circulo.style.left = `${leftPercent}%`;
        
        // Velocidad adaptable
        const velocidadBase = window.innerWidth < 768 ? 0.3 : 0.5;
        const velocidadX = (Math.random() - 0.5) * velocidadBase;
        const velocidadY = (Math.random() - 0.5) * velocidadBase;
        
        // Almacenar datos del círculo
        const datosCirculo = {
            elemento: circulo,
            x: leftPercent / 100 * window.innerWidth,
            y: topPercent / 100 * window.innerHeight,
            topPercent: topPercent,
            leftPercent: leftPercent,
            tamaño: tamaño,
            color: color,
            velocidadX: velocidadX,
            velocidadY: velocidadY
        };
        
        circulos.push(datosCirculo);
        posicionesRelativas.push({top: topPercent, left: leftPercent});
        fondo.appendChild(circulo);
        
        // Añadir interacción con el mouse
        circulo.addEventListener('mouseover', () => {
            circulo.classList.add('destacado');
        });
        
        circulo.addEventListener('mouseout', () => {
            circulo.classList.remove('destacado');
        });
    }
    
    actualizarConexiones();
    iniciarAnimacion();
}

// Función para actualizar conexiones entre círculos
function actualizarConexiones() {
    document.querySelectorAll('.conexion').forEach(el => el.remove());
    
    for (let i = 0; i < circulos.length; i++) {
        for (let j = i + 1; j < circulos.length; j++) {
            const circulo1 = circulos[i];
            const circulo2 = circulos[j];
            
            const dx = circulo2.x - circulo1.x;
            const dy = circulo2.y - circulo1.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            
            if (distancia < distanciaConexion) {
                const angulo = Math.atan2(dy, dx) * 180 / Math.PI;
                const conexion = document.createElement('div');
                conexion.className = 'conexion';
                
                // Hacer las conexiones más delgadas
                conexion.style.width = `${distancia}px`;
                conexion.style.height = `${Math.max(0.5, 1 - (distancia / distanciaConexion))}px`;
                conexion.style.top = `${circulo1.y + circulo1.tamaño/2}px`;
                conexion.style.left = `${circulo1.x + circulo1.tamaño/2}px`;
                conexion.style.transform = `rotate(${angulo}deg)`;
                
                // Color de la conexión con opacidad variable según la distancia
                const opacidad = Math.max(0.1, 0.6 - (distancia / distanciaConexion));
                conexion.style.background = `linear-gradient(to right, 
                    rgba(${hexToRgb(circulo1.color)}, ${opacidad}), 
                    rgba(${hexToRgb(circulo2.color)}, ${opacidad}))`;
                
                conexion.style.opacity = opacidad;
                
                fondo.appendChild(conexion);
            }
        }
    }
}

// Convertir color HEX a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '255, 255, 255';
}

// Función para animar los círculos
function iniciarAnimacion() {
    function animar() {
        circulos.forEach(circulo => {
            // Actualizar posición
            circulo.x += circulo.velocidadX;
            circulo.y += circulo.velocidadY;
            
            // Actualizar posición porcentual para redimensionamiento
            circulo.leftPercent = (circulo.x / window.innerWidth) * 100;
            circulo.topPercent = (circulo.y / window.innerHeight) * 100;
            
            // Rebotar en los bordes
            if (circulo.x <= 0 || circulo.x >= window.innerWidth - circulo.tamaño) {
                circulo.velocidadX *= -1;
            }
            
            if (circulo.y <= 0 || circulo.y >= window.innerHeight - circulo.tamaño) {
                circulo.velocidadY *= -1;
            }
            
            // Aplicar posición
            circulo.elemento.style.left = `${circulo.x}px`;
            circulo.elemento.style.top = `${circulo.y}px`;
            
            // Atracción leve hacia el mouse
            const dx = mouseX - circulo.x;
            const dy = mouseY - circulo.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            
            if (distancia < 300) {
                const fuerza = 0.1 * (1 - distancia / 300);
                circulo.velocidadX += dx * fuerza * 0.001;
                circulo.velocidadY += dy * fuerza * 0.001;
            }
            
            // Limitar velocidad
            const velocidadMax = window.innerWidth < 768 ? 1.2 : 1.5;
            const velocidad = Math.sqrt(circulo.velocidadX * circulo.velocidadX + circulo.velocidadY * circulo.velocidadY);
            
            if (velocidad > velocidadMax) {
                circulo.velocidadX = (circulo.velocidadX / velocidad) * velocidadMax;
                circulo.velocidadY = (circulo.velocidadY / velocidad) * velocidadMax;
            }
        });
        
        actualizarConexiones();
        requestAnimationFrame(animar);
    }
    
    requestAnimationFrame(animar);
}

// Seguir la posición del mouse
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Redimensionar y reposicionar los círculos correctamente
function redimensionar() {
    ajustarConfiguracion();
    
    // Actualizar posiciones basadas en porcentajes
    circulos.forEach((circulo, index) => {
        circulo.x = (circulo.leftPercent / 100) * window.innerWidth;
        circulo.y = (circulo.topPercent / 100) * window.innerHeight;
        
        circulo.elemento.style.left = `${circulo.x}px`;
        circulo.elemento.style.top = `${circulo.y}px`;
    });
    
    actualizarConexiones();
}

// Debounce para el evento de redimensionamiento
let timeout;
window.addEventListener('resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(redimensionar, 250);
});

// Inicializar
ajustarConfiguracion();
generarCirculos(contadorNodos);