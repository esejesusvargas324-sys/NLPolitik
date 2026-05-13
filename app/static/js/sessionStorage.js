// Session Storage para el html archivo
document.addEventListener("DOMContentLoaded", function () {
  // --- Configuración sessionStorage para la vista activa (Carga o Gestión) ---
  const menuLinks = document.querySelectorAll(".menu-vista-archivo a");
  const vistas = document.querySelectorAll(".contenido-vistas-archivos");

  function activarVista(id) {
    vistas.forEach(v => v.style.display = "none");
    const vista = document.getElementById(id);
    if (vista) vista.style.display = "block";
  }

  menuLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.dataset.target;
      sessionStorage.setItem("vistaActiva", target);
      activarVista(target);
    });
  });

  const vistaGuardada = sessionStorage.getItem("vistaActiva") || "carga";
  activarVista(vistaGuardada);

  // --- Configuración sessionStorage para formularios de carga ---
  const botonesCarga = document.querySelectorAll(".btn-carga");
  const formulariosCarga = document.querySelectorAll(".formulario-archivo");

  function mostrarFormularioCarga(id) {
    formulariosCarga.forEach(f => f.style.display = "none");
    const activo = document.getElementById(id);
    if (activo) activo.style.display = "block";

    botonesCarga.forEach(b => b.classList.remove("activo"));
    const botonActivo = document.querySelector(`.btn-carga[data-formulario="${id}"]`);
    if (botonActivo) botonActivo.classList.add("activo");
  }

  botonesCarga.forEach(boton => {
    boton.addEventListener("click", function () {
      const idFormulario = this.dataset.formulario;
      sessionStorage.setItem("formularioActivo", idFormulario);
      mostrarFormularioCarga(idFormulario);
    });
  });

  const formCargaGuardado = sessionStorage.getItem("formularioActivo") || "formulario-subir";
  mostrarFormularioCarga(formCargaGuardado);

  // --- Guardar campos de carga y gestión ---
  const camposCarga = [
    "titulo-subir", "autor-subir", "fuente-subir", "fecha-subir",
    "titulo-link", "autor-link", "fuente-link", "fecha-link", "enlace",
    "titulo-escribir", "opinion"
  ];

  const camposGestion = [
    "contenido-externo", "titulo-subir-externo", "autor-subir-externo", "fuente-subir-externo", "fecha-subir-externo",
    "contenido-personal", "titulo-subir-personal", "autor-subir-personal", "fecha-subir-personal"
  ];

  [...camposCarga, ...camposGestion].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      const guardado = sessionStorage.getItem("campo-" + id);
      if (guardado) input.value = guardado;

      input.addEventListener("input", () => {
        sessionStorage.setItem("campo-" + id, input.value);
      });
    }
  });

  // --- Restaurar y guardar estado del toggle de edición ---
  const toggle = document.getElementById("edicion-toggle");
  if (toggle) {
    const estadoGuardado = sessionStorage.getItem("toggle-edicion");
    if (estadoGuardado === "true") {
      toggle.checked = true;
      toggleEdicion(true);
    }

    toggle.addEventListener("change", () => {
      sessionStorage.setItem("toggle-edicion", toggle.checked);
      toggleEdicion(toggle.checked);
    });
  }

  // --- Restaurar fila seleccionada en la tabla de gestión ---
  const idSeleccionado = sessionStorage.getItem("opinion-seleccionada-id");
  const origenSeleccionado = sessionStorage.getItem("opinion-seleccionada-origen");

  if (idSeleccionado && origenSeleccionado) {
    setTimeout(() => {
      const fila = document.querySelector(`#tabla-opiniones tbody tr[data-id="${idSeleccionado}"][data-origen="${origenSeleccionado}"]`);
      if (fila) fila.click(); // Simula clic para que se cargue el formulario
    }, 100);
  }

  // --- Limpiar campos de sessionStorage al enviar formularios ---
  const formularios = document.querySelectorAll("form");
  formularios.forEach(form => {
    form.addEventListener("submit", () => {
      [...camposCarga, ...camposGestion].forEach(id => {
        sessionStorage.removeItem("campo-" + id);
      });
    });
  });
});

// --- Función auxiliar de toggle de edición ---
function toggleEdicion(habilitar) {
  const forms = [
    document.getElementById("formulario-archivo-externo"),
    document.getElementById("formulario-archivo-personal")
  ];

  forms.forEach(form => {
    if (!form) return;
    const elementos = form.querySelectorAll("input, textarea, button");
    elementos.forEach(el => el.disabled = !habilitar);
  });
}

// Session Storage para el html agrupamiento



