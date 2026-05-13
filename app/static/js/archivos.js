// .............................................................

// Función para controlar el menú de las vistas con sus resultados

document.addEventListener("DOMContentLoaded", () => {
const menuLinks = document.querySelectorAll(".menu-vistas-archivos a");
const secciones = document.querySelectorAll(".contenido-vistas-archivos");

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
    mostrarSeccion("carga");

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

// .............................................................

document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".btn-carga");
  const formularios = document.querySelectorAll(".formulario-archivo");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      // Quitar clase activa de todos los botones
      botones.forEach(b => b.classList.remove("activo"));
      boton.classList.add("activo");

      // Ocultar todos los formularios
      formularios.forEach(f => f.style.display = "none");

      // Mostrar formulario correspondiente
      const idFormulario = boton.getAttribute("data-formulario");
      const formularioActivo = document.getElementById(idFormulario);
      if (formularioActivo) {
        formularioActivo.style.display = "flex";
      }
    });
  });
});

// .............................................................
function actualizarEventosFila() {
  const rows = document.querySelectorAll("#tabla-opiniones tbody tr");
  const formExterno = document.getElementById("formulario-archivo-externo");
  const formPersonal = document.getElementById("formulario-archivo-personal");

  rows.forEach(row => {
    row.addEventListener("click", async () => {
      const id = row.dataset.id;
      const origen = row.dataset.origen;
      sessionStorage.setItem("opinion-seleccionada-id", id);
      sessionStorage.setItem("opinion-seleccionada-origen", origen);


      // Mostrar formulario adecuado
      ocultarTodosLosFormularios();
      if (origen === "Externo") {
        formExterno.style.display = "block";
      } else {
        formPersonal.style.display = "block";
      }

      // Fetch data desde backend
      const response = await fetch(`/obtener_opinion/${origen}/${id}`);
      const data = await response.json();
      console.log("Datos recibidos del backend:", data);
      if (origen === "Externo") {
        formExterno.querySelector("#titulo-subir-externo").value = data.titulo;
        formExterno.querySelector("#contenido-externo").value = data.contenido;
        formExterno.querySelector("#autor-subir-externo").value = data.autor;
        formExterno.querySelector("#fuente-subir-externo").value = data.fuente;
        formExterno.querySelector("#fecha-subir-externo").value = data.fecha;
      } else {
        formPersonal.querySelector("#titulo-subir-personal").value = data.titulo;
        formPersonal.querySelector("#contenido-personal").value = data.contenido;
        formPersonal.querySelector("#autor-subir-personal").value = data.autor;
        formPersonal.querySelector("#fecha-subir-personal").value = data.fecha;
      }

      // Marcar fila seleccionada
      document.querySelectorAll("#tabla-opiniones tbody tr").forEach(f => f.classList.remove("selected"));
      row.classList.add("selected");
    });
  });
}

function ocultarTodosLosFormularios() {
  document.getElementById("formulario-archivo-externo").style.display = "none";
  document.getElementById("formulario-archivo-personal").style.display = "none";
  document.getElementById("formulario-archivo-vacio").style.display = "none";
}


// .............................................................

