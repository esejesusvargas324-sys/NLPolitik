from config.database import db
class TextoProcesado_OpinionUsuario(db.Model):
    __tablename__ = 'TextoProcesado_OpinionUsuario'

    texto_id = db.Column(db.Integer, db.ForeignKey('TextoProcesado.Texto_id', ondelete='CASCADE'), primary_key=True)
    opinionFU_id = db.Column(db.Integer, db.ForeignKey('OpinionFuenteUsuario.OpinionFU_id', ondelete='CASCADE'), primary_key=True)

    texto = db.relationship('TextoProcesado', backref=db.backref('relaciones_usuario', cascade="all, delete-orphan"))
    opinion = db.relationship('OpinionUsuario', backref=db.backref('relaciones_texto', cascade="all, delete-orphan"))