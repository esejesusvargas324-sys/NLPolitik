from config.database import db
from app.models.historialClasificacion import HistorialClasificacion
from app.models.textoProcesado import TextoProcesado
from app.models.opinionTextoProcesado import OpinionTextoProcesado
from app.models.opinionExterna import OpinionExterna
from app.models.opinionUsuario import OpinionUsuario
from app.models.agrupacion import Agrupacion

class ControladorHistorial:
    def __init__(self):
        pass  # Puedes agregar dependencias aquí si lo necesitas


    def guardar(self, agrupacion_id, comentario="", favorito=False):
        if not agrupacion_id:
            raise ValueError("El ID de agrupación es obligatorio.")


        nuevo_historial = HistorialClasificacion(
            agrupacion_id=agrupacion_id,
            comentario=comentario,
            favorito=favorito
        )

        try:
            db.session.add(nuevo_historial)
            db.session.commit()
            return {"mensaje": "Historial guardado correctamente", "id": nuevo_historial.historial_id}
        except Exception as e:
            db.session.rollback()
            raise RuntimeError(f"Error al guardar historial: {e}")
    

    def obtener_historiales(self, usuario_id):
        """
        Obtiene solo los historiales de agrupaciones que pertenecen al usuario
        """
        try:
            print(f"Buscando historiales para usuario: {usuario_id}")
            
            # Paso 1: Obtener todas las opiniones del usuario
            opiniones_usuario = OpinionUsuario.query.filter(
                OpinionUsuario._usuario_id == usuario_id
            ).all()
            
            opiniones_externas = OpinionExterna.query.filter(
                OpinionExterna._usuario_id == usuario_id
            ).all()
            
            # Extraer IDs
            opiniones_usuario_ids = [o._opinion_usuario_id for o in opiniones_usuario]
            opiniones_externas_ids = [o._opinion_externa_id for o in opiniones_externas]
            
            if not opiniones_usuario_ids and not opiniones_externas_ids:
                print("El usuario no tiene opiniones")
                return []
            
            print(f"Opiniones usuario: {len(opiniones_usuario_ids)}, Opiniones externas: {len(opiniones_externas_ids)}")
            
            # Paso 2: A través de OpinionTextoProcesado, obtener los TextoProcesado
            textos_ids = set()
            
            # Buscar textos relacionados con opiniones de usuario
            if opiniones_usuario_ids:
                textos_from_usuario = OpinionTextoProcesado.query.filter(
                    OpinionTextoProcesado._opinion_fu_id.in_(opiniones_usuario_ids)
                ).all()
                for t in textos_from_usuario:
                    textos_ids.add(t._texto_id)
            
            # Buscar textos relacionados con opiniones externas
            if opiniones_externas_ids:
                textos_from_externa = OpinionTextoProcesado.query.filter(
                    OpinionTextoProcesado._opinion_fe_id.in_(opiniones_externas_ids)
                ).all()
                for t in textos_from_externa:
                    textos_ids.add(t._texto_id)
            
            if not textos_ids:
                print("No hay textos procesados para las opiniones del usuario")
                return []
            
            print(f"Textos procesados encontrados: {len(textos_ids)}")
            
            # Paso 3: Obtener agrupaciones que usan esos textos
            agrupaciones = Agrupacion.query.filter(
                Agrupacion._texto_id.in_(textos_ids)
            ).all()
            
            if not agrupaciones:
                print("No hay agrupaciones para estos textos")
                return []
            
            agrupaciones_ids = [a._agrupacion_id for a in agrupaciones]
            print(f"Agrupaciones encontradas: {len(agrupaciones_ids)}")
            
            # Paso 4: Obtener historial de esas agrupaciones
            historiales = HistorialClasificacion.query.filter(
                HistorialClasificacion._agrupacion_id.in_(agrupaciones_ids)
            ).order_by(
                HistorialClasificacion._fecha_creacion.desc()
            ).all()
            
            print(f"Historiales encontrados: {len(historiales)}")
            
            # Paso 5: Formatear resultado
            resultado = []
            for idx, h in enumerate(historiales, start=1):
                # Buscar la agrupación correspondiente
                agrupacion = next((a for a in agrupaciones if a._agrupacion_id == h._agrupacion_id), None)
                
                resultado.append({
                    "numero": idx,
                    "nombre": agrupacion._nombre if agrupacion else f"Agrupación {h._agrupacion_id}",
                    "fecha": h._fecha_creacion.strftime("%Y-%m-%d") if h._fecha_creacion else "Fecha no disponible",
                    "favorito": 1 if h._favorito else 0,
                    "historial_id": h._historial_id
                })
            
            print(f"Total resultados para usuario {usuario_id}: {len(resultado)}")
            return resultado
            
        except Exception as e:
            print(f"Error en obtener_historiales: {e}")
            import traceback
            traceback.print_exc()
            return []


    def eliminar_historial(self, historial_id):
        historial = HistorialClasificacion.query.get(historial_id)
        if not historial:
            return {"message": "Historial no encontrado"}, 404

        try:
            #  Obtener la agrupación asociada
            agrupacion = Agrupacion.query.get(historial.agrupacion_id)
            if not agrupacion:
                return {"message": "Agrupación asociada no encontrada"}, 404

            #  Obtener el texto procesado asociado a la agrupación
            texto = agrupacion.texto_procesado
            if not texto:
                return {"message": "Texto procesado asociado no encontrado"}, 404

            #  Eliminar el texto procesado directamente
            db.session.delete(texto)
            db.session.commit()

            return {"message": "Historial eliminado correctamente"}, 200

        except Exception as e:
            print(f"[ERROR] al eliminar historial {historial_id}, agrupación y texto: {e}")
            return {"message": "Error interno al eliminar historial y dependencias"}, 500
        
    def actualizar_favorito(self, historial_id, nuevo_estado):
        historial = HistorialClasificacion.query.get(historial_id)
        if not historial:
            return {"error": "Historial no encontrado"}, 404

        try:
            historial.favorito = nuevo_estado
            db.session.commit()
            return {"mensaje": "Preferencia actualizada"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Error al actualizar favorito: {e}"}, 500

