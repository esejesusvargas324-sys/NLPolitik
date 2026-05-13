#Super clase Opinion 
from config.database import db

class Opinion(db.Model):
    __abstract__ = True  # Evita que se cree tabla para esta clase base

    _titulo = db.Column(db.String(200), nullable=False)
    _contenido = db.Column(db.LargeBinary, nullable=False)
    _fecha = db.Column(db.Date, nullable=False)
    _usuario_id = db.Column(db.Integer, db.ForeignKey('Usuario.Usuario_id', ondelete='CASCADE'), nullable=False)

    def __init__(self, titulo, contenido, fecha, usuario_id):
        self._titulo = titulo
        self._contenido = contenido
        self._fecha = fecha
        self._usuario_id = usuario_id

    @property
    def titulo(self):
        return self._titulo

    @titulo.setter
    def titulo(self, nuevo_titulo):
        if nuevo_titulo.strip():
            self._titulo = nuevo_titulo

    @property
    def contenido(self):
        return self._contenido

    @contenido.setter
    def contenido(self, nuevo_contenido):
        if isinstance(nuevo_contenido, (bytes, str)) and nuevo_contenido:
            self._contenido = nuevo_contenido

    @property
    def fecha(self):
        return self._fecha

    @fecha.setter
    def fecha(self, nueva_fecha):
        self._fecha = nueva_fecha

    @property
    def usuario_id(self):
        return self._usuario_id