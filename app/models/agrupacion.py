'''
from config.database import db

class Agrupacion(db.Model):
    __tablename__ = 'Agrupacion'

    _agrupacion_id = db.Column('Agrupacion_id', db.Integer, primary_key=True, autoincrement=True)
    _nombre = db.Column('Agrupacion_nombre', db.String(100), nullable=False)
    _descripcion = db.Column('Agrupacion_descripcion', db.Text)
    _modelo_agrupacion = db.Column('Agrupacion_modelo_agrupacion', db.String(100), nullable=False)
    _varianza_interna = db.Column('Agrupacion_varianza_interna', db.Numeric(10, 6))
    _fecha_creacion = db.Column('Agrupacion_fecha_creacion', db.Date, nullable=False)

    _palabras_origen = db.Column('Agrupacion_palabras_origen', db.JSON)
    _densidad = db.Column('Agrupacion_densidad', db.Float)
    _accuracy = db.Column('Agrupacion_accuracy', db.Numeric(5, 4))
    _nmi = db.Column('Agrupacion_nmi', db.Numeric(5, 4))
    _ari = db.Column('Agrupacion_ari', db.Numeric(5, 4))

    _agrupamiento_pca2d = db.Column('Agrupamiento_pca2d', db.JSON)
    _agrupamiento_pca3d = db.Column('Agrupamiento_pca3d', db.JSON)

    _archivos_procesados = db.Column('Agrupacion_archivos_procesados', db.JSON)
    _palabras_frecuentes = db.Column('Agrupacion_palabras_frecuentes', db.JSON)
    _palabras_menos_frecuentes = db.Column('Agrupacion_palabras_menos_frecuentes', db.JSON)
    _palabras_procesadas = db.Column('Agrupacion_palabras_procesadas', db.JSON)

    _texto_id = db.Column('Texto_id', db.Integer, db.ForeignKey('TextoProcesado.Texto_id'), unique=True, nullable=False)
    texto_procesado = db.relationship('TextoProcesado', backref=db.backref('agrupacion', uselist=False, cascade="all, delete"))

    def __init__(self, nombre, descripcion, modelo_agrupacion, varianza_interna,
                 fecha_creacion, palabras_origen, densidad, accuracy, nmi, ari,
                 agrupamiento_pca2d, agrupamiento_pca3d, archivos_procesados,
                 palabras_frecuentes, palabras_menos_frecuentes, palabras_procesadas, texto_id):
        self._nombre = nombre
        self._descripcion = descripcion
        self._modelo_agrupacion = modelo_agrupacion
        self._varianza_interna = varianza_interna
        self._fecha_creacion = fecha_creacion
        self._palabras_origen = palabras_origen
        self._densidad = densidad
        self._accuracy = accuracy
        self._nmi = nmi
        self._ari = ari
        self._agrupamiento_pca2d = agrupamiento_pca2d
        self._agrupamiento_pca3d = agrupamiento_pca3d
        self._archivos_procesados = archivos_procesados
        self._palabras_frecuentes = palabras_frecuentes
        self._palabras_menos_frecuentes = palabras_menos_frecuentes
        self._palabras_procesadas = palabras_procesadas
        self._texto_id = texto_id

    # Propiedades públicas
    @property
    def agrupacion_id(self):
        return self._agrupacion_id

    @property
    def nombre(self):
        return self._nombre

    @property
    def descripcion(self):
        return self._descripcion

    @property
    def modelo_agrupacion(self):
        return self._modelo_agrupacion

    @property
    def varianza_interna(self):
        return float(self._varianza_interna) if self._varianza_interna is not None else None

    @property
    def fecha_creacion(self):
        return self._fecha_creacion

    @property
    def palabras_origen(self):
        return self._palabras_origen or []

    @property
    def densidad(self):
        return self._densidad

    @property
    def accuracy(self):
        return float(self._accuracy) if self._accuracy is not None else None

    @property
    def nmi(self):
        return float(self._nmi) if self._nmi is not None else None

    @property
    def ari(self):
        return float(self._ari) if self._ari is not None else None

    @property
    def agrupamiento_pca2d(self):
        return self._agrupamiento_pca2d or []

    @property
    def agrupamiento_pca3d(self):
        return self._agrupamiento_pca3d or []

    @property
    def archivos_procesados(self):
        return self._archivos_procesados or []

    @property
    def palabras_frecuentes(self):
        return self._palabras_frecuentes or []

    @property
    def palabras_menos_frecuentes(self):
        return self._palabras_menos_frecuentes or []

    @property
    def palabras_procesadas(self):
        return self._palabras_procesadas or []

    @property
    def texto_id(self):
        return self._texto_id
'''
from config.database import db

class Agrupacion(db.Model):
    __tablename__ = 'Agrupacion'

    _agrupacion_id = db.Column('Agrupacion_id', db.Integer, primary_key=True, autoincrement=True)
    _nombre = db.Column('Agrupacion_nombre', db.String(100), nullable=False)
    _descripcion = db.Column('Agrupacion_descripcion', db.Text)

    # Nuevos campos agregados
    _asignacion_clusters = db.Column('Agrupacion_asignacion_clusters', db.JSON)
    _interpretacion_ideologica = db.Column('Agrupacion_interpretacion_ideologica', db.JSON)
    _embeddings_latentes = db.Column('Agrupacion_embeddings_latentes', db.JSON)
    _metricas_clustering = db.Column('Agrupacion_metricas_clustering', db.JSON)
    _parametros_ejecucion = db.Column('Agrupacion_parametros_ejecucion', db.JSON)

    _texto_id = db.Column('Texto_id', db.Integer, db.ForeignKey('TextoProcesado.Texto_id'), unique=True, nullable=False)
    texto_procesado = db.relationship('TextoProcesado', backref=db.backref('agrupacion', uselist=False, cascade="all, delete"))

    def __init__(self, nombre, descripcion,
                 asignacion_clusters, interpretacion_ideologica,
                 embeddings_latentes, metricas_clustering,
                 parametros_ejecucion, texto_id):
        self._nombre = nombre
        self._descripcion = descripcion
        self._asignacion_clusters = asignacion_clusters
        self._interpretacion_ideologica = interpretacion_ideologica
        self._embeddings_latentes = embeddings_latentes
        self._metricas_clustering = metricas_clustering
        self._parametros_ejecucion = parametros_ejecucion
        self._texto_id = texto_id

    # Propiedades públicas
    @property
    def agrupacion_id(self):
        return self._agrupacion_id

    @property
    def nombre(self):
        return self._nombre

    @property
    def descripcion(self):
        return self._descripcion

    @property
    def asignacion_clusters(self):
        return self._asignacion_clusters or {}

    @property
    def interpretacion_ideologica(self):
        return self._interpretacion_ideologica or {}

    @property
    def embeddings_latentes(self):
        return self._embeddings_latentes or {}

    @property
    def metricas_clustering(self):
        return self._metricas_clustering or {}

    @property
    def parametros_ejecucion(self):
        return self._parametros_ejecucion or {}

    @property
    def texto_id(self):
        return self._texto_id