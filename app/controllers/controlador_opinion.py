from app.models.opinionExterna import OpinionExterna
from app.models.opinionUsuario import OpinionUsuario
from typing import Union
import datetime
from config.database import db


class ControladorOpinion:
    
    @staticmethod
    def insertar_opinion_externa(opinion: OpinionExterna):
        db.session.add(opinion)
        db.session.commit()
        return opinion

    @staticmethod
    def actualizar_opinion_externa(id: int, datos: dict):
        opinion = OpinionExterna.query.get(id)
        if not opinion:
            return None

        opinion.titulo = datos.get("titulo", opinion.titulo)
        opinion.contenido = datos.get("contenido", opinion.contenido)
        opinion.autor = datos.get("autor", opinion.autor)
        opinion.fuente = datos.get("fuente", opinion.fuente)

        if datos.get("fecha"):
            opinion.fecha = datetime.datetime.strptime(datos["fecha"], "%Y-%m-%d")

        db.session.commit()
        return opinion


    @staticmethod
    def eliminar_opinion_externa(id: int) -> bool:
        opinion = OpinionExterna.query.get(id)
        if not opinion:
            return False

        try:
            db.session.delete(opinion)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error al eliminar opinión externa: {e}")
            db.session.rollback()
            return False
                
    @staticmethod
    def insertar_opinion_usuario(opinion: OpinionUsuario):
        db.session.add(opinion)
        db.session.commit()
        return opinion
    
    @staticmethod
    def actualizar_opinion_usuario(id: int, datos: dict):
        opinion = OpinionUsuario.query.get(id)
        if not opinion:
            return None

        opinion.titulo = datos.get("titulo", opinion.titulo)
        opinion.contenido = datos.get("contenido", opinion.contenido)
        if datos.get("fecha"):
            opinion.fecha = datetime.datetime.strptime(datos["fecha"], "%Y-%m-%d")

        db.session.commit()
        return opinion
    
    
    @staticmethod
    def eliminar_opinion_usuario(id: int) -> bool:
        opinion = OpinionUsuario.query.get(id)
        if not opinion:
            return False

        try:
            db.session.delete(opinion)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error al eliminar opinión externa: {e}")
            db.session.rollback()
            return False

    @staticmethod
    def obtener_todas_las_opiniones(usuario_id):
        opiniones_externas = OpinionExterna.query.filter_by(_usuario_id=usuario_id).all()
        opiniones_personales = OpinionUsuario.query.filter_by(_usuario_id=usuario_id).all()

        registros = []

        for op in opiniones_externas:
            registros.append({
                "id": op.opinion_externa_id,
                "origen": "Externo",
                "titulo": op.titulo,
                "fecha": op.fecha.date() if hasattr(op.fecha, "date") else op.fecha,
            })

        for op in opiniones_personales:
            registros.append({
                "id": op.opinion_usuario_id,
                "origen": "Personal",
                "titulo": op.titulo,
                "fecha": op.fecha.date() if hasattr(op.fecha, "date") else op.fecha,
            })

        registros.sort(key=lambda x: x["fecha"])
        return registros
    


    @staticmethod
    def obtener_titulo_por_id(id_opinion: int, origen: str) -> Union[str, None]:
        """
        Retorna el título de la opinión dado su ID y tipo de origen.
        """
        if origen.lower() == "externo":
            opinion = OpinionExterna.query.get(id_opinion)
        elif origen.lower() == "personal":
            opinion = OpinionUsuario.query.get(id_opinion)
        else:
            return None

        return opinion.titulo if opinion else None
    
    @staticmethod
    def obtener_opinion_por_id(id_opinion: int, origen: str = None) -> Union[dict, None]:
        print(f"id_opinion recibido: {id_opinion} (tipo: {type(id_opinion)}), origen: {origen}")

        if origen == "personal":
            opinion = OpinionUsuario.query.filter_by(_opinion_usuario_id=id_opinion).first()
            if opinion:
                return {
                    "titulo": opinion._titulo,
                    "contenido": opinion._contenido,
                    "origen": "personal"
                }

        if origen == "externo":
            opinion = OpinionExterna.query.filter_by(_opinion_externa_id=id_opinion).first()
            if opinion:
                return {
                    "titulo": opinion._titulo,
                    "contenido": opinion._contenido,
                    "origen": "externo"
                }

        return None