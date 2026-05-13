from app.models.textoProcesado import TextoProcesado
from app.models.textoProcesadoOE import TextoProcesado_OpinionExterna
from app.models.textoProcesadoOU import TextoProcesado_OpinionUsuario
from config.database import db

class ControladorTextoProcesado:
    def obtener_por_id(self, texto_id: int):
        texto = db.session.query(TextoProcesado).filter_by(_texto_procesado_id=texto_id).first()
        if not texto:
            return None

        vocabulario = texto.vocabulario.split()

        rel_externa = db.session.query(TextoProcesado_OpinionExterna).filter_by(texto_id=texto_id).first()
        if rel_externa and rel_externa.opinion:
            nombre_archivo = rel_externa.opinion._titulo
            return nombre_archivo, vocabulario

        rel_usuario = db.session.query(TextoProcesado_OpinionUsuario).filter_by(texto_id=texto_id).first()
        if rel_usuario and rel_usuario.opinion:
            nombre_archivo = rel_usuario.opinion._titulo
            return nombre_archivo, vocabulario

        nombre_archivo = f"Texto_{texto_id}"
        return nombre_archivo, vocabulario


    def obtener_titulo_por_id(self, texto_id: int) -> str:
        texto = db.session.query(TextoProcesado).filter_by(_texto_procesado_id=texto_id).first()
        if not texto:
            return f"Texto_{texto_id}"

        rel_externa = db.session.query(TextoProcesado_OpinionExterna).filter_by(texto_id=texto_id).first()
        if rel_externa and rel_externa.opinion:
            return rel_externa.opinion._titulo

        rel_usuario = db.session.query(TextoProcesado_OpinionUsuario).filter_by(texto_id=texto_id).first()
        if rel_usuario and rel_usuario.opinion:
            return rel_usuario.opinion._titulo

        return f"Texto_{texto_id}"


    def obtener_lista(self, lista_ids: list[int]):
        resultados = []
        for texto_id in lista_ids:
            resultado = self.obtener_por_id(texto_id)
            if resultado:
                resultados.append(resultado)  # ahora es (nombre, vocabulario, texto)
        return resultados