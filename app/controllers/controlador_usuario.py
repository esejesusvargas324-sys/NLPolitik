from app.models.usuario import Usuario
from config.database import db
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import string
import smtplib

class ControladorUsuario:

    def crear_usuario(self, nombre, correo_electronico, contrasena):
    
        usuario = Usuario(nombre, correo_electronico, contrasena)
        db.session.add(usuario)
        db.session.commit()

        return usuario

    def obtener_usuario_por_id(self, id_usuario):
        usuario = Usuario.query.get(id_usuario)
        if not usuario:
            raise ValueError("Usuario no encontrado.")
        return usuario
    
    def obtener_todos_los_usuarios(self):
        return Usuario.query.all()

    def actualizar_usuario(self, id_usuario, nuevos_datos):
        usuario = Usuario.query.get(id_usuario)
        if usuario:
            usuario.nombre = nuevos_datos.get('nombre', usuario.nombre)
            usuario.correo_electronico = nuevos_datos.get('correo_electronico', usuario.correo_electronico)
            nueva_contra = nuevos_datos.get('contrasena')
            if nueva_contra:
                usuario.contrasena = nueva_contra
            db.session.commit()
        return usuario

    def eliminar_usuario(self, id_usuario):
        usuario = Usuario.query.get(id_usuario)
        if usuario:
            db.session.delete(usuario)
            db.session.commit()
            return True
        return False
    
    def obtener_usuario_por_email(self, email):
        """Obtener usuario por email"""
        usuario = Usuario.query.filter_by(_correo_electronico=email).first()
        return usuario

    def actualizar_contrasena(self, id_usuario, nueva_contrasena):
        """Actualizar contraseña de usuario"""
        usuario = self.obtener_usuario_por_id(id_usuario)
        if usuario:
            # Usar el setter que automaticamente hashea la contraseña
            usuario.contrasena = nueva_contrasena
            db.session.commit()
            return usuario
        return None
    
    def generar_contrasena_temporal(self, longitud=10):
        """Genera una contraseña temporal aleatoria"""
        caracteres = string.ascii_letters + string.digits + "!@#$%"
        return ''.join(secrets.choice(caracteres) for _ in range(longitud))

    def enviar_contrasena_por_email(self, destinatario, nueva_contrasena):
        """
        Función REAL para enviar email con la nueva contraseña temporal
        """
        try:
            # Configuración para Gmail
            remitente = "noreplynlpolitik@gmail.com"
            password = "qhvo tugb ufcn jxyj"
            
            # Crear mensaje
            mensaje = MIMEMultipart()
            mensaje['From'] = remitente
            mensaje['To'] = destinatario
            mensaje['Subject'] = "Nueva Contraseña Temporal - NLPolitik"
            
            cuerpo = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2E5AAC; text-align: center;">Recuperación de Contraseña</h2>
                    
                    <p>Hola,</p>
                    
                    <p>Has solicitado recuperar tu contraseña para <strong>NLPolitik</strong>.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #2E5AAC; margin: 20px 0;">
                        <p style="margin: 0; font-size: 18px; font-weight: bold; text-align: center;">
                            Tu nueva contraseña temporal es: 
                            <span style="color: #2E5AAC; font-family: monospace;">{nueva_contrasena}</span>
                        </p>
                    </div>
                    
                    <p><strong>Por seguridad, te recomendamos:</strong></p>
                    <ol>
                        <li>Iniciar sesión con esta contraseña</li>
                        <li>Ir a tu perfil y cambiar la contraseña inmediatamente</li>
                    </ol>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #666; font-size: 12px;">
                            Si no solicitaste este cambio, por favor ignora este mensaje.
                        </p>
                        <p style="color: #666; font-size: 12px;">
                            Saludos,<br>
                            <strong>Equipo NLPolitik</strong>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            mensaje.attach(MIMEText(cuerpo, 'html'))
            
            # Configurar y enviar email REAL
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(remitente, password)
            server.send_message(mensaje)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Error enviando email: {str(e)}")
            return False