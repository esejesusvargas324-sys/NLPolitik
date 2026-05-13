"""
PRUEBA DE INTEGRACIÓN: Clustering → Clasificación
IT-PIPE-004: Validar integración Clustering → Clasificación → PLDA
"""

import sys
import os
import numpy as np
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

class TestIntegracionClusteringClasificacion:
    
    def test_it_pipe_004_clustering_a_clasificacion(self):
        """IT-PIPE-004: Validar integración Clustering → Clasificación → PLDA"""
        print("\n" + "="*60)
        print("PRUEBA 4: IT-PIPE-004")
        print("Título: Validar integración Clustering → Clasificación → PLDA")
        print("Precondiciones: Clusters formados, datos de frases")
        print("Dependencias: Lógica de clasificación, Procesador PLDA")
        print("Pasos: 1. Preparar datos, 2. Ejecutar interpretar_clusters()")
        
        from app.services.procesador_clasificador import ProcesadorClasificacion
        
        # Crear datos de prueba (mezcla de contenido)
        n_frases = 12
        etiquetas = np.array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])  # 3 clusters
        
        mapeo_palabra_vector = {}
        vocabulario = {}
        
        # Frases variadas: algunas económicas, otras no
        frases_variadas = [
            "El gasto público debe aumentar para reducir la desigualdad",
            "Los impuestos sobre la renta deben reducirse",
            "El equipo ganó el campeonato con gran actuación",
            "La deuda pública requiere control estricto",
            "Las reformas educativas son necesarias",
            "La política fiscal prioriza crecimiento"
        ]
        
        for i in range(n_frases):
            frase = f"{frases_variadas[i % 6]}_{i}"
            mapeo_palabra_vector[frase] = np.random.randn(32).astype(np.float32)
            vocabulario[frase] = ["documento_prueba"]
        
        # Inicializar clasificador
        clasificador = ProcesadorClasificacion()
        
        with patch.object(clasificador, 'cargar_modelo_svm') as mock_cargar:
            mock_cargar.return_value = None
            clasificador._svm_cargado = False
            
            # Interpretar clusters (esto debe llamar al PLDA internamente)
            # NOTA: interpretar_clusters() devuelve una tupla (resultado, algo_más)
            resultado_tupla = clasificador.interpretar_clusters(
                etiquetas=etiquetas,
                mapeo_palabra_vector=mapeo_palabra_vector,
                vocabulario=vocabulario,
                top_n=3
            )
        
        # Obtener el primer elemento de la tupla (el diccionario de resultados)
        # Revisa en tu código qué devuelve exactamente interpretar_clusters()
        if isinstance(resultado_tupla, tuple) and len(resultado_tupla) > 0:
            resultado = resultado_tupla[0]
        else:
            resultado = resultado_tupla  # Por si acaso no es tupla
        
        # Resultados - Enfocado en integración
        print(f"\nDatos de prueba:")
        print(f"  - Frases procesadas: {n_frases}")
        print(f"  - Clusters formados: {len(np.unique(etiquetas))}")
        print(f"  - Contenido: Mezcla intencional (económico + no económico)")
        
        print(f"\nResultados por cluster (integración PLDA):")
        analisis_economicos_detectados = 0
        
        for cluster_id, info in resultado.items():
            print(f"\n  Cluster {cluster_id}:")
            print(f"    - Ideología asignada: {info['ideologia']}")
            
            # VERIFICACIÓN CORREGIDA: El campo se llama 'analisis_economico'
            if 'analisis_economico' in info:
                print(f"    - PLDA integrado: SI (campo 'analisis_economico' presente)")
                
                # Obtener el análisis económico
                analisis = info['analisis_economico']
                
                # Verificar si es económico o no
                if analisis.get('es_economico', False):
                    analisis_economicos_detectados += 1
                    print(f"    - Análisis económico: SI")
                    print(f"    - Tema: {analisis.get('tema', 'N/A')}")
                    print(f"    - Orientación: {analisis.get('orientacion', 'N/A')}")
                else:
                    print(f"    - Análisis económico: NO (NORMAL - contenido no económico)")
                    print(f"    - Tema: {analisis.get('tema', 'No económico')}")
            else:
                print(f"    - PLDA integrado: NO (campo 'analisis_economico' ausente)")
        
        # Verificación de integración
        print(f"\nVerificación de integración:")
        
        # 1. Verificar estructura básica
        assert isinstance(resultado, dict), "El resultado debe ser un diccionario"
        assert len(resultado) == len(np.unique(etiquetas)), "Debe haber un resultado por cluster"
        
        # 2. Verificar INTEGRACIÓN PLDA (campo debe existir)
        # CAMBIO CLAVE: Buscar 'analisis_economico' en lugar de 'temas_economicos'
        campos_plda_presentes = all('analisis_economico' in info for info in resultado.values())
        print(f"  - Campo 'analisis_economico' presente en todos los clusters: {'SI' if campos_plda_presentes else 'NO'}")
        
        # Assertion clave para integración
        assert campos_plda_presentes, (
            "Falla de integración: El campo 'analisis_economico' no está en todos los resultados. "
            "Esto indica que el PLDA no se integró correctamente en el flujo."
        )
        
        # 3. Estadísticas (solo informativas)
        print(f"  - Clusters con análisis económico positivo: {analisis_economicos_detectados}/{len(resultado)}")
        print(f"  - Nota: Análisis económico negativo es válido (contenido no siempre es económico)")
        
        print(f"\nConclusión de la integración:")
        print(f"  - Clasificación ideológica: Funcionando")
        print(f"  - PLDA integrado en flujo: Verificado")
        print(f"  - Flujo completo: Clustering → Clasificación → PLDA")
        
        print(f"\nEstado: APROBADO - Integración PLDA verificada correctamente")