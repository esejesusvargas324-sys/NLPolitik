from typing import Dict, List
from app.models.opinionTextoProcesado import OpinionTextoProcesado
from app.models.textoProcesado import TextoProcesado
from app.controllers.controlador_opinion import ControladorOpinion
from app.services.procesador_nlp import ProcesadorNLP
import time
import json
from config.database import db

class ControladorNLP:
    def __init__(self):
        self.procesador = ProcesadorNLP()

    def procesar_archivos(self, lista_opiniones: List[Dict[str, str]], usuario_id):
        # Se procesan múltiples opiniones, para generar un registro 
        self.procesador.descargar_recursos()

        lista_textos = []
        opiniones_validas = []

        for entrada in lista_opiniones:
            id_op = entrada["id"]
            origen_manual = entrada.get("origen", "").lower()

            opinion = ControladorOpinion.obtener_opinion_por_id(id_op, origen_manual)
            if not opinion:
                continue

            lista_textos.append((str(opinion.get("titulo", "")), opinion.get("contenido", "")))
            opiniones_validas.append({
                "id": id_op,
                "origen": origen_manual
            })

        if not lista_textos:
            return None

        inicio_global = time.time()
        
        # Se procesan cada uno de los archivo individualmente
        print(" Iniciando procesamiento de archivos...")
        resultados_archivos = []
        
        for titulo, contenido in lista_textos:
            resultado = self.procesador.procesar_archivo_individual(titulo, contenido)
            resultados_archivos.append(resultado)
        
        # Se calculan las métricas globales
        metricas_globales = self.procesador.calcular_metricas_globales(resultados_archivos)
        
        # Se extraer datos organizados por archivo
        textos_completos_por_archivo = [r['texto_limpio'] for r in resultados_archivos]
        frases_por_archivo = [r['frases'] for r in resultados_archivos]
        etiquetas_pos_por_archivo = [r['etiquetas_pos'] for r in resultados_archivos]
        archivos_origen = [r['titulo'] for r in resultados_archivos]
        
        # Se crear instancia de TextoProcesado en el controlador
        texto_procesado_obj = TextoProcesado(
            usuario_id=usuario_id,
            archivos_origen=json.dumps(archivos_origen),
            caracteres_eliminados=metricas_globales['total_caracteres_eliminados'],
            longitud_promedio_frases=metricas_globales['longitud_promedio_frases'],
            total_frases=metricas_globales['total_frases'],
            tiempo_procesar=round(time.time() - inicio_global, 4),
            textos_por_archivo=textos_completos_por_archivo,
            frases_por_archivo=frases_por_archivo,
            etiquetas_pos_por_archivo=etiquetas_pos_por_archivo
        )

        db.session.add(texto_procesado_obj)
        db.session.commit()

        # Se crean relaciones con opiniones
        for op in opiniones_validas:
            texto_id = texto_procesado_obj.texto_procesado_id
            opinion_id = op["id"]

            if op["origen"] == "personal":
                relacion = OpinionTextoProcesado(
                    texto_id=texto_id,
                    opinion_fu_id=opinion_id
                )
            else:
                relacion = OpinionTextoProcesado(
                    texto_id=texto_id,
                    opinion_fe_id=opinion_id
                )
            db.session.add(relacion)

        db.session.commit()

        print("\n * Procesamiento completo")
        print(f"* Tiempo total: {texto_procesado_obj.tiempo_procesar}s")
        print(f"* Caracteres eliminados: {texto_procesado_obj.caracteres_eliminados}")
        print(f"* Total frases extraídas: {texto_procesado_obj.total_frases}")
        print(f"* Longitud promedio de frases: {texto_procesado_obj.longitud_promedio_frases:.2f} palabras")

        return texto_procesado_obj.texto_procesado_id
 
    @staticmethod
    def eliminar_texto_procesado(id: int) -> bool:
        texto_procesado = TextoProcesado.query.get(id)
        if not texto_procesado:
            return False

        try:
            db.session.delete(texto_procesado)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error al eliminar texto procesado: {e}")
            db.session.rollback()
            return False