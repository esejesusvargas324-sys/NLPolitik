from config.database import db

class AgrupacionTextoProcesado(db.Model):
    __tablename__ = 'AgrupacionTextoProcesado'

    _agrupacion_id = db.Column('AT_agrupacion_id', db.Integer, db.ForeignKey('Agrupacion.Agrupacion_id', ondelete='CASCADE'), primary_key=True)
    _texto_id = db.Column('AT_texto_id', db.Integer, db.ForeignKey('TextoProcesado.Texto_id', ondelete='CASCADE'), primary_key=True)

    
    @property
    def agrupacion_id(self):
        return self._agrupacion_id

    @property
    def texto_id(self):
        return self._texto_id