document.addEventListener("DOMContentLoaded", () => {
  const edicionToggle = document.getElementById("edicion-toggle");
  const forms = [
    document.getElementById("formulario-archivo-externo"),
    document.getElementById("formulario-archivo-personal")
  ];

  function toggleEdicion(habilitar) {
    forms.forEach(form => {
      if (!form) return;
      const elementos = form.querySelectorAll("input, textarea, button");
      elementos.forEach(el => el.disabled = !habilitar);
    });
  }

  // Estado inicial deshabilitado
  toggleEdicion(false);

  // Cambiar estado al hacer toggle
  edicionToggle.addEventListener("change", (e) => {
    toggleEdicion(e.target.checked);
  });
});
//........................................................................
document.querySelector(".btn-buscar-link").addEventListener("click", function () {
  iniciarCargaProceso();
  const enlace = document.querySelector("#enlace").value;
  if (!enlace.trim()) return;
  
  fetch("/extraer_articulo", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `url=${encodeURIComponent(enlace)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert("Error al archivo: " + data.error);
        return;
      }

      // Rellenar los campos visibles
      document.querySelector("#titulo-link").value = data.titulo || "";
      document.querySelector("#autor-link").value = data.autor || "";  
      document.querySelector("#fuente-link").value = data.fuente || "";
      document.querySelector("#fecha-link").value = data.fecha_publicacion || "";

      // Rellenar el contenido oculto
      document.querySelector("#contenido-link").value = data.contenido || "";
      terminarCargaProceso();
      mostrarNotificacion("exito", "Infromación del artículo extraída", `Se cargó correctamente: "${data.titulo}"`);
    })
    .catch(err => alert("No se pudo procesar el enlace."));
});

//.......................................................................................
//Funcion para controlar el required en el ainteraccion 
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-escribir");
  const textarea = document.getElementById("opinion");
  const archivo = document.getElementById("archivo-opinion");

  formulario.addEventListener("submit", function () {
    // Se quitan los atributos required sin bloquear el envío
    textarea.removeAttribute("required");
    archivo.removeAttribute("required");
  });
});

//.......................................................................................
function actualizarTablaOpiniones() {
  fetch("/opiniones_cargadas")
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector("#tabla-opiniones tbody");
      tbody.innerHTML = "";

      data.forEach((opinion, index) => {
        const fila = document.createElement("tr");

        // Asignar atributos personalizados
        fila.setAttribute("data-id", opinion.id);
        fila.setAttribute("data-origen", opinion.origen);

        fila.innerHTML = `
          <td>${index + 1}</td>
          <td>${opinion.origen}</td>
          <td>${opinion.titulo}</td>
          <td>${new Date(opinion.fecha).toISOString().slice(0, 10)}</td>
        `;

        tbody.appendChild(fila);
      });

      // Reasignar eventos de clic si estás usando interacción dinámica
      actualizarEventosFila();
    });
}

// Ejecutar la carga inicial
actualizarTablaOpiniones();
//.......................................................................................

//Funciones para guardar y eliminar la informacion de opinion externa

document.addEventListener("DOMContentLoaded", () => {
  const botonGuardar = document.querySelector("#btn-guardar-externo");
  if (!botonGuardar) {
    mostrarNotificacion("error", "Cancelado", "No se encontró el botón para guardar modificación");
    return;
  }
  
  botonGuardar.addEventListener("click", async () => {
    console.log("Botón guardar clickeado");

    const filaSeleccionada = document.querySelector("#tabla-opiniones tbody tr.selected");
    if (!filaSeleccionada) {
      mostrarNotificacion("error", "Sin selección", "Selecciona una opinión para editar.");
      return;
    }

    const id = filaSeleccionada.dataset.id;

    const datos = {
      titulo: document.querySelector("#titulo-subir-externo").value,
      contenido: document.querySelector("#contenido-externo").value,
      autor: document.querySelector("#autor-subir-externo").value,
      fuente: document.querySelector("#fuente-subir-externo").value,
      fecha: document.querySelector("#fecha-subir-externo").value
    };

    try {
      const response = await fetch(`/actualizar_opinion/externa/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await response.json();

      if (response.ok) {
        mostrarNotificacion("exito", "Actualización exitosa", resultado.mensaje);
        actualizarTablaOpiniones();
        setTimeout(() => {
          const nuevaFila = document.querySelector(`#tabla-opiniones tbody tr[data-id="${id}"]`);
          nuevaFila?.classList.add("selected");
        }, 100); 
      } else {
        mostrarNotificacion("error", "Error al actualizar", resultado.error);
      }
    } catch (error) {
      mostrarNotificacion("error", "Error de conexión", "Fallo al conectar con el servidor.");
    }
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const btnEliminar = document.querySelector("#btn-eliminar-externo");

  if (!btnEliminar) {
    mostrarNotificacion("error", "Elemento no encontrado", "No se encontró el botón #btn-eliminar-externo");
    return;
  }

  btnEliminar.addEventListener("click", () => {
    const filaSeleccionada = document.querySelector("#tabla-opiniones tbody tr.selected");
    if (!filaSeleccionada) {
      mostrarNotificacion("error", "Sin selección", "Selecciona una opinión para eliminar.");
      return;
    }

    const id = filaSeleccionada.dataset.id;

    mostrarConfirmacion(
      "Eliminar opinión",
      "¿Estás seguro de que deseas eliminar esta opinión?",
      async () => {
        try {
          const response = await fetch(`/eliminar_opinion/externa/${id}`, {
            method: "DELETE"
          });

          const resultado = await response.json();

          if (response.ok) {
            mostrarNotificacion("exito", "Eliminación exitosa", resultado.mensaje);
            actualizarTablaOpiniones();
            document.getElementById("formulario-archivo-externo").style.display = "none";
            document.getElementById("formulario-archivo-personal").style.display = "none";
            document.getElementById("formulario-archivo-vacio").style.display = "block";

          } else {
            mostrarNotificacion("error", "Error al eliminar", resultado.error || "No se pudo eliminar la opinión.");
          }
        } catch (error) {
          mostrarNotificacion("error", "Error de conexión", "No se pudo contactar con el servidor.");
        }
      },
      () => {
        mostrarNotificacion("error", "Cancelado", "La eliminación fue cancelada.");
      }
    );
  });
});
//.......................................................................................

