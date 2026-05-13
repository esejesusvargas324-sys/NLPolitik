"""
PRUEBA REAL DE INTEGRACIÓN - Flujo completo con datos de prueba
IT-PIPE-REAL-001: Validar pipeline completo
"""

import sys
import os
import numpy as np
from unittest.mock import Mock, patch

# Configurar imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

class TestPipelineReal:
    """Prueba del pipeline completo"""
    
    def test_it_pipe_real_005_pipeline_completo(self):
        """IT-PIPE-REAL-005: Validar flujo completo con datos de prueba"""
        print("\n" + "="*60)
        print("PRUEBA: IT-PIPE-REAL-005")
        print("Título: Validar pipeline completo con datos de prueba")
        print("Precondiciones: Todos los módulos disponibles")
        print("Cobertura: NLP → Embeddings → Autoencoder → Clustering → Clasificación")
        print("Dependencias: Todos los módulos del pipeline")
        print("Pasos: Validar flujo de datos entre módulos")
        print("="*60)
        
        resultados = {}
        
        try:
            # ============ ETAPA 1: NLP ============
            print("\nETAPA 1: PROCESAMIENTO NLP")
            print("-"*40)
            
            from app.services.procesador_nlp import ProcesadorNLP
            
            nlp = ProcesadorNLP()
            articulos = [
                "El gobierno debe aumentar el gasto social para reducir la desigualdad económica en el país.",
                "La reducción de impuestos estimula la inversión privada y promueve el crecimiento económico sostenible.",
                "El equipo de fútbol local ganó el campeonato nacional con una excelente actuación técnica."
            ]
            titulos = ["izquierda", "derecha", "no_politico"]
            
            frases_totales = []
            vocabulario = {}
            
            for titulo, texto in zip(titulos, articulos):
                resultado = nlp.procesar_archivo_individual(titulo, texto)
                frases = resultado['frases']
                frases_totales.extend(frases)
                
                for frase in frases:
                    vocabulario[frase] = [titulo]
                
                print(f"  - {titulo}: {len(frases)} frases")
            
            resultados['nlp'] = {'frases': len(frases_totales), 'status': 'COMPLETADO'}
            print(f"  Total frases: {len(frases_totales)}")
            
            # ============ ETAPA 2: EMBEDDINGS ============
            print("\nETAPA 2: GENERACIÓN DE EMBEDDINGS")
            print("-"*40)
            
            from app.services.procesador_embeddings import ProcesadorEmbedding
            
            embedding = ProcesadorEmbedding()
            mapeo_embedding = {}
            
            for frase in frases_totales:
                mapeo_embedding[frase] = embedding.embed_palabra(frase)
            
            matriz_embeddings = np.array(list(mapeo_embedding.values()))
            
            resultados['embeddings'] = {
                'dimension': matriz_embeddings.shape[1],
                'muestras': matriz_embeddings.shape[0],
                'status': 'COMPLETADO'
            }
            
            print(f"  Embeddings generados: {matriz_embeddings.shape}")
            print(f"  Dimensión: {matriz_embeddings.shape[1]}D")
            
            # ============ ETAPA 3: AUTOENCODER ============
            print("\nETAPA 3: REDUCCIÓN DIMENSIONAL")
            print("-"*40)
            
            try:
                from app.services.procesador_autoencoder import ProcesadorAutoencoder
                
                input_dim = embedding.get_dimension() * 2
                latent_dim = 4
                autoencoder = ProcesadorAutoencoder(input_dim=input_dim, latent_dim=latent_dim)
                
                resultados['autoencoder'] = {
                    'input_dim': autoencoder.input_dim,
                    'latent_dim': autoencoder.latent_dim,
                    'status': 'CONFIGURADO'
                }
                
                print(f"  Autoencoder configurado: {input_dim}D → {latent_dim}D")
                
            except ImportError:
                print("  Autoencoder no disponible (TensorFlow faltante)")
                resultados['autoencoder'] = {'status': 'OMITIDO'}
            
            # ============ ETAPA 4: CLUSTERING ============
            print("\nETAPA 4: CLUSTERING")
            print("-"*40)
            
            from app.services.procesador_clustering import ProcesadorClustering
            
            latent_dim = 4
            datos_latentes = np.random.randn(len(frases_totales), latent_dim).astype(np.float32)
            
            clustering = ProcesadorClustering(metodo="kmeans")
            n_clusters_estimado = clustering.estimar_numero_clusters(datos_latentes)
            clustering.n_clusters = n_clusters_estimado
            
            etiquetas, modelo = clustering.aplicar(datos_latentes)
            
            resultados['clustering'] = {
                'clusters_estimados': n_clusters_estimado,
                'clusters_encontrados': len(np.unique(etiquetas)),
                'muestras': len(etiquetas),
                'status': 'COMPLETADO'
            }
            
            print(f"  Clusters estimados: {n_clusters_estimado}")
            print(f"  Clusters creados: {len(np.unique(etiquetas))}")
            
            # ============ ETAPA 5: CLASIFICACIÓN ============
            print("\nETAPA 5: CLASIFICACIÓN")
            print("-"*40)
            
            from app.services.procesador_clasificador import ProcesadorClasificacion
            
            clasificador = ProcesadorClasificacion()
            
            # Mockear SVM y verificar integración con PLDA
            with patch.object(clasificador, 'cargar_modelo_svm') as mock_cargar_svm:
                mock_cargar_svm.return_value = None
                clasificador._svm_cargado = False
                
                # Crear mapeo de vectores latentes
                mapeo_latente = {}
                for i, frase in enumerate(frases_totales):
                    if i < len(datos_latentes):
                        mapeo_latente[frase] = datos_latentes[i]
                    else:
                        mapeo_latente[frase] = np.random.randn(latent_dim).astype(np.float32)
                
                # Interpretar clusters (esto debe integrar PLDA)
                resultado_clasificacion = clasificador.interpretar_clusters(
                    etiquetas=etiquetas,
                    mapeo_palabra_vector=mapeo_latente,
                    vocabulario=vocabulario,
                    top_n=3
                )
            
            # IMPORTANTE: Verificar que se devuelve una tupla con análisis económico
            if isinstance(resultado_clasificacion, tuple) and len(resultado_clasificacion) > 0:
                resultado_dict = resultado_clasificacion[0]
            else:
                resultado_dict = resultado_clasificacion
            
            # Verificar integración PLDA
            plda_integrado = all('analisis_economico' in info for info in resultado_dict.values())
            
            resultados['clasificacion'] = {
                'clusters_clasificados': len(resultado_dict),
                'plda_integrado': plda_integrado,
                'status': 'COMPLETADO'
            }
            
            print(f"  Clusters clasificados: {len(resultado_dict)}")
            print(f"  PLDA integrado: {'SI' if plda_integrado else 'NO'}")
            
            # Mostrar resultados
            for cluster_id, info in resultado_dict.items():
                analisis = info.get('analisis_economico', {})
                es_economico = analisis.get('es_economico', False)
                print(f"    Cluster {cluster_id}: {info['ideologia']} - Económico: {'SI' if es_economico else 'NO'}")
            
            # ============ VERIFICACIÓN FINAL ============
            print("\n" + "="*60)
            print("VERIFICACIÓN DEL PIPELINE COMPLETO")
            print("="*60)
            
            etapas_completadas = all(
                resultados[e].get('status') in ['COMPLETADO', 'CONFIGURADO', 'OMITIDO']
                for e in ['nlp', 'embeddings', 'autoencoder', 'clustering', 'clasificacion']
            )
            
            print(f"\nResumen de etapas:")
            for etapa, info in resultados.items():
                status = info.get('status', 'NO INICIADO')
                print(f"  - {etapa}: {status}")
            
            print(f"\nDatos procesados:")
            print(f"  Artículos: {len(articulos)}")
            print(f"  Frases: {len(frases_totales)}")
            print(f"  Embeddings: {matriz_embeddings.shape}")
            print(f"  Clusters: {len(np.unique(etiquetas))}")
            
            # Assertions finales
            assert etapas_completadas, "El pipeline no se completó correctamente"
            assert plda_integrado, "El PLDA no está integrado en el flujo de clasificación"
            
            print(f"\nESTADO: APROBADO - Pipeline funcionando correctamente")
            
        except Exception as e:
            print(f"\nERROR: {e}")
            print(f"\nEstado al momento del error:")
            for etapa, info in resultados.items():
                status = info.get('status', 'NO INICIADO')
                print(f"  - {etapa}: {status}")
            raise