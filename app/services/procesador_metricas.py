from collections import defaultdict
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
import numpy as np

class ProcesadorMetricas:
    """
    Clase para evaluar la calidad del clustering con métricas no supervisadas.
    Incluye distribución de distancias al centroide por clúster para visualizaciones
    como boxplots y bubble charts con trazabilidad semántica.
    """
    
    def __init__(self, X_latente, etiquetas, palabras=None, origenes=None):
        """
        Inicializa el evaluador con los datos del clustering.
        
        Args:
            X_latente: matriz de embeddings (n_samples x n_features)
            etiquetas: array de etiquetas de clustering (n_samples)
            palabras: lista opcional de palabras asociadas a cada punto
            origenes: lista opcional de archivos de origen por palabra
        """
        self.X_latente = X_latente
        self.etiquetas = etiquetas
        self.palabras = palabras
        self.origenes = origenes
        self.resultados = {}
        
    def calcular_metricas_globales(self):
        """Calcula las métricas globales de calidad del clustering."""
        etiquetas_validas = self.etiquetas[self.etiquetas != -1]
        n_clusters_validos = len(set(etiquetas_validas))
        tiene_clustering_valido = n_clusters_validos >= 2
        
        # Silhouette Score
        try:
            self.resultados["Silhouette Score"] = (
                silhouette_score(self.X_latente[self.etiquetas != -1], etiquetas_validas)
                if tiene_clustering_valido else 0.0
            )
        except Exception:
            self.resultados["Silhouette Score"] = 0.0

        # Calinski-Harabasz Index
        try:
            self.resultados["Calinski-Harabasz Index"] = (
                calinski_harabasz_score(self.X_latente[self.etiquetas != -1], etiquetas_validas)
                if tiene_clustering_valido else 0.0
            )
        except Exception:
            self.resultados["Calinski-Harabasz Index"] = 0.0

        # Davies-Bouldin Index
        try:
            self.resultados["Davies-Bouldin Index"] = (
                davies_bouldin_score(self.X_latente[self.etiquetas != -1], etiquetas_validas)
                if tiene_clustering_valido else 0.0
            )
        except Exception:
            self.resultados["Davies-Bouldin Index"] = 0.0
            
        return self
    
    def calcular_metricas_por_cluster(self):
        """Calcula métricas detalladas por cada clúster."""
        varianzas = []
        distribucion_por_cluster = {}
        resumen_por_cluster = {}
        total = len(self.X_latente)

        for cl in np.unique(self.etiquetas):
            if cl == -1:
                continue
                
            puntos = self.X_latente[self.etiquetas == cl]
            centroide = np.mean(puntos, axis=0)
            distancias = np.linalg.norm(puntos - centroide, axis=1)
            varianza = np.mean(distancias ** 2)
            varianzas.append(varianza)

            indices = np.where(self.etiquetas == cl)[0]
            registros = []
            palabras_cl = []
            origenes_cl = []

            for i, idx in enumerate(indices):
                registro = {
                    "distancia": float(distancias[i])
                }
                if self.palabras is not None:
                    registro["palabra"] = self.palabras[idx]
                    palabras_cl.append(self.palabras[idx])
                if self.origenes is not None:
                    registro["origen"] = self.origenes[idx]
                    origenes_cl.append(self.origenes[idx])
                registros.append(registro)

            distribucion_por_cluster[int(cl)] = registros

            resumen_por_cluster[int(cl)] = {
                "densidad": len(puntos) / total,
                "varianza": varianza,
                "distancia_promedio": float(np.mean(distancias)),
                "palabras": palabras_cl,
                "origenes": origenes_cl
            }

        self.resultados["Varianza Intra-Clúster Promedio"] = np.mean(varianzas) if varianzas else 0.0
        self.resultados["Distribución por Clúster"] = distribucion_por_cluster
        self.resultados["Resumen por Clúster"] = resumen_por_cluster
        
        return self
    
    def calcular_metricas_agregadas(self):
        """Calcula métricas agregadas adicionales."""
        # Densidad promedio
        if "Resumen por Clúster" in self.resultados:
            resumen_por_cluster = self.resultados["Resumen por Clúster"]
            densidades = [resumen_por_cluster[cl]["densidad"] for cl in resumen_por_cluster]
            self.resultados["Densidad Promedio por Clúster"] = np.mean(densidades) if densidades else 0.0

        # Porcentaje de ruido
        ruido = np.sum(self.etiquetas == -1)
        self.resultados["% de Ruido"] = round(100 * ruido / len(self.etiquetas), 2)
        
        return self
    
    def evaluar(self):
        """
        Ejecuta todas las evaluaciones y retorna los resultados completos.
        
        Returns:
            dict: Diccionario con todas las métricas calculadas
        """
        return (
            self.calcular_metricas_globales()
                .calcular_metricas_por_cluster()
                .calcular_metricas_agregadas()
                .resultados
        )
    
    def obtener_metricas_principales(self):
        """Retorna solo las métricas principales para reportes rápidos."""
        metricas_principales = {}
        claves_principales = [
            "Silhouette Score", "Calinski-Harabasz Index", "Davies-Bouldin Index",
            "Varianza Intra-Clúster Promedio", "% de Ruido"
        ]
        
        for clave in claves_principales:
            if clave in self.resultados:
                metricas_principales[clave] = self.resultados[clave]
                
        return metricas_principales
    
    def obtener_resumen_clusters(self):
        """Retorna el resumen por clúster para análisis detallado."""
        return self.resultados.get("Resumen por Clúster", {})
    
    def obtener_distribucion_clusters(self):
        """Retorna la distribución detallada por clúster."""
        return self.resultados.get("Distribución por Clúster", {})
    

    def interpretar_agrupacion_completa(self, interpretacion: dict) -> str:
        """
        Genera una descripción completa e interpretativa de la agrupación.
        Combina métricas técnicas con análisis ideológico y económico en lenguaje claro.
        """
        descripcion = []
        recomendaciones = []
        metricas = self.resultados
        
        # Métricas tecnicas
        silhouette = metricas.get("Silhouette Score", 0.0)
        ch_index = metricas.get("Calinski-Harabasz Index", 0.0)
        db_index = metricas.get("Davies-Bouldin Index", 0.0)
        varianza = metricas.get("Varianza Intra-Clúster Promedio", 0.0)
        densidad = metricas.get("Densidad Promedio por Clúster", 0.0)
        ruido = metricas.get("% de Ruido", 0.0)
        
        descripcion.append(" ANÁLISIS COMPLETO DE IDEOLOGÍAS EN EL TEXTO")
        descripcion.append("=" * 55)
        
        # Resumen ejecutuvo
        descripcion.append("\n RESUMEN EJECUTIVO:")
        descripcion.append("-" * 25)
        
        total_clusters = len(interpretacion)
        clusters_economicos = 0
        clusters_izquierda = 0
        clusters_derecha = 0
        clusters_mixtos = 0

        for cl_id, info in interpretacion.items():
            ideologia = info.get("ideologia", "desconocida").lower()
            analisis_economico = info.get("analisis_economico", {})
            
            if analisis_economico.get("es_economico", False) and ideologia != "no_politico":
                clusters_economicos += 1
            
            if ideologia == "izquierda":
                clusters_izquierda += 1
            elif ideologia == "derecha":
                clusters_derecha += 1
            elif ideologia == "mixto":
                clusters_mixtos += 1
        
        # Resumen
        descripcion.append(f"• Se identificaron {total_clusters} grupos temáticos principales")
        descripcion.append(f"• {clusters_economicos} grupos tratan temas económicos específicos")
        
        if clusters_izquierda > clusters_derecha:
            descripcion.append(f"• Predomina la perspectiva de IZQUIERDA ({clusters_izquierda} grupos)")
        elif clusters_derecha > clusters_izquierda:
            descripcion.append(f"• Predomina la perspectiva de DERECHA ({clusters_derecha} grupos)")
        else:
            descripcion.append("• Hay un equilibrio entre perspectivas de izquierda y derecha o no se identificaron temas políticos")
        
        #  CALIDAD TÉCNICA DEL ANÁLISIS (con todas tus métricas)
        descripcion.append(f"\n CALIDAD TÉCNICA DEL ANÁLISIS:")
        descripcion.append("-" * 35)
        
        # Silhouette Score con interpretación clara
        if silhouette > 0.7:
            calidad_grupos = " EXCELENTE - Grupos muy bien diferenciados"
            confianza = "Alta confianza en la separación de temas"
        elif silhouette > 0.5:
            calidad_grupos = " BUENA - Grupos distinguibles con algo de superposición"
            confianza = "Buena confianza en la clasificación"
        elif silhouette > 0.3:
            calidad_grupos = " REGULAR - Grupos con superposición significativa"
            confianza = "Confianza moderada, algunos temas se mezclan"
        else:
            calidad_grupos = " DÉBIL - Grupos muy mezclados"
            confianza = "Baja confianza en la separación de temas"
        
        descripcion.append(f"• Claridad de grupos: {calidad_grupos}")
        descripcion.append(f"  (Silhouette: {silhouette:.3f}) - {confianza}")
        
        # Calinski-Harabasz - Densidad y separación
        if ch_index > 300:
            separacion = " MUY BUENA - Grupos muy compactos y bien separados"
        elif ch_index > 150:
            separacion = " BUENA - Buena separación entre grupos"
        elif ch_index > 50:
            separacion = " MODERADA - Separación aceptable"
        else:
            separacion = " BAJA - Grupos muy cercanos entre sí"
        
        descripcion.append(f"• Separación entre grupos: {separacion}")
        descripcion.append(f"  (Índice CH: {ch_index:.1f})")
        
        # Davies-Bouldin - Calidad de agrupamiento
        if db_index < 0.5:
            compactitud = " EXCELENTE - Grupos muy compactos y distintos"
        elif db_index < 1.0:
            compactitud = " BUENA - Grupos definidos con mínima superposición"
        elif db_index < 1.5:
            compactitud = " ACEPTABLE - Alguna superposición entre grupos"
        else:
            compactitud = " MEJORABLE - Significativa superposición"
        
        descripcion.append(f"• Compactitud interna: {compactitud}")
        descripcion.append(f"  (Índice DB: {db_index:.3f})")
        
        # Varianza intra-cluster
        if varianza < 0.1:
            dispersion = " MUY COMPACTOS - Palabras muy cohesionadas"
        elif varianza < 0.2:
            dispersion = " COMPACTOS - Buena cohesión interna"
        elif varianza < 0.3:
            dispersion = " DISPERSOS - Cohesión moderada"
        else:
            dispersion = " MUY DISPERSOS - Temas poco cohesionados"
        
        descripcion.append(f"• Cohesión interna: {dispersion}")
        descripcion.append(f"  (Varianza: {varianza:.4f})")
        
        # Densidad y ruido
        descripcion.append(f"• Distribución de contenido:")
        descripcion.append(f"  - Cada grupo contiene en promedio {densidad:.1%} del vocabulario")
        descripcion.append(f"  - Ruido identificado: {ruido:.1f}% (texto no clasificable)")
        
        # RECOMENDACIONES TÉCNICAS BASADAS EN MÉTRICAS
        descripcion.append(f"\n RECOMENDACIONES TÉCNICAS:")
        descripcion.append("-" * 25)
        
        if db_index > 1.2:
            descripcion.append("•  Considerar ajustar parámetros - alta superposición entre grupos")
        if ruido > 15:
            descripcion.append("•  Mejorar preprocesamiento para reducir texto no clasificable")
        if silhouette < 0.4:
            descripcion.append("•  Evaluar usar más clusters o diferente algoritmo")
        if varianza > 0.3:
            descripcion.append("•  Los grupos son dispersos - considerar usar diferente algoritmo o porcesar nuevamente para refinar")
        
        """
        # ANÁLISIS DETALLADO POR GRUPO
        descripcion.append(f"\n ANÁLISIS DETALLADO POR GRUPO:")
        descripcion.append("-" * 35)
        
        for cl_id, info in sorted(interpretacion.items()):
            ideologia = info.get("ideologia", "Desconocida")
            ocupacion = info.get("porcentaje_ocupacion", 0.0)
            palabras_rep = info.get("palabras_representativas", [])[:10]
            analisis_economico = info.get("analisis_economico", {})
            
            descripcion.append(f"\n GRUPO {cl_id}: {ideologia.upper()}")
            descripcion.append(f"   Tamaño: {ocupacion:.1f}% del texto analizado")
            
            # Mostrar palabras clave más entendibles
            # MOSTRAR FRASES COMPLETAS - MEJORADO
            if palabras_rep:
                # Mostrar máximo 5 frases completas para no saturar
                frases_mostrar = palabras_rep[:10]
                descripcion.append(f"   Frases clave:")
                for i, frase in enumerate(frases_mostrar, 1):
                    descripcion.append(f"     {i}. {frase}")
                    
           # ANÁLISIS ECONÓMICO 
            if analisis_economico.get("es_economico", False) and ideologia.lower() != "no_politico":
                tema = analisis_economico.get("tema", "")
                orientacion = analisis_economico.get("orientacion", "")
                palabras_clave = analisis_economico.get("palabras_clave", [])
                frases_asociadas = analisis_economico.get("frases_asociadas", {})
                
                descripcion.append(f"    PERSPECTIVA ECONÓMICA: {orientacion}")
                
                # Explicar qué significa esta orientación económica
                if orientacion == "Izquierda":
                    descripcion.append("   • Enfatiza intervención estatal y propiedad pública")
                elif orientacion == "Derecha":
                    descripcion.append("   • Promueve libre mercado e iniciativa privada")
                elif orientacion == "Mixto":
                    descripcion.append("   • Combina elementos de mercado y regulación estatal")
                
                # Mostrar términos económicos clave
                descripcion.append(f" • Conceptos (Diccionario MARPOR): {', '.join(palabras_clave)}")
                
                # Mostrar EJEMPLOS CONCRETOS del texto
                if frases_asociadas:
                    descripcion.append("    Ejemplos encontrados en el texto:")
                    for categoria, frases in frases_asociadas.items():
                        if frases:  # Solo mostrar si hay frases
                            # Mostrar máximo 2 frases por categoría
                            for i, frase in enumerate(frases[:2]):
                                frase_corta = frase[:60] + "..." if len(frase) > 60 else frase
                                if i == 0:
                                    descripcion.append(f"     - {categoria}: '{frase_corta}'")
                                else:
                                    descripcion.append(f"       '{frase_corta}'")
            else:
                if ideologia.lower() == "no_politico":
                    descripcion.append("    CONTENIDO NO POLÍTICO (espectáculos, deportes, cultura, etc.)")
                else:
                    descripcion.append("    Tema general (no específicamente económico)")
       

        # PATRONES GLOBALES IDENTIFICADOS - PARA TODOS LOS CLUSTERS
        descripcion.append(f"\n PATRONES GLOBALES IDENTIFICADOS:")
        descripcion.append("-" * 40)

        # Contadores para análisis completo
        clusters_alineados = 0
        clusters_discrepantes = 0
        clusters_economicos = 0
        clusters_generales = 0
        clusters_izquierda_total = 0
        clusters_derecha_total = 0
        clusters_mixtos_total = 0

        # Analizar TODOS los clusters
        for cl_id, info in interpretacion.items():
            ideologia = info.get("ideologia", "").lower()
            analisis_economico = info.get("analisis_economico", {})
            
            # Contar ideologías generales
            if ideologia == "izquierda":
                clusters_izquierda_total += 1
            elif ideologia == "derecha":
                clusters_derecha_total += 1
            elif ideologia == "mixto":
                clusters_mixtos_total += 1
            
            # Para clusters económicos: analizar consistencia
            if analisis_economico.get("es_economico", False):
                clusters_economicos += 1
                orientacion_economica = analisis_economico.get("orientacion", "").lower()
                
                if orientacion_economica == ideologia:
                    clusters_alineados += 1
                elif (ideologia == "izquierda" and orientacion_economica == "derecha") or \
                    (ideologia == "derecha" and orientacion_economica == "izquierda"):
                    clusters_discrepantes += 1
            else:
                clusters_generales += 1

        # 🔹 PATRONES DE IDEOLOGÍA GENERAL (para TODOS los clusters)
        descripcion.append(f"\n DISTRIBUCIÓN IDEOLÓGICA GENERAL:")
        if clusters_izquierda_total > 0:
            descripcion.append(f"• Grupos de IZQUIERDA: {clusters_izquierda_total} ({clusters_izquierda_total/total_clusters*100:.0f}%)")
        if clusters_derecha_total > 0:
            descripcion.append(f"• Grupos de DERECHA: {clusters_derecha_total} ({clusters_derecha_total/total_clusters*100:.0f}%)")
        if clusters_mixtos_total > 0:
            descripcion.append(f"• Grupos MIXTOS: {clusters_mixtos_total} ({clusters_mixtos_total/total_clusters*100:.0f}%)")

        # Tendencia ideológica predominante
        if clusters_izquierda_total > clusters_derecha_total and clusters_izquierda_total > clusters_mixtos_total:
            descripcion.append(f" TENDENCIA PREDOMINANTE: IZQUIERDA")
        elif clusters_derecha_total > clusters_izquierda_total and clusters_derecha_total > clusters_mixtos_total:
            descripcion.append(f" TENDENCIA PREDOMINANTE: DERECHA")
        elif clusters_mixtos_total >= clusters_izquierda_total and clusters_mixtos_total >= clusters_derecha_total:
            descripcion.append(f" TENDENCIA PREDOMINANTE: DISCURSO MIXTO/BALANCEADO")
        else:
            descripcion.append(f" TENDENCIA: EQUILIBRIO ENTRE PERSPECTIVAS")

        # 🔹 PATRONES ESPECÍFICOS PARA CLUSTERS ECONÓMICOS
        # Evaluar condiciones para recomendaciones
        if clusters_economicos == 0:
            recomendaciones.extend([
                "• El texto analizado tiene bajo contenido de temas económicos específicos",
                "• Considerar ampliar el corpus con textos más focalizados en economía"
            ])
        elif clusters_economicos / total_clusters > 0.7:
            recomendaciones.append("• El corpus es altamente económico - ideal para análisis de políticas")
                    
            # Consistencias y discrepancias económicas
            if clusters_alineados > 0:
                descripcion.append(f"•  {clusters_alineados} grupos con lenguaje económico COHERENTE")
                descripcion.append(f"  (Ideología y economía alineadas)")
            
            if clusters_discrepantes > 0:
                descripcion.append(f"•  {clusters_discrepantes} grupos con lenguaje económico CONTRADICTORIO")
                descripcion.append(f"  (Usan términos del espectro opuesto)")
            
            # Tendencias económicas específicas
            porcentaje_izquierda = (sum(1 for cl_id, info in interpretacion.items() 
                                    if info.get("analisis_economico", {}).get("orientacion") == "Izquierda") / clusters_economicos) * 100
            porcentaje_derecha = (sum(1 for cl_id, info in interpretacion.items() 
                                    if info.get("analisis_economico", {}).get("orientacion") == "Derecha") / clusters_economicos) * 100
            porcentaje_mixto = (sum(1 for cl_id, info in interpretacion.items() 
                                if info.get("analisis_economico", {}).get("orientacion") == "Mixto") / clusters_economicos) * 100
            
            descripcion.append(f"\n ORIENTACIÓN ECONÓMICA DETECTADA:")
            if porcentaje_izquierda > 0:
                descripcion.append(f"• Izquierda: {porcentaje_izquierda:.0f}%")
            if porcentaje_derecha > 0:
                descripcion.append(f"• Derecha: {porcentaje_derecha:.0f}% ")
            if porcentaje_mixto > 0:
                descripcion.append(f"• Mixto: {porcentaje_mixto:.0f}%")

        # 🔹 PATRONES PARA CLUSTERS GENERALES (no económicos)
        if clusters_generales > 0:
            descripcion.append(f"\n TEMÁTICAS GENERALES IDENTIFICADAS:")
            descripcion.append(f"• Grupos con temas no económicos: {clusters_generales}")
            
            # Analizar contenido de clusters generales
            temas_generales = []
            for cl_id, info in interpretacion.items():
                if not info.get("analisis_economico", {}).get("es_economico", False):
                    palabras_rep = info.get("palabras_representativas", [])[:3]
                    if palabras_rep:
                        # Extraer temas generales de las palabras representativas
                        temas = [p.split()[0] if p.split() else p for p in palabras_rep[:2]]
                        temas_generales.extend(temas)
            
            if temas_generales:
                temas_unicos = list(set(temas_generales))[:4]  # Mostrar hasta 4 temas únicos
                descripcion.append(f"• Temas detectados: {', '.join(temas_unicos)}")

        # 🔹 INSIGHTS Y OBSERVACIONES CLAVE
        descripcion.append(f"\n OBSERVACIONES CLAVE:")
        descripcion.append("-" * 25)
        
        # Observación sobre distribución
        if clusters_economicos > 0 and clusters_generales > 0:
            proporcion_economicos = (clusters_economicos / total_clusters) * 100
            if proporcion_economicos > 70:
                descripcion.append("• El discurso está ALTAMENTE FOCALIZADO en temas económicos")
            elif proporcion_economicos > 40:
                descripcion.append("• Balance entre temas económicos y generales")
            else:
                descripcion.append("• Predominan los temas generales sobre los económicos")

        # Observación sobre consistencia ideológica
        if clusters_discrepantes > 0:
            descripcion.append("• Se detecta ESTRATEGIA DISCURSIVA: uso de lenguaje económico contradictorio")
            descripcion.append("  (Posible intento de hacer posturas más aceptables)")

        # Observación sobre diversidad temática
        if clusters_mixtos_total > 0:
            descripcion.append("• Presencia de discursos COMPLEJOS que combinan perspectivas")
                
        else:
            descripcion.append("• DISCURSO COMPLEJO con múltiples perspectivas ideológicas y temáticas")

        # RECOMENDACIONES PRÁCTICAS - CON MANEJO DE CASOS SIN RECOMENDACIONES
        descripcion.append(f"\n💡 RECOMENDACIONES PARA EL ANÁLISIS:")
        descripcion.append("-" * 35)

        

        # Evaluar condiciones para recomendaciones
        if clusters_economicos == 0:
            recomendaciones.extend([
                "• El texto analizado tiene bajo contenido de temas económicos específicos",
                "• Considerar ampliar el corpus con textos más focalizados en economía"
            ])
        elif clusters_economicos / total_clusters > 0.7:
            recomendaciones.append("• El corpus es altamente económico - ideal para análisis de políticas")

        if clusters_discrepantes > 0:
            recomendaciones.extend([
                "• Prestar atención a los grupos con lenguaje contradictorio",
                "  Pueden revelar estrategias retóricas interesantes"
            ])

        # Recomendaciones basadas en calidad del análisis
        if silhouette < 0.4:
            recomendaciones.append("• La calidad de agrupamiento es moderada - considerar ajustar parámetros")
        elif silhouette > 0.7:
            recomendaciones.append("• Calidad de agrupamiento excelente - resultados muy confiables")

        if ruido > 20:
            recomendaciones.append("• Alto porcentaje de ruido - mejorar preprocesamiento de texto")

        # Recomendaciones basadas en distribución ideológica
        if clusters_izquierda_total == 0 and clusters_derecha_total == 0:
            recomendaciones.append("• No se detectaron posturas ideológicas claras - corpus muy neutral")
        elif clusters_izquierda_total > 0 and clusters_derecha_total == 0:
            recomendaciones.append("• Corpus con perspectiva predominantemente de izquierda")
        elif clusters_derecha_total > 0 and clusters_izquierda_total == 0:
            recomendaciones.append("• Corpus con perspectiva predominantemente de derecha")

        # Si NO hay recomendaciones específicas
        if not recomendaciones:
            recomendaciones = [
                "• El análisis no requiere ajustes específicos",
                "• La calidad y distribución de los grupos es adecuada",
                "• Puede proceder con la interpretación de resultados"
            ]

        # Agregar todas las recomendaciones
        for recomendacion in recomendaciones:
            descripcion.append(recomendacion)
        """
        return "\n".join(descripcion)

# Función de compatibilidad para mantener el código existente
def evaluar_clustering(X_latente, etiquetas, palabras=None, origenes=None):
    """
    Función de compatibilidad que usa la nueva clase EvaluadorClustering.
    """
    evaluador = ProcesadorMetricas(X_latente, etiquetas, palabras, origenes)
    return evaluador.evaluar()