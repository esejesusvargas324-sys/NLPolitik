from config.database import db
from datetime import date

class HistorialClasificacion(db.Model):
    __tablename__ = 'HistorialClasificacion'

    _historial_id = db.Column('HistorialC_id', db.Integer, primary_key=True, autoincrement=True)
    _agrupacion_id = db.Column('HistorialC_agrupacion_id', db.Integer, db.ForeignKey('Agrupacion.Agrupacion_id'), nullable=False)
    _fecha_creacion = db.Column('HistorialC_fecha_creacion', db.Date, default=date.today)
    _favorito = db.Column('HistorialC_favorito', db.Boolean, default=False)
    _comentario = db.Column('HistorialC_comentario', db.Text)

    agrupacion = db.relationship('Agrupacion', backref=db.backref('historiales', cascade="all, delete"))

    def __init__(self, agrupacion_id, comentario="", favorito=False, fecha=None):
        self._agrupacion_id = agrupacion_id
        self._comentario = comentario.strip() if comentario else ""
        self._favorito = bool(favorito)
        self._fecha_creacion = fecha if fecha else date.today()

    @property
    def historial_id(self):
        return self._historial_id

    @property
    def agrupacion_id(self):
        return self._agrupacion_id

    @property
    def fecha_creacion(self):
        return self._fecha_creacion

    @fecha_creacion.setter
    def fecha_creacion(self, nueva_fecha):
        self._fecha_creacion = nueva_fecha

    @property
    def favorito(self):
        return self._favorito

    @favorito.setter
    def favorito(self, nuevo_estado):
        self._favorito = bool(nuevo_estado)

    @property
    def comentario(self):
        return self._comentario

    @comentario.setter
    def comentario(self, nuevo_comentario):
        self._comentario = nuevo_comentario.strip() if nuevo_comentario else ""