function mostrarNotificacion(tipo, titulo, mensaje) {
  // Crear o seleccionar contenedor
  let contenedor = document.querySelector('.contenedor-notificaciones');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'contenedor-notificaciones';
    document.body.appendChild(contenedor);
  }

  // Crear notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  notificacion.innerHTML = `
    <div class="cabecera-notificacion">
      <i class="fas ${tipo === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'} icono-notificacion"></i>
      <span>${titulo}</span>
    </div>
    <div class="cuerpo-notificacion">
      ${mensaje}
    </div>
  `;

  // Agregar al DOM
  contenedor.prepend(notificacion); // Usamos prepend para apilar hacia abajo

  // Forzar reflow para animación
  void notificacion.offsetWidth;

  // Mostrar con animación
  notificacion.classList.add('desplegar');

  // Cerrar después de 3 segundos
  setTimeout(() => {
    notificacion.classList.remove('desplegar');
    notificacion.classList.add('plegar');
    
    setTimeout(() => {
      notificacion.remove();
      if (contenedor.children.length === 0) {
        contenedor.remove();
      }
    }, 400);
  }, 3000);

  // Cerrar al hacer clic
  notificacion.addEventListener('click', () => {
    notificacion.classList.remove('desplegar');
    notificacion.classList.add('plegar');
    setTimeout(() => notificacion.remove(), 400);
  });
}

if (typeof mensajesFlash !== 'undefined') {
  mensajesFlash.forEach(({ tipo, mensaje }) => {
    const tipoJS = tipo === 'success' ? 'exito' : 'error';
    const titulo = tipoJS === 'exito' ? 'Registro exitoso' : 'Error';
    mostrarNotificacion(tipoJS, titulo, mensaje);
  });
}

//-------------------
function mostrarConfirmacion(titulo, mensaje, callbackSi, callbackNo) {
  let contenedor = document.querySelector('.contenedor-notificaciones');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'contenedor-notificaciones';
    document.body.appendChild(contenedor);
  }

  const notificacion = document.createElement('div');
  notificacion.className = `notificacion confirmacion`;
  notificacion.innerHTML = `
    <div class="cabecera-notificacion">
      <i class="fas fa-question-circle icono-notificacion"></i>
      <span>${titulo}</span>
    </div>
    <div class="cuerpo-notificacion">
      <p>${mensaje}</p>
      <div class="acciones-notificacion">
        <button class="btn-confirmar">Sí</button>
        <button class="btn-cancelar">No</button>
      </div>
    </div>
  `;

  contenedor.prepend(notificacion);
  void notificacion.offsetWidth;
  notificacion.classList.add('desplegar');

  // Eventos de botón
  notificacion.querySelector('.btn-confirmar').addEventListener('click', () => {
    callbackSi?.();
    cerrarConfirmacion(notificacion, contenedor);
  });

  notificacion.querySelector('.btn-cancelar').addEventListener('click', () => {
    callbackNo?.();
    cerrarConfirmacion(notificacion, contenedor);
  });
}

function cerrarConfirmacion(notificacion, contenedor) {
  notificacion.classList.remove('desplegar');
  notificacion.classList.add('plegar');
  setTimeout(() => {
    notificacion.remove();
    if (contenedor.children.length === 0) {
      contenedor.remove();
    }
  }, 400);
}