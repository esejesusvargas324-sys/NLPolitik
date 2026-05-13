import pickle
import csv
from sklearn.svm import LinearSVC  
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
from collections import Counter
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
                self.encoder = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')
                print(" Sentence Transformer cargado: hiiamsid/sentence_similarity_spanish_es")
            except Exception as e:
                print(f" Error cargando Sentence Transformer: {e}")
                self.encoder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
                print(" Sentence Transformer cargado (fallback): paraphrase-multilingual-MiniLM-L12-v2")
        return self.encoder
    
    def preprocesar_frase(self, frase):
        """Preprocesamiento básico"""
        frase = re.sub(r'\s+', ' ', frase).strip()
        return frase.lower()

    def entrenar_modelo(self, ruta_csv="app/corpus/entrenamiento/dataset_frases_entrenamiento_svm_entrenamiento_final.csv"):
        """Entrena LinearSVC con Sentence Transformers"""
        print(" ENTRENAMIENTO CON LINEAR SVC + SENTENCE TRANSFORMERS")
        print("=" * 60)
        
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
        
        print(" * Generando embeddings semánticos...")
        encoder = self.cargar_encoder()
        X_train = encoder.encode(frases_csv, show_progress_bar=True, batch_size=32)
        
        print(f" * Dimensiones de embeddings: {X_train.shape}")
        
        self.le = LabelEncoder()
        y_encoded = self.le.fit_transform(etiquetas_csv)
        
        print(f"\n Entrenando LinearSVC (optimizado para {X_train.shape[1]} dimensiones):")
        
        self.clf = LinearSVC(
            class_weight='balanced', 
            random_state=42,
            C=0.5,
            dual=False,
            max_iter=2000,
            tol=1e-4
        )
        self.clf.fit(X_train, y_encoded)
        self.is_trained = True
        
        scores = cross_val_score(self.clf, X_train, y_encoded, cv=5, scoring='accuracy')
        print(f" * Accuracy validación cruzada (5-fold): {scores.mean():.3f} (+/- {scores.std() * 2:.3f})")
        
        return self.metricas_entrenamiento

    def guardar_modelo(self, ruta="app/models_machine_learning/models_svm/svm_model_nlpolitik.pkl"):
        """Guardar modelo"""
        with open(ruta, 'wb') as f:
            pickle.dump({
                'clf': self.clf,
                'le': self.le,
                'metricas': self.metricas_entrenamiento,
                'encoder_name': 'hiiamsid/sentence_similarity_spanish_es'
            }, f)
        print(f" Modelo LinearSVC guardado en: {ruta}")

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

    def predecir_frases(self, frases):
        if not self.is_trained:
            raise Exception("Modelo no entrenado.")
            
        frases_limpias = [self.preprocesar_frase(f) for f in frases]
        encoder = self.cargar_encoder()
        X_frases = encoder.encode(frases_limpias)
        predicciones = self.clf.predict(X_frases)
        return self.le.inverse_transform(predicciones)

def entrenar_modelo_final():
    print(" ENTRENAMIENTO CON LINEAR SVC + SENTENCE TRANSFORMERS")
    clasificador = ProcesadorSVMClasificador()
    clasificador.entrenar_modelo()
    clasificador.guardar_modelo("app/models_machine_learning/models_svm/svm_model_final_version_ya._antepkl")
    return clasificador

if __name__ == "__main__":
    modelo_final = entrenar_modelo_final()
