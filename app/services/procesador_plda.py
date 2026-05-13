from typing import Dict, List, Optional, Union, Tuple
from nltk.corpus import stopwords
stopwords_es = set(stopwords.words('spanish'))
import re
import numpy as np
import tomotopy as tp
import sys
import os

# DIAGNÓSTICO Y CARGA DEL DICCIONARIO
print("=== CARGANDO DICCIONARIO ECONÓMICO ===")

ruta_actual = os.path.abspath(__file__)
ruta_base = os.path.dirname(os.path.dirname(ruta_actual))
ruta_corpus = os.path.join(ruta_base, 'corpus/diccionario_economico')
ruta_diccionario = os.path.join(ruta_corpus, 'diccionario_economico_extraido.py')

print(f"Buscando diccionario en: {ruta_diccionario}")

# Cargar el diccionario directamente desde el archivo
diccionario_economico_extraido = None

try:
    # Leer el contenido del archivo
    with open(ruta_diccionario, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Crear un espacio de nombres para ejecutar el código
    namespace = {}
    exec(contenido, namespace)
    
    # Obtener el diccionario
    #diccionario_economico_marpor
    diccionario_economico_extraido = namespace.get('diccionario_economico_extraido_marpor')
    
    if diccionario_economico_extraido is not None:
        print(" Diccionario económico cargado correctamente")
        print(f"  Categorías cargadas: {len(diccionario_economico_extraido)}")
        
        # Mostrar estadísticas
        total_frases = 0
        for codigo, frases in diccionario_economico_extraido.items():
            print(f"    {codigo}: {len(frases)} frases")
            total_frases += len(frases)
        print(f"  Total de frases: {total_frases}")
    else:
        raise ValueError("No se encontró la variable 'diccionario_economico_extraido' en el archivo")
        
except Exception as e:
    print(f"✗ Error cargando diccionario: {e}")
    print("  Usando diccionario de respaldo vacío")
    # Diccionario de respaldo en caso de error
    diccionario_economico_extraido = {
        "per403": [], "per404": [], "per406": [], "per412": [], "per413": [],
        "per401": [], "per402": [], "per407": [], "per414": [],
        "per409": [], "per408": [], "per405": [], "per411": []
    }

class ProcesadorEconomicoPLDA:
    # Identificación de temas económicos usando tomotopy PLDAModel
    
    def __init__(self):
        # Usar el diccionario extraído automáticamente de los manifiestos
        self.diccionario_marpor = self._convertir_diccionario_extraido()
        
        # Mapeo de categorías a orientación ideológica
        self.mapeo_orientacion = {
            "per403": "izquierda",  # Regulación del mercado
            "per404": "izquierda",  # Planificación económica
            "per406": "izquierda",  # Proteccionismo: Positivo
            "per412": "izquierda",  # Economía controlada
            "per413": "izquierda",  # Nacionalización
            "per401": "derecha",    # Economía de Libre Mercado
            "per402": "derecha",    # Incentivos: Positivos
            "per407": "derecha",    # Proteccionismo: Negativo
            "per414": "derecha",    # Ortodoxia Económica
        }
        
        # Mapeo de códigos a nombres descriptivos
        self.nombres_categorias = {
            "per403": "Regulación del mercado",
            "per404": "Planificación económica", 
            "per406": "Proteccionismo Positivo",
            "per412": "Economía controlada",
            "per413": "Nacionalización",
            "per401": "Libre Mercado",
            "per402": "Incentivos Positivos",
            "per407": "Proteccionismo Negativo", 
            "per414": "Ortodoxia Económica"
        }
        
        # Mapeo de categorías a labels para PLDA
        self.categoria_labels = {cat: f"label_{i}" for i, cat in enumerate(self.diccionario_marpor.keys())}

    def _convertir_diccionario_extraido(self) -> Dict:
        """Convierte el diccionario extraído al formato esperado por el procesador"""
        diccionario_convertido = {}
        
        for codigo, frases in diccionario_economico_extraido.items():
            # Usar el código como clave y las frases extraídas como valores
            diccionario_convertido[codigo] = frases
        
        return diccionario_convertido

    def _buscar_patrones_marpor_con_frases(self, frases: List[str]) -> Dict[str, Dict]:
        """Busca patrones MARPOR y guarda las frases que coinciden"""
        resultados = {
            categoria: {
                "frecuencia": 0, 
                "frases": [],
                "patrones_encontrados": []
            } for categoria in self.diccionario_marpor
        }
        
        for frase in frases:
            frase_lower = frase.lower()
            for categoria, patrones in self.diccionario_marpor.items():
                for patron in patrones:
                    if patron in frase_lower:
                        resultados[categoria]["frecuencia"] += 1
                        resultados[categoria]["frases"].append(frase)
                        resultados[categoria]["patrones_encontrados"].append(patron)
                        break  # Una coincidencia por categoría es suficiente
        
        return resultados

    def _asignar_labels_por_frase(self, frases: List[str]) -> List[List[str]]:
        """Asigna labels a cada frase basado en coincidencias MARPOR"""
        labels_por_frase = []
        
        for frase in frases:
            frase_labels = []
            frase_lower = frase.lower()
            
            for categoria, patrones in self.diccionario_marpor.items():
                for patron in patrones:
                    if patron in frase_lower:
                        label = self.categoria_labels[categoria]
                        if label not in frase_labels:
                            frase_labels.append(label)
                        break  # Una coincidencia por categoría es suficiente
            
            labels_por_frase.append(frase_labels)
        
        return labels_por_frase

    def _aplicar_plda_tematicas(self, frases: List[str], resultados_marpor: Dict) -> Dict:
        """Aplica PLDAModel para refinar las temáticas usando labels parciales"""
        frecuencias_marpor = {cat: data["frecuencia"] for cat, data in resultados_marpor.items()}
        
        if not frases or tp is None:
            return resultados_marpor
            
        # Preprocesar texto para tomotopy
        documentos = []
        for frase in frases:
            palabras = re.findall(r'\w+', frase.lower())
            palabras_filtradas = [p for p in palabras if p not in stopwords_es and len(p) > 2]
            if palabras_filtradas:
                documentos.append(palabras_filtradas)
        
        if len(documentos) < 2:
            return resultados_marpor
            
        try:
            # Asignar labels a cada frase
            labels_por_frase = self._asignar_labels_por_frase(frases)
            
            # Número de temas basado en categorías MARPOR con presencia
            temas_activos = [cat for cat, data in resultados_marpor.items() if data["frecuencia"] > 0]
            n_topics = max(2, min(len(temas_activos), len(self.diccionario_marpor)))
            
            # Crear modelo PLDA
            model = tp.PLDAModel(tw=tp.TermWeight.ONE, min_cf=1, min_df=1, 
                               k=n_topics, seed=42)
            
            # Agregar documentos con labels
            for i, doc in enumerate(documentos):
                labels = labels_por_frase[i] if i < len(labels_por_frase) else []
                model.add_doc(doc, labels=labels)
            
            # Entrenar modelo
            model.train(iter=100, workers=1)
            
            # Analizar distribución de temas para refinar frecuencias
            for doc_idx in range(len(documentos)):
                doc_model = model.docs[doc_idx]
                topic_dist = doc_model.get_topic_dist()
                
                # Encontrar tema más probable para este documento
                if len(topic_dist) > 0:
                    top_topic = np.argmax(topic_dist)
                    
                    # Obtener palabras del tema principal
                    topic_words = model.get_topic_words(top_topic, top_n=8)
                    top_words = [word for word, _ in topic_words]
                    
                    # Buscar coincidencias con categorías MARPOR
                    for palabra in top_words:
                        for categoria, patrones in self.diccionario_marpor.items():
                            if any(palabra in patron.lower() for patron in patrones):
                                if resultados_marpor[categoria]["frecuencia"] > 0:
                                    # Refuerzo incremental manteniendo las frases
                                    resultados_marpor[categoria]["frecuencia"] += 0.5
                                break
            
            # Refuerzo adicional basado en labels usados
            for doc_idx in range(len(documentos)):
                labels = labels_por_frase[doc_idx] if doc_idx < len(labels_por_frase) else []
                for label in labels:
                    # Encontrar categoría correspondiente al label
                    for categoria, cat_label in self.categoria_labels.items():
                        if cat_label == label and resultados_marpor[categoria]["frecuencia"] > 0:
                            resultados_marpor[categoria]["frecuencia"] *= 1.3  # Refuerzo por label
                        
        except Exception as e:
            print(f"Advertencia en PLDAModel: {e}")
            # Fallback a método simple
            return self._aplicar_metodo_simple(frases, resultados_marpor)
            
        return resultados_marpor

    def _aplicar_metodo_simple(self, frases: List[str], resultados_marpor: Dict) -> Dict:
        """Fallback simple si PLDA falla"""
        # Simplemente reforzar las categorías encontradas manteniendo las frases
        for categoria in resultados_marpor:
            if resultados_marpor[categoria]["frecuencia"] > 0:
                resultados_marpor[categoria]["frecuencia"] *= 1.2
        return resultados_marpor

    def identificar_tema_plda(self, frases: List[str], cluster_id: Optional[str] = None) -> Dict[str, Union[str, int, List[str], Dict]]:
        """Identificación de temas económicos usando MARPOR + PLDAModel"""
        
        # CASO ESPECIAL: Cluster -1 (ruido) siempre es no económico
        if cluster_id == '-1':
            print(f" * Cluster {cluster_id} (ruido) - marcado automáticamente como no económico")
            return self._resultado_no_economico()
        
        if not frases:
            return self._resultado_no_economico()
        
        # 1. Búsqueda de patrones MARPOR CON FRASES
        resultados_marpor = self._buscar_patrones_marpor_con_frases(frases)
        
        # 2. Refinamiento con PLDAModel
        resultados_refinados = self._aplicar_plda_tematicas(frases, resultados_marpor)
        
        # 3. Determinar orientación económica INCLUYENDO FRASES
        resultado = self._analizar_orientacion_economica_con_frases(resultados_refinados, frases)
        
        return resultado

    def _analizar_orientacion_economica_con_frases(self, resultados_marpor: Dict, frases: List[str]) -> Dict:
        """Analiza la orientación económica incluyendo las frases detectadas"""
        
        frecuencias = {cat: data["frecuencia"] for cat, data in resultados_marpor.items()}
        
        # Calcular scores por orientación
        score_izquierda = sum(frecuencias[cat] for cat in self.mapeo_orientacion 
                            if self.mapeo_orientacion[cat] == "izquierda")
        score_derecha = sum(frecuencias[cat] for cat in self.mapeo_orientacion 
                           if self.mapeo_orientacion[cat] == "derecha")
        
        # Determinar orientación final
        scores = {"izquierda": score_izquierda, "derecha": score_derecha}
        orientacion_final = max(scores.items(), key=lambda x: x[1])
        
        # Extraer categorías destacadas CON SUS FRASES
        categorias_destacadas = sorted(frecuencias.items(), key=lambda x: x[1], reverse=True)[:3]
        palabras_clave = []
        frases_asociadas = {}
        patrones_detectados = {}
        
        for cat, freq in categorias_destacadas:
            if freq > 0:
                # Palabras clave del diccionario MARPOR (primeras 2 frases)
                if self.diccionario_marpor[cat]:
                    palabras_clave.extend(self.diccionario_marpor[cat][:])
                
                # Frases del texto que activaron esta categoría
                frases_asociadas[self.nombres_categorias.get(cat, cat)] = resultados_marpor[cat]["frases"]
                
                # Patrones MARPOR específicos detectados
                patrones_detectados[self.nombres_categorias.get(cat, cat)] = resultados_marpor[cat]["patrones_encontrados"]
        
        es_economico = (score_izquierda + score_derecha) > 0
        
        if not es_economico:
            return self._resultado_no_economico()
            
        return {
            "tema": f"Dimensión Económica - {orientacion_final[0].capitalize()}", 
            "orientacion": orientacion_final[0].capitalize(), 
            "orientacion_palabras_clave": {
                "score_izquierda": score_izquierda,
                "score_derecha": score_derecha
            },
            "palabras_clave": palabras_clave[:10],
            "palabras_economicas": [self.nombres_categorias.get(cat, cat) for cat, freq in categorias_destacadas if freq > 0],
            "frases_asociadas": frases_asociadas,  # Frases del texto detectadas
            "patrones_detectados": patrones_detectados,  # Patrones MARPOR específicos
            "score_total": orientacion_final[1],
            "es_economico": True,
            "metodo": "MARPOR+PLDAModel"
        }

    def _resultado_no_economico(self) -> Dict:
        """Resultado por defecto si no hay tema económico"""
        return {
            "tema": "No económico",
            "orientacion": "Neutral",
            "orientacion_palabras_clave": {},
            "palabras_clave": [],
            "palabras_economicas": [],
            "frases_asociadas": {},  # Incluido para consistencia
            "patrones_detectados": {},  # Incluido para consistencia
            "score_total": 0,
            "es_economico": False,
            "metodo": "MARPOR+PLDAModel"
        }

# Mantener el mismo nombre para compatibilidad
procesador_plda = ProcesadorEconomicoPLDA()