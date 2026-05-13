class ClasificacionIdeologica:
    def __init__(self, fecha, modelo, porcentaje_izquierda, porcentaje_derecha, resumen, agrupacion_id):
        self._clasificacion_ideologica_id = None  # PK que asigna por la BD
        self._agrupacion_id = agrupacion_id       #  FK clave foránea hacia Agrupación
        self._fecha_creacion = fecha
        self._modelo_utilizado = modelo
        self._porcentaje_posicion_iz = porcentaje_izquierda
        self._porcentaje_posicion_der = porcentaje_derecha
        self._resumen_interpretativo = resumen

    @property
    def clasificacion_ideologica_id(self):
        return self._clasificacion_ideologica_id

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
    def modelo_utilizado(self):
        return self._modelo_utilizado

    @modelo_utilizado.setter
    def modelo_utilizado(self, nuevo_modelo):
        if nuevo_modelo.strip():
            self._modelo_utilizado = nuevo_modelo

    @property
    def porcentaje_posicion_iz(self):
        return self._porcentaje_posicion_iz

    @porcentaje_posicion_iz.setter
    def porcentaje_posicion_iz(self, nuevo_porcentaje_posicion_iz):
        self._porcentaje_posicion_iz = nuevo_porcentaje_posicion_iz 

    @property
    def porcentaje_posicion_der(self):
        return self._porcentaje_posicion_der

    @porcentaje_posicion_iz.setter
    def porcentaje_posicion_iz(self, nuevo_porcentaje_posicion_der):
        self._porcentaje_posicion_der = nuevo_porcentaje_posicion_der

    @property
    def resumen_interpretativo(self):
        return self._resumen_interpretativo

    @resumen_interpretativo.setter
    def resumen_interpretativo(self, nuevo_resumen):
        if nuevo_resumen.strip():
            self._resumen_interpretativo = nuevo_resumen