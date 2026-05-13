from config.database import db

class OpinionTextoProcesado(db.Model):
    __tablename__ = 'OpinionTextoProcesado'

    _otp_id = db.Column('OTP_id', db.Integer, primary_key=True, autoincrement=True)

    _texto_id = db.Column('Texto_id', db.Integer, db.ForeignKey('TextoProcesado.Texto_id', ondelete='CASCADE'), nullable=False)
    _opinion_fu_id = db.Column('OpinionFU_id', db.Integer, db.ForeignKey('OpinionFuenteUsuario.OpinionFU_id', ondelete='CASCADE'), nullable=True)
    _opinion_fe_id = db.Column('OpinionFE_id', db.Integer, db.ForeignKey('OpinionFuenteExterna.OpinionFE_id', ondelete='CASCADE'), nullable=True)

    def __init__(self, texto_id, opinion_fu_id=None, opinion_fe_id=None):
        self._texto_id = texto_id
        self._opinion_fu_id = opinion_fu_id
        self._opinion_fe_id = opinion_fe_id

    # Getters
    @property
    def otp_id(self):
        return self._otp_id

    @property
    def texto_id(self):
        return self._texto_id

    @property
    def opinion_fu_id(self):
        return self._opinion_fu_id

    @property
    def opinion_fe_id(self):
        return self._opinion_fe_id

    # Setters
    @texto_id.setter
    def texto_id(self, value):
        self._texto_id = value

    @opinion_fu_id.setter
    def opinion_fu_id(self, value):
        self._opinion_fu_id = value

    @opinion_fe_id.setter
    def opinion_fe_id(self, value):
        self._opinion_fe_id = value
