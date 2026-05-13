import re
from datetime import datetime
from config.database import db
from werkzeug.security import generate_password_hash, check_password_hash  # ← Seguridad agregada


class Usuario(db.Model):
    
    __tablename__ = 'Usuario'
    _id_usuario = db.Column('Usuario_id', db.Integer, primary_key=True)
    _nombre_usuario = db.Column('Usuario_nombre_usuario', db.String(50), nullable=False)
    _correo_electronico = db.Column('Usuario_correo', db.String(255), unique=True, nullable=False)
    _contrasena = db.Column('Usuario_contrasena', db.String(255), unique=True, nullable=False)
    _fecha_registro = db.Column('Usuario_fecha_registro', db.DateTime, default=datetime.utcnow)


    def __init__(self, nombre, correo_electronico, contrasena):
        self._nombre_usuario = nombre
        self._correo_electronico = correo_electronico
        self._contrasena = generate_password_hash(contrasena)  # ← Encriptar al registrar


    @staticmethod
    def validar_datos(nombre, correo):
        errores = []

        if len(nombre.strip()) == 0:
            errores.append("El nombre no puede estar vacío.")

        patron_correo = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(patron_correo, correo):
            errores.append("El correo electrónico no tiene un formato válido.")

        return errores
    
    @staticmethod
    def validar_contrasena(contrasena, confirmar):
        errores = []

        if not contrasena or not confirmar:
            errores.append("Debes completar ambos campos de contraseña.")

        elif len(contrasena) < 6:
            errores.append("La contraseña debe tener al menos 6 caracteres.")

        elif contrasena != confirmar:
            errores.append("Las contraseñas no coinciden.")

        return errores
    
    def verificar_contrasena(self, contrasena_plana):
        return check_password_hash(self._contrasena, contrasena_plana)

    # PK solo lectura y asignable una vez
    @property
    def id_usuario(self):
        return self._id_usuario

    def asignar_id(self, nuevo_id): # Modificar
        if self._id_usuario is None:
            self._id_usuario = nuevo_id
        else:
            raise ValueError("El ID ya ha sido asignado y no puede modificarse")

    # Validación de nombre
    @property
    def nombre(self):
        return self._nombre_usuario

    @nombre.setter
    def nombre(self, nuevo_nombre):
        if len(nuevo_nombre.strip()) > 0:
            self._nombre_usuario = nuevo_nombre

    # Validación de correo electrónico
    @property
    def correo_electronico(self):
        return self._correo_electronico

    @correo_electronico.setter
    def correo_electronico(self, nuevo_correo):
        if "@" in nuevo_correo and "." in nuevo_correo:
            self._correo_electronico = nuevo_correo

    # Seguridad al mostrar contraseña
    @property
    def contrasena(self):
        return "********"

    @contrasena.setter
    def contrasena(self, nueva_contrasena):
        self._contrasena = generate_password_hash(nueva_contrasena)