//Funciones para guardar y eliminar la informacion de opinion usuario

document.addEventListener("DOMContentLoaded", () => {
  const botonGuardar = document.querySelector("#btn-guardar-personal");
  if (!botonGuardar) {
    mostrarNotificacion("error", "Cancelado", "No se encontró el botón para guardar modificación");
    return;
  }

  botonGuardar.addEventListener("click", async () => {
  
    const filaSeleccionada = document.querySelector("#tabla-opiniones tbody tr.selected");
    if (!filaSeleccionada) {
      mostrarNotificacion("error", "Sin selección", "Selecciona una opinión para editar.");
      return;
    }

    const id = filaSeleccionada.dataset.id;

    const datos = {
      titulo: document.querySelector("#titulo-subir-personal").value,
      contenido: document.querySelector("#contenido-personal").value,
      fecha: document.querySelector("#fecha-subir-personal").value
    };

    try {
      const response = await fetch(`/actualizar_opinion/usuario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      });

      const resultado = await response.json();

      if (response.ok) {
        mostrarNotificacion("exito", "Actualización exitosa", resultado.mensaje);
        actualizarTablaOpiniones();
        setTimeout(() => {
          const nuevaFila = document.querySelector(`#tabla-opiniones tbody tr[data-id="${id}"]`);
          nuevaFila?.classList.add("selected");
        }, 100); 
      } else {
        mostrarNotificacion("error", "Error al actualizar", resultado.error);
      }
    } catch (error) {
      mostrarNotificacion("error", "Error de conexión", "Fallo al conectar con el servidor.");
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const btnEliminar = document.querySelector("#btn-eliminar-personal");

  if (!btnEliminar) {
    mostrarNotificacion("error", "Elemento no encontrado", "No se encontró el botón #btn-eliminar-externo");
    return;
  }

  btnEliminar.addEventListener("click", () => {
    const filaSeleccionada = document.querySelector("#tabla-opiniones tbody tr.selected");
    if (!filaSeleccionada) {
      mostrarNotificacion("error", "Sin selección", "Selecciona una opinión para eliminar.");
      return;
    }

    const id = filaSeleccionada.dataset.id;

    mostrarConfirmacion(
      "Eliminar opinión",
      "¿Estás seguro de que deseas eliminar esta opinión?",
      async () => {
        try {
          const response = await fetch(`/eliminar_opinion/usuario/${id}`, {
            method: "DELETE"
          });

          const resultado = await response.json();

          if (response.ok) {
            mostrarNotificacion("exito", "Eliminación exitosa", resultado.mensaje);
            actualizarTablaOpiniones();
            document.getElementById("formulario-archivo-externo").style.display = "none";
            document.getElementById("formulario-archivo-personal").style.display = "none";
            document.getElementById("formulario-archivo-vacio").style.display = "block";
          } else {
            mostrarNotificacion("error", "Error al eliminar", resultado.error || "No se pudo eliminar la opinión.");
          }
        } catch (error) {
          mostrarNotificacion("error", "Error de conexión", "No se pudo contactar con el servidor.");
        }
      },
      () => {
        mostrarNotificacion("error", "Cancelado", "La eliminación fue cancelada.");
      }
    );
  });
});













































