//Funcion para activar y desactivar la edision de los inputs
document.addEventListener("DOMContentLoaded", () => {
  // Inputs del formulario
  const formulario = document.getElementById("formulario-configurar-usuario");
  const inputs = formulario.querySelectorAll("input:not([type='checkbox'])");
  const botones = formulario.querySelectorAll("button");

  const toggleEdicion = document.getElementById("edicion-toggle");

  // Desactiva todos los inputs y botones por defecto
  inputs.forEach(input => {
    input.disabled = true;
  });
  botones.forEach(boton => {
    boton.disabled = true;
  });

  // Escucha el cambio del switch y habilita o bloquea según esté activo
  toggleEdicion.addEventListener("change", () => {
    const habilitado = toggleEdicion.checked;
    inputs.forEach(input => {
      input.disabled = !habilitado;
    });
    botones.forEach(boton => {
      boton.disabled = !habilitado;
    });
  });
});


//Función para controlar
function setAccion(valor) {
  document.getElementById("accion").value = valor;
}


//Funcion para controlar la venta de confrimacion de eliminación de usuario
document.addEventListener('DOMContentLoaded', () => {
  const btnEliminar = document.querySelector("button[onclick=\"setAccion('eliminar')\"]");
  const form = document.getElementById("formulario-configurar-usuario");
  const campoAccion = document.getElementById("accion");

  btnEliminar.addEventListener("click", (e) => {
    e.preventDefault(); // Cancelamos envío automático

    mostrarConfirmacion(
      "¿Eliminar usuario?",
      "Esta acción borrará tu cuenta de forma permanente. ¿Deseas continuar?",
      () => {
        campoAccion.value = "eliminar"; 
        form.submit(); 
      },
      () => {
        mostrarNotificacion("error", "Cancelado", "La eliminación fue cancelada.");
      }
    );
  });
});