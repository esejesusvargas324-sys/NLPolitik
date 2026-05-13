import pickle
import csv
from sklearn.svm import LinearSVC  
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import cross_val_score
from collections import Counter
from nltk.corpus import stopwords
import re
import numpy as np
from sentence_transformers import SentenceTransformer

class ProcesadorSVMClasificador:
    def __init__(self):
        self.encoder = None
        self.clf = None
        self.le = None
        self.is_trained = False
        self.metricas_entrenamiento = {}
    
    def cargar_encoder(self):
        """Cargar modelo de Sentence Transformer para español"""
        if self.encoder is None:
            try:
                # Modelo optimizado para similitud semántica en español
                self.encoder = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')
                print(" Sentence Transformer cargado: hiiamsid/sentence_similarity_spanish_es")
            except Exception as e:
                print(f" Error cargando Sentence Transformer: {e}")
                # Fallback a modelo más ligero
                self.encoder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
                print(" Sentence Transformer cargado (fallback): paraphrase-multilingual-MiniLM-L12-v2")
        return self.encoder
    
    def preprocesar_frase(self, frase):
        """Preprocesamiento MÁS SIMPLE - Sentence Transformers maneja el contexto"""
        # Solo limpieza básica - mantener contexto semántico
        frase = re.sub(r'\s+', ' ', frase).strip()
        return frase.lower()

    def entrenar_modelo(self, ruta_csv="app/corpus/entrenamiento/dataset_frases_entrenamiento_svm_entrenamiento_final.csv"):
        """Entrena LinearSVC con Sentence Transformers - OPTIMIZADO PARA ALTA DIMENSIONALIDAD"""
        print("  ENTRENAMIENTO CON LINEAR SVC + SENTENCE TRANSFORMERS")
        print("=" * 60)
        
        # Cargar datos
        frases_csv = []
        etiquetas_csv = []
        with open(ruta_csv, encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)
            for fila in reader:
                if len(fila) >= 2:
                    frase, ideologia = fila[0].strip(), fila[1].strip()
                    if frase and ideologia:
                        frase_limpia = self.preprocesar_frase(frase)
                        frases_csv.append(frase_limpia)
                        etiquetas_csv.append(ideologia)
        
        print(f" * Total frases cargadas: {len(frases_csv)}")
        print(f" * Distribución: {Counter(etiquetas_csv)}")
        
        # GENERAR EMBEDDINGS SEMÁNTICOS
        print(" * Generando embeddings semánticos...")
        encoder = self.cargar_encoder()
        X_train = encoder.encode(frases_csv, show_progress_bar=True, batch_size=32)
        
        print(f" * Dimensiones de embeddings: {X_train.shape}")
        
        # Codificar etiquetas
        self.le = LabelEncoder()
        y_encoded = self.le.fit_transform(etiquetas_csv)
        
        print(f"\n Entrenando LinearSVC (optimizado para {X_train.shape[1]} dimensiones):")
        
        # LINEAR SVC OPTIMIZADO PARA EMBEDDINGS DE ALTA DIMENSIÓN
        self.clf = LinearSVC(
            class_weight='balanced', 
            random_state=42,
            C=0.5,  # ← MÁS BAJO: Mejor regularización para alta dimensionalidad
            dual=False,  # ← CRÍTICO: Mejor para n_samples > n_features
            max_iter=2000,  # ← AUMENTADO: Para convergencia segura
            tol=1e-4
        )
        self.clf.fit(X_train, y_encoded)
        self.is_trained = True
        
        # Validación cruzada
        print(" * Evaluando modelo con validación cruzada...")
        scores = cross_val_score(self.clf, X_train, y_encoded, cv=5, scoring='accuracy')
        print(f" * Accuracy validación cruzada (5-fold): {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
        
        # Calcular métricas
        self._calcular_metricas_finales(X_train, y_encoded)
        return self.metricas_entrenamiento
    
    def _calcular_metricas_finales(self, X, y):
        # LinearSVC no tiene predict_proba nativo, usar decision_function para confianzas
        scores_decision = self.clf.decision_function(X)
        
        # Convertir scores de decisión a probabilidades aproximadas
        if len(self.le.classes_) == 2:
            # Para clasificación binaria
            confianzas = 1 / (1 + np.exp(-np.abs(scores_decision)))
        else:
            # Para multiclase, usar softmax sobre scores
            from scipy.special import softmax
            probabilidades = softmax(scores_decision, axis=1)
            confianzas = np.max(probabilidades, axis=1)
        
        confianza_promedio = np.mean(confianzas)
        
        y_pred = self.clf.predict(X)
        accuracy = accuracy_score(y, y_pred)
        precision = precision_score(y, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y, y_pred, average='weighted', zero_division=0)
        
        clases = self.le.classes_
        reporte = classification_report(y, y_pred, target_names=clases, output_dict=True)
        
        f1_derecha = reporte.get('derecha', {}).get('f1-score', 0)
        f1_izquierda = reporte.get('izquierda', {}).get('f1-score', 0)
        diferencia_f1 = abs(f1_derecha - f1_izquierda)
        
        # Análisis de ejemplos difíciles
        self._analizar_ejemplos_dificiles(X, y, y_pred, confianzas)
        
        self.metricas_entrenamiento = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'confianza_promedio': confianza_promedio,
            'reporte_por_clase': reporte,
            'analisis_sesgo': {
                'diferencia_f1': diferencia_f1,
                'f1_derecha': f1_derecha,
                'f1_izquierda': f1_izquierda,
                'balance_aceptable': diferencia_f1 < 0.15
            }
        }
        
        # Mostrar resultados
        print("\n" + "="*60)
        print(" MÉTRICAS CON LINEAR SVC + SENTENCE TRANSFORMERS")
        print(f" Accuracy: {accuracy:.4f}")
        print(f" Precision: {precision:.4f}")
        print(f" Recall: {recall:.4f}")
        print(f" F1-Score: {f1:.4f}")
        print(f" Confianza promedio: {confianza_promedio:.4f}")
        print(f" Diferencia F1 Derecha-Izquierda: {diferencia_f1:.3f}")
        print(f" Balance aceptable: {diferencia_f1 < 0.15}")
        
        # Análisis de confianza
        alta_confianza = np.sum(confianzas > 0.7) / len(confianzas)
        media_confianza = np.sum(confianzas > 0.6) / len(confianzas)
        baja_confianza = np.sum(confianzas < 0.5) / len(confianzas)
        print(f" Frases con confianza >70%: {alta_confianza:.1%}")
        print(f" Frases con confianza >60%: {media_confianza:.1%}")
        print(f" Frases con confianza <50%: {baja_confianza:.1%}")
        
        # Análisis de coeficientes (palabras importantes)
        self._analizar_coeficientes_importantes()
    
    def _analizar_coeficientes_importantes(self):
        """Analiza las dimensiones del embedding más importantes"""
        if self.clf is None:
            return
            
        print(f"\n ANÁLISIS DE COEFICIENTES LINEAR SVC:")
        coef = self.clf.coef_
        
        if len(self.le.classes_) == 2:
            # Clasificación binaria
            indices_importantes = np.argsort(np.abs(coef[0]))[-10:][::-1]
            print(" Dimensiones de embedding más importantes:")
            for i in indices_importantes:
                print(f"   Dimensión {i}: {coef[0][i]:.4f}")
        else:
            # Clasificación multiclase
            for class_idx, class_name in enumerate(self.le.classes_):
                indices_importantes = np.argsort(np.abs(coef[class_idx]))[-5:][::-1]
                print(f" Clase {class_name.upper()} - Dimensiones importantes:")
                for i in indices_importantes:
                    print(f"   Dimensión {i}: {coef[class_idx][i]:.4f}")
    
    def _analizar_ejemplos_dificiles(self, X, y, y_pred, confianzas):
        """Analiza ejemplos con baja confianza o mal clasificados"""
        indices_baja_confianza = np.where(confianzas < 0.6)[0]
        indices_mal_clasificados = np.where(y != y_pred)[0]
        
        print(f"\n ANÁLISIS DE EJEMPLOS DIFÍCILES:")
        print(f"   - Frases con baja confianza (<60%): {len(indices_baja_confianza)}")
        print(f"   - Frases mal clasificadas: {len(indices_mal_clasificados)}")
        
        if len(indices_mal_clasificados) > 0:
            print(f"   - Ejemplo de mala clasificación:")
            idx = indices_mal_clasificados[0]
            frase_real = self.le.inverse_transform([y[idx]])[0]
            frase_pred = self.le.inverse_transform([y_pred[idx]])[0]
            print(f"     Real: {frase_real} → Predicho: {frase_pred} (conf: {confianzas[idx]:.3f})")

    def _decision_function_to_proba(self, decision_scores):
        """Convierte scores de decisión a probabilidades aproximadas"""
        from scipy.special import softmax
        
        if len(self.le.classes_) == 2:
            # Para binario: usar sigmoid
            proba_pos = 1 / (1 + np.exp(-decision_scores))
            proba_neg = 1 - proba_pos
            return np.column_stack([proba_neg, proba_pos])
        else:
            # Para multiclase: usar softmax
            return softmax(decision_scores, axis=1)

    def predecir_con_probabilidades(self, frases):
        """Predice con análisis detallado usando embeddings semánticos"""
        if not self.is_trained:
            raise Exception("Modelo no entrenado.")
        
        frases_limpias = [self.preprocesar_frase(f) for f in frases]
        encoder = self.cargar_encoder()
        X_frases = encoder.encode(frases_limpias)
        
        # Obtener scores de decisión y convertirlos a probabilidades
        decision_scores = self.clf.decision_function(X_frases)
        probabilidades = self._decision_function_to_proba(decision_scores)
        predicciones = self.clf.predict(X_frases)
        
        resultados = []
        for i, frase in enumerate(frases):
            # Crear diccionario de probabilidades por clase
            prob_dict = {}
            for class_idx, class_name in enumerate(self.le.classes_):
                if len(self.le.classes_) == 2:
                    # Para binario, ajustar índices
                    if class_idx == 0:
                        prob_dict[class_name] = probabilidades[i, 0]
                    else:
                        prob_dict[class_name] = probabilidades[i, 1]
                else:
                    prob_dict[class_name] = probabilidades[i, class_idx]
            
            resultados.append({
                'frase': frase,
                'frase_limpia': frases_limpias[i],
                'prediccion': self.le.inverse_transform([predicciones[i]])[0],
                'probabilidades': prob_dict,
                'confianza': max(probabilidades[i]),
                'embedding_tamano': X_frases[i].shape[0]
            })
        return resultados

    def guardar_modelo(self, ruta="app/models_machine_learning/models_svm/svm_model_nlpolitik.pkl"):
        """Guardar modelo (sin encoder - se carga dinámicamente)"""
        with open(ruta, 'wb') as f:
            pickle.dump({
                'clf': self.clf,
                'le': self.le,
                'metricas': self.metricas_entrenamiento,
                'encoder_name': 'hiiamsid/sentence_similarity_spanish_es'
            }, f)
        print(f" Modelo LinearSVC guardado en: {ruta}")

    def predecir_frases(self, frases):
        """Predice sin probabilidades (más rápido)"""
        if not self.is_trained:
            raise Exception("Modelo no entrenado.")
            
        frases_limpias = [self.preprocesar_frase(f) for f in frases]
        encoder = self.cargar_encoder()
        X_frases = encoder.encode(frases_limpias)
        predicciones = self.clf.predict(X_frases)
        return self.le.inverse_transform(predicciones)

    def cargar_modelo(self, ruta="app/models_machine_learning/models_svm/svm_model_final_1.pkl"):
        """Carga un modelo LinearSVC previamente guardado"""
        try:
            with open(ruta, 'rb') as f:
                datos = pickle.load(f)
            
            self.clf = datos['clf']
            self.le = datos['le']
            self.metricas_entrenamiento = datos.get('metricas', {})
            self.is_trained = True
            
            encoder_name = datos.get('encoder_name', 'hiiamsid/sentence_similarity_spanish_es')
            print(f" Modelo LinearSVC cargado desde: {ruta}")
            print(f"   Sentence Transformer: {encoder_name}")
            print(f"   Clases disponibles: {list(self.le.classes_)}")
            return True
            
        except FileNotFoundError:
            print(f" Archivo no encontrado: {ruta}")
            return False
        except Exception as e:
            print(f" Error cargando modelo: {e}")
            return False

    def evaluar_en_prueba(self, ruta_prueba="app/corpus/dataset_frases_entrenamiento_svm_prueba.csv"):
        """Evaluar en conjunto de prueba real"""
        print("\n" + "="*60)
        print(" EVALUACIÓN EN CONJUNTO DE PRUEBA")
        print("=" * 60)
        
        if not self.is_trained:
            print(" Modelo no entrenado")
            return
        
        # Cargar datos de prueba
        frases_prueba = []
        etiquetas_reales = []
        with open(ruta_prueba, encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)
            for fila in reader:
                if len(fila) >= 2:
                    frase, ideologia = fila[0].strip(), fila[1].strip()
                    if frase and ideologia:
                        frase_limpia = self.preprocesar_frase(frase)
                        frases_prueba.append(frase_limpia)
                        etiquetas_reales.append(ideologia)
        
        print(f" * Frases de prueba: {len(frases_prueba)}")
        print(f" * Distribución real: {Counter(etiquetas_reales)}")
        
        # Predecir
        predicciones = self.predecir_frases([f for f in frases_prueba])
        
        # Calcular métricas
        accuracy = accuracy_score(etiquetas_reales, predicciones)
        precision = precision_score(etiquetas_reales, predicciones, average='weighted', zero_division=0)
        recall = recall_score(etiquetas_reales, predicciones, average='weighted', zero_division=0)
        f1 = f1_score(etiquetas_reales, predicciones, average='weighted', zero_division=0)
        
        print(f"\n MÉTRICAS EN PRUEBA:")
        print(f"   Accuracy: {accuracy:.4f}")
        print(f"   Precision: {precision:.4f}")
        print(f"   Recall: {recall:.4f}")
        print(f"   F1-Score: {f1:.4f}")
        
        # Reporte detallado
        print(f"\n REPORTE DE CLASIFICACIÓN:")
        print(classification_report(etiquetas_reales, predicciones, target_names=self.le.classes_))
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1
        }

