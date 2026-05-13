from app.models.opinion import Opinion
from config.database import db

class OpinionUsuario(Opinion):
    __tablename__ = 'OpinionFuenteUsuario'

    _opinion_usuario_id = db.Column('OpinionFU_id', db.Integer, primary_key=True)
    _usuario_id = db.Column('OpinionFU_usuario_id', db.Integer, db.ForeignKey('Usuario.Usuario_id', ondelete='CASCADE'), nullable=False)
    _titulo = db.Column('OpinionFU_titulo', db.String(150), nullable=False)
    _contenido = db.Column('OpinionFU_contenido', db.Text, nullable=False)
    _fecha = db.Column('OpinionFU_fecha', db.Date, nullable=False)

    def __init__(self, titulo, contenido, fecha, usuario_id):
        super().__init__(titulo, contenido, fecha, usuario_id)
        self._titulo = titulo
        self._contenido = contenido
        self._fecha = fecha
        self._usuario_id = usuario_id

    @property
    def opinion_usuario_id(self):
        return self._opinion_usuario_id

    @property
    def usuario_id(self):
        return self._usuario_id

    @usuario_id.setter
    def usuario_id(self, value):
        self._usuario_id = value

    @property
    def titulo(self):
        return self._titulo

    @titulo.setter
    def titulo(self, value):
        self._titulo = value

    @property
    def contenido(self):
        return self._contenido

    @contenido.setter
    def contenido(self, value):
        self._contenido = value

    @property
    def fecha(self):
        return self._fecha

    @fecha.setter
    def fecha(self, value):
        self._fecha = value