from collections import defaultdict, Counter
from typing import Dict, List, Optional, Union
import numpy as np
from nltk.corpus import stopwords

from app.services.procesador_plda import procesador_plda
from app.models_machine_learning.models_svm.procesador_svm_clasificador import ProcesadorSVMClasificador

stop_words_espanol = stopwords.words('spanish')

class ProcesadorClasificacion:

    #Clase para clasificar clusters usando SVM y análisis económico con PLDA.
    
    
    def __init__(self):
        # Variable para cachear el modelo SVM
        self._svm_clasificador = None
        self._svm_cargado = False

    def cargar_modelo_svm(self):
        # Se carga el modelo SVM pre-entrenado una sola vez.
    
        if self._svm_clasificador is None:
            try:
                self._svm_clasificador = ProcesadorSVMClasificador()
                self._svm_clasificador.cargar_modelo("app/models_machine_learning/models_svm/svm_model_final_version_ya.pkl")
                self._svm_cargado = True
                print(" Modelo SVM cargado exitosamente")
                if hasattr(self._svm_clasificador, 'le'):
                    print(f" Clases disponibles: {list(self._svm_clasificador.le.classes_)}")
            except Exception as e:
                print(f" Error cargando modelo SVM: {e}")
                self._svm_clasificador = None
                self._svm_cargado = False
        return self._svm_clasificador

    def identificar_tema_economico(self, palabras: List[str], cluster_id: Optional[str] = None) -> Dict[str, Union[str, int, List[str]]]:
        """Se aplica PLDA para detectar si hay un tema económico."""
        return procesador_plda.identificar_tema_plda(palabras, cluster_id)

    def obtener_palabras_representativas(self, frases_en_cluster: List[str], 
                                       mapeo_palabra_vector: Dict[str, np.ndarray], 
                                       top_n: int = 20) -> List[str]:
        # Se obtienen las palabras más representativas basadas en distancia al centroide.
    
        vectores_cluster = [mapeo_palabra_vector[f] for f in frases_en_cluster if f in mapeo_palabra_vector]
        if not vectores_cluster:
            return []

        centroide = np.mean(vectores_cluster, axis=0)
        distancias = {}
        
        for frase in frases_en_cluster:
            if frase in mapeo_palabra_vector:
                distancias[frase] = np.linalg.norm(mapeo_palabra_vector[frase] - centroide)
        
        return sorted(distancias, key=distancias.get)[:top_n]
    
    def determinar_ideologia_final(self, frases_en_cluster: List[str], 
                                predicciones: Dict[str, str],
                                analisis_economico: Dict) -> str:
        
        # 1. CONTEO DE PREDICCIONES
        conteo = defaultdict(int)
        for frase in frases_en_cluster:
            ideologia = predicciones.get(frase, "no_politico")
            conteo[ideologia] += 1
        
        total_frases = len(frases_en_cluster)
        
        # Filtrar solo conteos políticos (izquierda/derecha)
        conteo_politico = {k: v for k, v in conteo.items() if k in ['izquierda', 'derecha']}
        total_politico = sum(conteo_politico.values())
        
        # UMBRALES DE DECISIÓN
        UMBRAL_MINIMO_POLITICO = 0.20      # 20% mínimo de contenido político
        UMBRAL_CONFIANZA_ALTA = 0.60       # 60% para mayoría clara
        MINIMO_FRASES_POLITICAS = 3        # Mínimo 3 frases políticas
        UMBRAL_MAYORIA_NO_POLITICO = 0.85  # 85% no_político para descartar
        
        # Porcentaje de contenido no político
        porcentaje_no_politico = (total_frases - total_politico) / total_frases
        
        # ---------------------------------------------------------------------
        # ÁRBOL DE DECISIONES (Jerarquía clara if-elif-else)
        # ---------------------------------------------------------------------
        
        # CASO 1: CLUSTER MAYORITARIAMENTE NO POLÍTICO (≥85%)
        # Filtro más estricto: si hay mucho contenido no político, descartar
        if porcentaje_no_politico >= UMBRAL_MAYORIA_NO_POLITICO:
            return "no_politico"
        
        # CASO 2: INSUFICIENTE MATERIAL POLÍTICO (<3 frases políticas)
        # No hay suficiente evidencia para clasificar como político
        elif total_politico < MINIMO_FRASES_POLITICAS:
            # CASO 2.1: Pero si tiene 2 frases políticas Y es económico → clasificar
            if analisis_economico.get("es_economico", False) and total_politico >= 2:
                return max(conteo_politico.items(), key=lambda x: x[1])[0]
            # CASO 2.2: De lo contrario → no político
            else:
                return "no_politico"
        
        # CASO 3: SUFICIENTE MATERIAL POLÍTICO (≥3 frases políticas)
        # Ahora evaluamos el contenido político en detalle
        else:
            porcentaje_politico = total_politico / total_frases
            
            # CASO 3.1: CONTENIDO POLÍTICO INSUFICIENTE (<20%)
            # Aunque hay frases políticas, es porcentaje muy bajo
            if porcentaje_politico < UMBRAL_MINIMO_POLITICO:
                # CASO 3.1.1: Si es económico → clasificar
                if analisis_economico.get("es_economico", False) and total_politico >= 2:
                    return max(conteo_politico.items(), key=lambda x: x[1])[0]
                # CASO 3.1.2: Si no es económico → no político
                else:
                    return "no_politico"
            
            # CASO 3.2: CONTENIDO POLÍTICO SUFICIENTE (≥20%)
            # Ahora podemos hacer análisis ideológico detallado
            else:
                # CASO 3.2.1: UNA SOLA IDEOLOGÍA POLÍTICA
                if len(conteo_politico) == 1:
                    return list(conteo_politico.keys())[0]
                
                # CASO 3.2.2: MÚLTIPLES IDEOLOGÍAS (izquierda y derecha)
                else:
                    izquierda = conteo_politico.get('izquierda', 0)
                    derecha = conteo_politico.get('derecha', 0)
                    total_votos = izquierda + derecha
                    proporcion_mayoria = max(izquierda, derecha) / total_votos
                    
                    # CASO 3.2.2.1: MUY POCA EVIDENCIA POLÍTICA (<4 votos totales)
                    if total_votos < 4:
                        return "no_politico"
                    
                    # CASO 3.2.2.2: EMPATE EXACTO
                    elif izquierda == derecha:
                        return "neutral"
                    
                    # CASO 3.2.2.3: MAYORÍA CLARA (≥60%)
                    elif proporcion_mayoria >= UMBRAL_CONFIANZA_ALTA:
                        return max(conteo_politico.items(), key=lambda x: x[1])[0]
                    
                    # CASO 3.2.2.4: MAYORÍA DÉBIL (50-60%)
                    else:
                        # CASO 3.2.2.4.1: Si es económico → favorecer mayoría
                        if analisis_economico.get("es_economico", False):
                            return max(conteo_politico.items(), key=lambda x: x[1])[0]
                        # CASO 3.2.2.4.2: Si no es económico → neutral
                        else:
                            return "neutral"
        
    def interpretar_clusters(self,
                    etiquetas: np.ndarray,
                    mapeo_palabra_vector: Dict[str, np.ndarray],
                    vocabulario: Dict[str, List[str]],
                    top_n: int = 20) -> Dict[int, Dict]:
        
        print(" * Iniciando interpretación de clusters...")
        
        # Cargar modelo SVM
        clasificador = self.cargar_modelo_svm()
        
        # Agrupar palabras por cluster
        cluster_dict = defaultdict(list)
        frases_actuales = list(mapeo_palabra_vector.keys())
        
        for idx, etiqueta in enumerate(etiquetas):
            cluster_dict[etiqueta].append(frases_actuales[idx])

        # Clasificar frases individuales con SVM
        predicciones = {}
        if clasificador and self._svm_cargado and frases_actuales:
            print(" Clasificando frases con SVM...")
            predicciones_array = clasificador.predecir_frases(frases_actuales)
            predicciones = dict(zip(frases_actuales, predicciones_array))
        else:
            print(" Usando clasificación neutral (SVM no disponible)")
            predicciones = {frase: "neutral" for frase in frases_actuales}

        total_palabras = len(mapeo_palabra_vector)
        resultado = {}

        # Procesar cada cluster
        for cl, frases_en_cluster in cluster_dict.items():
            print(f" * Procesando cluster {cl} con {len(frases_en_cluster)} frases...")
            
            # MODIFICACIÓN: Pasar el cluster ID al análisis económico
            # Convertir cl a string para comparar con '-1'
            cluster_id_str = str(cl)
            analisis_economico = self.identificar_tema_economico(frases_en_cluster, cluster_id_str)
            
            # Determinar ideología final
            ideologia_final = self.determinar_ideologia_final(frases_en_cluster, predicciones, analisis_economico)
            
            # Informacion del cluster
            palabras_con_origen = [
                {
                    "frase": frase, 
                    "origen": vocabulario.get(frase, ["desconocido"]),
                    "prediccion": predicciones.get(frase, "no_politico")  
                } 
                for frase in frases_en_cluster
            ]
            
            porcentaje_ocupacion = round(100 * len(frases_en_cluster) / total_palabras, 2)
            
            # Palabras representativas
            palabras_representativas = self.obtener_palabras_representativas(
                frases_en_cluster, mapeo_palabra_vector, top_n
            )

            # Guardar resultado del cluster
            resultado[cl] = {
                "palabras": palabras_con_origen,  
                "ideologia": ideologia_final,
                "porcentaje_ocupacion": porcentaje_ocupacion,
                "palabras_representativas": palabras_representativas,
                "analisis_economico": analisis_economico
            }

        return resultado