# SCRIPT PRINCIPAL ACTUALIZADO
def entrenar_modelo_final():
    print(" ENTRENAMIENTO CON LINEAR SVC + SENTENCE TRANSFORMERS")
    clasificador = ProcesadorSVMClasificador()
    metricas = clasificador.entrenar_modelo()
    
    # Prueba con frases que antes fallaban
    frases_test = [
    # ==================== IZQUIERDA ====================
    # Estilo MARPOR/manifiesto (directo, programático)
    "El estado debe garantizar el acceso universal a la salud pública gratuita.",
    "Es necesario incrementar el salario mínimo para combatir la desigualdad económica.",
    "La educación pública y laica es fundamental para el desarrollo nacional.",
    "Proponemos una reforma fiscal progresiva donde paguen más quienes más tienen.",
    
    # Estilo artículo de opinión mexicano (con matices, crítico)
    "AMLO logró poner a los pobres en el centro, pero su estatismo ahuyenta inversiones.",
    "La pensión universal es un logro, pero sin reforma fiscal es insostenible.",
    "Morena habla de soberanía pero firma contratos con la misma oligarquía empresarial.",
    "Los programas sociales alivian la pobreza, pero no crean movilidad social.",
    
    # ==================== DERECHA ====================
    # Estilo MARPOR/manifiesto
    "La libre competencia empresarial es el motor del crecimiento económico.",
    "Defendemos la autonomía del Banco de México y la disciplina fiscal.",
    "La seguridad jurídica atrae inversión extranjera y genera empleos.",
    "Las reformas estructurales deben simplificar la regulación empresarial.",
    
    # Estilo artículo de opinión mexicano
    "La concentración de poder en Palacio Nacional debilita los contrapesos democráticos.",
    "La 4T prefiere el control político sobre la autonomía del INE.",
    "El gasto en programas clientelares compromete el futuro fiscal del país.",
    "La militarización de tareas civiles erosiona el Estado de derecho.",
    
    # ==================== NO POLÍTICO ====================
    "La nueva receta de mole requiere chiles anchos y chocolate de mesa.",
    "El volcán Popocatépetl registró esta mañana una exhalación de vapor.",
    "El tráfico en Periférico está congestionado por obras de mantenimiento.",
    "El equipo de futbol americano de la UNAM ganó el clásico universitario.",
    "El concierto de la Orquesta Sinfónica se pospuso por lluvia.",
    
    # ==================== CASOS LÍMITE/DIFÍCILES ====================
    # (Para ver cómo maneja ambigüedades)
    "La seguridad pública es responsabilidad del gobierno federal.",  # Neutral pero político
    "La transparencia en el gasto público beneficia a todos.",  # Valor transversal
    "El desarrollo sostenible requiere equilibrio económico y ambiental.",  # Discurso moderno
    "La participación ciudadana fortalece la democracia.",  # Democracia (¿izq o der?)
    
    # Contextos mexicanos específicos
    "El aeropuerto Felipe Ángeles fue inaugurado en marzo de 2022.",  # Hecho político
    "La refinería Dos Bocas tendrá capacidad para procesar 340,000 barriles.",  # Dato/gobernó
    "La Guardia Nacional ahora coordina programas sociales.",  # Hecho con carga
    ]
    
    print("\n" + "="*60)
    print(" PRUEBA CON FRASES DE CONTEXTO COMPLEJO")
    print("=" * 60)
    
    resultados = clasificador.predecir_con_probabilidades(frases_test)
    for i, res in enumerate(resultados):
        print(f"{i+1}. '{res['frase']}'")
        print(f"   → {res['prediccion'].upper()} (Confianza: {res['confianza']:.3f})")
        print(f"    Prob: IZQ {res['probabilidades'].get('izquierda', 0):.3f} | DER {res['probabilidades'].get('derecha', 0):.3f} | NP {res['probabilidades'].get('no_politico', 0):.3f}")
        print()
    
    clasificador.guardar_modelo("app/models_machine_learning/models_svm/svm_model_final_version_ya._antepkl")
    return clasificador

if __name__ == "__main__":
    modelo_final = entrenar_modelo_final()