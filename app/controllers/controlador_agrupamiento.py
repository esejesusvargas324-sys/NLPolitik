from collections import defaultdict
from config.database import db
from app.models.agrupacion import Agrupacion
from app.services.procesador_pipeline import ProcesadorPipelineIdeologico
from app.services.procesador_metricas import ProcesadorMetricas
import numpy as np
import time
from sqlalchemy import text

class ControladorAgrupamiento:
    def __init__(
        self,
        nombre_agrupacion: str,
        texto_id: int,
        descripcion: str = "",
        modelo_embedding: str = "beto",
        ruta_modelo: str = None,
        metodo_clustering: str = "kmeans",
        n_clusters: int = 10,
        ideologia_referencia: dict = None
    ):
        self.nombre_agrupacion = nombre_agrupacion
        self.descripcion = descripcion
        self.texto_id = texto_id
        self.modelo_embedding = modelo_embedding
        self.ruta_modelo = ruta_modelo
        self.metodo_clustering = metodo_clustering
        self.n_clusters = n_clusters
        self._ultimo_ping = time.time()
        
    def _mantener_conexion_viva(self, fuerza=False):
        """Ping periódico a la BD para evitar timeout"""
        ahora = time.time()
        
        # Ping cada 5 minutos (300 segundos) o si se fuerza
        if fuerza or (ahora - self._ultimo_ping) > 300:
            try:
                db.session.execute(text('SELECT 1'))
                self._ultimo_ping = ahora
                #print(f"🔌 Ping a BD exitoso ({time.strftime('%H:%M:%S')})")
                return True
            except Exception as e:
                print(f" Error en ping BD: {e}")
                # Forzar nueva sesión
                db.session.remove()
                print(" Sesión de BD reiniciada")
                # Intentar reconectar
                try:
                    db.session.execute(text('SELECT 1'))
                    self._ultimo_ping = ahora
                    print(" Reconexión exitosa")
                    return True
                except:
                    return False
        return True

    def limpiar_json(self, obj):
        if isinstance(obj, dict):
            return {str(k): self.limpiar_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.limpiar_json(v) for v in obj]
        elif isinstance(obj, (np.integer, np.floating)):
            return obj.item()
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, (np.str_, bytes)):
            return str(obj)
        else:
            return obj
    
    def _obtener_id_agrupacion(self, agrupacion_obj):
        """Obtiene el ID de una agrupación de forma robusta"""
        # Método 1: Atributo privado
        if hasattr(agrupacion_obj, '_agrupacion_id') and agrupacion_obj._agrupacion_id:
            return agrupacion_obj._agrupacion_id
        
        # Método 2: Property
        if hasattr(agrupacion_obj, 'agrupacion_id'):
            id_val = agrupacion_obj.agrupacion_id
            if id_val:
                return id_val
        
        # Método 3: Último recurso - consultar BD
        try:
            result = db.session.execute(text("SELECT LAST_INSERT_ID()"))
            last_id = result.scalar()
            if last_id:
                return last_id
        except:
            pass
        
        raise ValueError("No se pudo obtener ID de la agrupación")
            
    def ejecutar_agrupamiento(self, vocabulario: dict) -> int:
        print(f" Iniciando agrupamiento: {self.nombre_agrupacion}")
        print(f"   Método: {self.metodo_clustering}, Embedding: {self.modelo_embedding}")
        
        try:
            # 1. Iniciar con conexión fresca
            db.session.remove()
            self._mantener_conexion_viva(fuerza=True)
            
            # 2. Ejecutar pipeline (parte pesada - puede tardar 30min+)
            print(" Ejecutando pipeline (BERT + Autoencoder + Clustering)...")
            
            pipeline = ProcesadorPipelineIdeologico(
                vocabulario=vocabulario,
                modelo_embedding=self.modelo_embedding,
                ruta_modelo=self.ruta_modelo,
                metodo_clustering=self.metodo_clustering,
                n_clusters=self.n_clusters,
            )

            resultado = pipeline.ejecutar()
            print(" Pipeline ejecutado")
            
            # Ping durante procesamiento
            self._mantener_conexion_viva(fuerza=True)
            
            # 3. Exportar resultados
            datos_exportados = pipeline.exportar_resultados()
            datos_limpios = {k: self.limpiar_json(v) for k, v in datos_exportados.items()}

            # 4. Calcular métricas
            print(" Calculando métricas...")
            procesador_metricas = ProcesadorMetricas(
                X_latente=pipeline.X_latente,
                etiquetas=pipeline.etiquetas,
                palabras=list(pipeline.mapeo.keys())
            )
            
            metricas = procesador_metricas.evaluar()
            self.descripcion = procesador_metricas.interpretar_agrupacion_completa(
                interpretacion=datos_limpios["Agrupacion_interpretacion_ideologica"]
            )
            
            print(" Métricas calculadas")
            
            # 5. Crear instancia del modelo Agrupacion
            print(" Creando objeto Agrupacion...")
            agrupacion_obj = Agrupacion(
                nombre=self.nombre_agrupacion,
                descripcion=self.descripcion,
                asignacion_clusters=datos_limpios["Agrupacion_asignacion_clusters"],
                interpretacion_ideologica=datos_limpios["Agrupacion_interpretacion_ideologica"],
                embeddings_latentes=datos_limpios["Agrupacion_embeddings_latentes"],
                metricas_clustering=datos_limpios["Agrupacion_metricas_clustering"],
                parametros_ejecucion=datos_limpios["Agrupacion_parametros_ejecucion"],
                texto_id=self.texto_id
            )
        
            # 6. Guardar en base de datos con manejo de reconexión
            print(" Guardando en base de datos...")
            
            max_reintentos = 3
            for intento in range(max_reintentos):
                try:
                    db.session.add(agrupacion_obj)
                    db.session.commit()
                    print(f" Commit exitoso (intento {intento + 1})")
                    break
                except Exception as commit_error:
                    if intento < max_reintentos - 1:
                        print(f" Error en commit, reintentando... ({commit_error})")
                        db.session.rollback()
                        time.sleep(2)
                        self._mantener_conexion_viva(fuerza=True)
                        continue
                    else:
                        raise
            
            # 7. Obtener ID de forma robusta
            agrupacion_id = self._obtener_id_agrupacion(agrupacion_obj)
            print(f" Agrupamiento {agrupacion_id} completado exitosamente")
            
            # Ping final
            self._mantener_conexion_viva(fuerza=True)
            
            return agrupacion_id
            
        except Exception as e:
            print(f" Error en ejecutar_agrupamiento: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            raise
    
    @staticmethod
    def eliminar_agrupamiento(id: int) -> bool:
        agrupacion = Agrupacion.query.get(id)
        if not agrupacion:
            return False

        try:
            db.session.delete(agrupacion)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            return False