from config.database import db
import json

class TextoProcesado(db.Model):
    __tablename__ = 'TextoProcesado'

    _texto_procesado_id = db.Column('Texto_id', db.Integer, primary_key=True, autoincrement=True)

    # Clave foránea hacia Usuario
    _usuario_id = db.Column('Usuario_id', db.Integer, db.ForeignKey('Usuario.Usuario_id', ondelete='CASCADE'), nullable=False)

    _archivos_origen = db.Column('Texto_archivos_origen', db.Text)
    _caracteres_eliminados = db.Column('Texto_caracteres_eliminados', db.Integer)
    _longitud_promedio_frases = db.Column('Texto_longitud_promedio_frases', db.Float)
    _total_frases = db.Column('Texto_total_frases', db.Integer)
    _tiempo_procesar = db.Column('Texto_tiempo_procesa', db.Float)

    # Campos por archivo
    _textos_por_archivo = db.Column('Texto_textos_por_archivo', db.Text)
    _frases_por_archivo = db.Column('Texto_frases_por_archivo', db.Text)
    _etiquetas_pos_por_archivo = db.Column('Texto_etiquetas_pos_por_archivo', db.Text)

    def __init__(self, usuario_id, archivos_origen, caracteres_eliminados, longitud_promedio_frases,
                 total_frases, tiempo_procesar, textos_por_archivo,
                 frases_por_archivo, etiquetas_pos_por_archivo):
        self._usuario_id = usuario_id
        self._archivos_origen = archivos_origen
        self._caracteres_eliminados = caracteres_eliminados
        self._longitud_promedio_frases = longitud_promedio_frases
        self._total_frases = total_frases
        self._tiempo_procesar = tiempo_procesar
        self._textos_por_archivo = json.dumps(textos_por_archivo)
        self._frases_por_archivo = json.dumps(frases_por_archivo)
        self._etiquetas_pos_por_archivo = json.dumps(etiquetas_pos_por_archivo)

    # PROPIEDADES BÁSICAS
    @property
    def texto_procesado_id(self):
        return self._texto_procesado_id

    @property
    def usuario_id(self):
        return self._usuario_id

    @usuario_id.setter
    def usuario_id(self, valor):
        self._usuario_id = valor

    @property
    def archivos_origen(self):
        return self._archivos_origen

    @archivos_origen.setter
    def archivos_origen(self, valor):
        self._archivos_origen = valor

    @property
    def caracteres_eliminados(self):
        return self._caracteres_eliminados

    @caracteres_eliminados.setter
    def caracteres_eliminados(self, valor):
        self._caracteres_eliminados = valor

    @property
    def longitud_promedio_frases(self):
        return self._longitud_promedio_frases

    @longitud_promedio_frases.setter
    def longitud_promedio_frases(self, valor):
        self._longitud_promedio_frases = valor

    @property
    def total_frases(self):
        return self._total_frases

    @total_frases.setter
    def total_frases(self, valor):
        self._total_frases = valor

    @property
    def tiempo_procesar(self):
        return self._tiempo_procesar

    @tiempo_procesar.setter
    def tiempo_procesar(self, valor):
        self._tiempo_procesar = valor

    # PROPIEDADES para los datos por archivo
    @property
    def textos_por_archivo(self):
        return json.loads(self._textos_por_archivo) if self._textos_por_archivo else []

    @textos_por_archivo.setter
    def textos_por_archivo(self, valor):
        self._textos_por_archivo = json.dumps(valor)

    @property
    def frases_por_archivo(self):
        return json.loads(self._frases_por_archivo) if self._frases_por_archivo else []

    @frases_por_archivo.setter
    def frases_por_archivo(self, valor):
        self._frases_por_archivo = json.dumps(valor)

    @property
    def etiquetas_pos_por_archivo(self):
        return json.loads(self._etiquetas_pos_por_archivo) if self._etiquetas_pos_por_archivo else []

    @etiquetas_pos_por_archivo.setter
    def etiquetas_pos_por_archivo(self, valor):
        self._etiquetas_pos_por_archivo = json.dumps(valor) 