from config.database import db
class TextoProcesado_OpinionExterna(db.Model):
    __tablename__ = 'TextoProcesado_OpinionExterna'

    texto_id = db.Column(db.Integer, db.ForeignKey('TextoProcesado.Texto_id', ondelete='CASCADE'), primary_key=True)
    opinionFE_id = db.Column(db.Integer, db.ForeignKey('OpinionFuenteExterna.OpinionFE_id', ondelete='CASCADE'), primary_key=True)

    texto = db.relationship('TextoProcesado', backref=db.backref('relaciones_externa', cascade="all, delete-orphan"))
    opinion = db.relationship('OpinionExterna', backref=db.backref('relaciones_texto', cascade="all, delete-orphan"))