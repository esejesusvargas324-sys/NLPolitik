document.addEventListener('DOMContentLoaded', function() {
    const formularioRecuperar = document.querySelector('.formulario-recuperar');
    
    if (!formularioRecuperar) {
        console.error('No se encontró el formulario de recuperación');
        return;
    }
    
    // Obtener la URL del data attribute
    const urlInicioSesion = formularioRecuperar.getAttribute('data-url-inicio-sesion');
    
    formularioRecuperar.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const botonRecuperar = document.querySelector('.boton-recuperar');
        
        // Validación básica
        if (!email) {
            mostrarNotificacion('error', 'Error', 'Por favor ingresa tu email');
            return;
        }
        
        if (!validarEmail(email)) {
            mostrarNotificacion('error', 'Error', 'Por favor ingresa un email válido');
            return;
        }
        
        // Deshabilitar botón para evitar múltiples envíos
        botonRecuperar.disabled = true;
        botonRecuperar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
        
        try {
            const response = await fetch('/recuperar_contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                mostrarNotificacion('exito', 'Éxito', data.mensaje);
                // Limpiar formulario
                formularioRecuperar.reset();
                
                // Redirigir después de 3 segundos usando la URL correcta
                setTimeout(() => {
                    window.location.href = urlInicioSesion;
                }, 3000);
            } else {
                mostrarNotificacion('error', 'Error', data.error || 'Error al procesar la solicitud');
            }
            
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('error', 'Error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            // Rehabilitar botón
            botonRecuperar.disabled = false;
            botonRecuperar.innerHTML = '<i class="fa-solid fa-key"></i> Generar Nueva Contraseña';
        }
    });
    
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
});

