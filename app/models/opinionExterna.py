from app.models.opinion import Opinion
from config.database import db

class OpinionExterna(Opinion):
    __tablename__ = 'OpinionFuenteExterna'
    
    _opinion_externa_id = db.Column('OpinionFE_id', db.Integer, primary_key=True)
    _usuario_id = db.Column('OpinionFE_usuario_id', db.Integer, db.ForeignKey('Usuario.Usuario_id', ondelete='CASCADE'), nullable=False)
    _fuente = db.Column('OpinionFE_fuente', db.String(100), nullable=False)
    _autor = db.Column('OpinionFE_autor', db.String(100), nullable=False)
    _titulo = db.Column('OpinionFE_titulo', db.String(200), nullable=False)
    _contenido = db.Column('OpinionFE_contenido', db.Text, nullable=False)
    _fecha = db.Column('OpinionFE_fechaPublicacion', db.Date, nullable=False)
    _url = db.Column('OpinionFE_url_origen', db.String(300))

    def __init__(self, fuente, autor, titulo, contenido, fecha, url, usuario_id):
        self._fuente = fuente
        self._autor = autor
        self._titulo = titulo
        self._contenido = contenido
        self._fecha = fecha
        self._url = url
        self._usuario_id = usuario_id

    @property
    def opinion_externa_id(self):
        return self._opinion_externa_id  # Solo lectura.
    
    @property
    def usuario_id(self):
        return self._usuario_id
    
    @property
    def fuente(self):
        return self._fuente

    @fuente.setter
    def fuente(self, nueva_fuente):
        if nueva_fuente.strip():
            self._fuente = nueva_fuente

    @property
    def autor(self):
        return self._autor

    @autor.setter
    def autor(self, nuevo_autor):
        if nuevo_autor.strip():
            self._autor = nuevo_autor

    @property
    def url(self):
        return self._url

    @url.setter
    def url(self, nueva_url):
        if nueva_url.startswith("http"):
            self._url = nueva_url