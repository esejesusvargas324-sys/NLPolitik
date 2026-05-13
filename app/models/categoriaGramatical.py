class ClasificacionIdeologica:
    def __init__(self, sustantivos, verbos, adjetivos, advervios, pronombres, determinantes, proposiciones, numeros, agrupacion_id):

        self._clasificacion_ideologica_id = None  # PK que asigna la BD
        self._agrupacion_id = agrupacion_id       # FK hacia Agrupación
        self._sustantivos = sustantivos
        self._verbos = verbos
        self._adjetivos = adjetivos
        self._advervios = advervios
        self._pronombres = pronombres
        self._determinantes = determinantes
        self._proposiciones = proposiciones
        self._numeros = numeros

    # PK (solo lectura)
    @property
    def clasificacion_ideologica_id(self):
        return self._clasificacion_ideologica_id

    # FK agrupación
    @property
    def agrupacion_id(self):
        return self._agrupacion_id

    @agrupacion_id.setter
    def agrupacion_id(self, nueva_agrupacion_id):
        self._agrupacion_id = nueva_agrupacion_id

  
    @property
    def sustantivos(self):
        return self._sustantivos

    @sustantivos.setter
    def sustantivos(self, nuevos_sustantivos):
        self._sustantivos = nuevos_sustantivos

    @property
    def verbos(self):
        return self._verbos

    @verbos.setter
    def verbos(self, nuevos_verbos):
        self._verbos = nuevos_verbos

    @property
    def adjetivos(self):
        return self._adjetivos

    @adjetivos.setter
    def adjetivos(self, nuevos_adjetivos):
        self._adjetivos = nuevos_adjetivos


    @property
    def advervios(self):
        return self._advervios

    @advervios.setter
    def advervios(self, nuevos_advervios):
        self._advervios = nuevos_advervios

   
    @property
    def pronombres(self):
        return self._pronombres

    @pronombres.setter
    def pronombres(self, nuevos_pronombres):
        self._pronombres = nuevos_pronombres

    @property
    def determinantes(self):
        return self._determinantes

    @determinantes.setter
    def determinantes(self, nuevos_determinantes):
        self._determinantes = nuevos_determinantes

  
    @property
    def proposiciones(self):
        return self._proposiciones

    @proposiciones.setter
    def proposiciones(self, nuevas_proposiciones):
        self._proposiciones = nuevas_proposiciones

 
    @property
    def numeros(self):
        return self._numeros

    @numeros.setter
    def numeros(self, nuevos_numeros):
        self._numeros = nuevos_numeros