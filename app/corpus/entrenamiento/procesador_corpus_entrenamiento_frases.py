import re
import pandas as pd
import spacy
from spacy.matcher import Matcher
import os
import sys
from collections import defaultdict

class RILEFrasesExtractor:
    def __init__(self):
        # Cargar modelo spaCy (igual que en tu extractor económico)
        try:
            self.spacy_nlp = spacy.load("es_core_news_sm")
            print("Modelo spaCy 'es_core_news_sm' cargado correctamente.")
        except OSError:
            print("Modelo 'es_core_news_sm' no encontrado. Intentando descargarlo...")
            try:
                os.system("python -m spacy download es_core_news_sm")
                self.spacy_nlp = spacy.load("es_core_news_sm")
                print("Modelo spaCy 'es_core_news_sm' descargado y cargado correctamente.")
            except:
                print("Error: No se pudo descargar o cargar el modelo de spaCy.")
                self.spacy_nlp = None
                sys.exit(1)

        # SOLO dataset de entrenamiento (eliminado dataset_prueba)
        self.dataset_entrenamiento = {"izquierda": [], "derecha": [], "no_politico": []}

    @staticmethod
    def limpiar_texto(texto):
        """Limpieza idéntica a tu extractor económico"""
        if isinstance(texto, bytes):
            texto = texto.decode("utf-8", errors="ignore")
        
        texto = texto.lower()
        # Mantener algunos signos de puntuación que pueden ser importantes para frases
        texto = re.sub(r'[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?]', '', texto)
        texto = re.sub(r'["\'`«»""]', '', texto)
        texto = texto.replace('\n', ' ').replace('\t', ' ')
        texto = re.sub(r'\s+', ' ', texto).strip()
        
        return texto
    
    def extraer_frases_por_texto(self, texto, ideologia):
        """Extrae ORACIONES COMPLETAS con filtro semántico RILE"""
        if not ideologia or not self.spacy_nlp:
            return []
        
        try:
            doc = self.spacy_nlp(texto)
            frases_encontradas = []
            
            # Oraciones completas de spaCy
            for sent in doc.sents:
                frase = sent.text.strip()
                num_palabras = len(frase.split())
                
                # Filtros más flexibles para oraciones completas
                if (4 <= num_palabras <= 35 and  # Rango más amplio para oraciones
                    len(frase) >= 25 and         # Longitud mínima de caracteres
                    len(frase) <= 300):          # Longitud máxima para evitar párrafos
                    
                    frase_limpia = frase.lower().strip()
                    frases_encontradas.append(frase_limpia)
            
            #  FILTRO SEMÁNTICO MEJORADO PARA ORACIONES COMPLETAS
            frases_filtradas = []
            palabras_vacias = {'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 
                            'de', 'del', 'al', 'y', 'o', 'en', 'por', 'para', 'que', 
                            'se', 'no', 'con', 'sin', 'sobre', 'bajo', 'entre'}
            
            for frase in set(frases_encontradas):
                palabras = frase.split()
                palabras_significativas = [p for p in palabras if p not in palabras_vacias]
                
                # Filtros mejorados para oraciones completas
                if (len(palabras_significativas) >= 3 and          # Mínimo 3 palabras significativas
                    not all(len(p) < 4 for p in palabras_significativas) and  # Evitar solo palabras cortas
                    any(len(p) > 5 for p in palabras_significativas)):       # Al menos una palabra larga
                    
                    frases_filtradas.append(frase)
            
            # Asignar ideología directamente
            if frases_filtradas and ideologia in ["izquierda", "derecha", "no_politico"]:
                self.dataset_entrenamiento[ideologia].extend(frases_filtradas)
            
            return frases_filtradas
            
        except Exception as e:
            print(f"Error en extracción: {e}")
            return []
        
    def procesar_archivos_politicos(self, ruta_carpeta, ideologia_manual=None):
        """Procesa archivos políticos - TODAS las frases toman la ideología de la carpeta"""
        if not os.path.exists(ruta_carpeta):
            print(f"Error: La carpeta {ruta_carpeta} no existe.")
            return
        
        # DETERMINAR IDEOLOGÍA POR NOMBRE DE CARPETA
        if "izquierda" in ruta_carpeta.lower():
            ideologia_carpeta = "izquierda"
        elif "derecha" in ruta_carpeta.lower(): 
            ideologia_carpeta = "derecha"
        else:
            print(f"⚠️  No se pudo determinar ideología para carpeta: {ruta_carpeta}")
            return
        
        archivos_csv = [f for f in os.listdir(ruta_carpeta) if f.endswith('.csv')]
        
        if not archivos_csv:
            print(f"No se encontraron archivos CSV en {ruta_carpeta}")
            return
        
        print(f"\n Procesando {len(archivos_csv)} archivos de {ideologia_carpeta.upper()}...")
        
        total_frases = 0
        for archivo in archivos_csv:
            ruta_completa = os.path.join(ruta_carpeta, archivo)
            try:
                df = pd.read_csv(ruta_completa)
                
            
                if 'text' not in df.columns:
                    print(f"El archivo {archivo} no tiene columna 'text'. Saltando...")
                    continue
                
                print(f"\n {archivo}")
                frases_archivo = 0
                
                for idx, fila in df.iterrows():
                    if pd.isna(fila['text']) or str(fila['text']).strip() == "":
                        continue
                    
                    # Limpiar texto
                    texto_limpio = self.limpiar_texto(str(fila['text']))
                    
          
                    frases = self.extraer_frases_por_texto(texto_limpio, ideologia_carpeta)
                    frases_archivo += len(frases)
                
                total_frases += frases_archivo
                print(f"   Frases extraídas: {frases_archivo}")
                    
            except Exception as e:
                print(f" Error procesando {archivo}: {e}")
        
        print(f"\n TOTAL FRASES {ideologia_carpeta.upper()} EXTRAÍDAS: {total_frases}")

    def procesar_archivos_no_politicos(self, ruta_carpeta):
        """Procesa archivos NO políticos SOLO para entrenamiento"""
        if not os.path.exists(ruta_carpeta):
            print(f"Error: La carpeta {ruta_carpeta} no existe.")
            return
        
        archivos_csv = [f for f in os.listdir(ruta_carpeta) if f.endswith('.csv')]
        
        if not archivos_csv:
            print(f"No se encontraron archivos CSV en {ruta_carpeta}")
            return
        
        print(f"\n Procesando {len(archivos_csv)} archivos NO políticos (solo entrenamiento)...")
        
        total_frases = 0
        for archivo in archivos_csv:
            ruta_completa = os.path.join(ruta_carpeta, archivo)
            try:
                df = pd.read_csv(ruta_completa)
                
                # Para no políticos, solo necesitamos la columna 'text'
                if 'text' not in df.columns:
                    print(f"El archivo {archivo} no tiene columna 'text'. Saltando...")
                    continue
                
                print(f"\n {archivo}")
                frases_archivo = 0
                
                for idx, fila in df.iterrows():
                    if pd.isna(fila['text']) or str(fila['text']).strip() == "":
                        continue
                    
                    # Limpiar texto
                    texto_limpio = self.limpiar_texto(str(fila['text']))
                    
                    # Extraer frases marcándolas como no políticas
                    frases = self.extraer_frases_por_texto(texto_limpio, "no_politico")
                    frases_archivo += len(frases)
                
                total_frases += frases_archivo
                print(f"   Frases no políticas extraídas: {frases_archivo}")
                    
            except Exception as e:
                print(f" Error procesando {archivo}: {e}")
        
        print(f"\n TOTAL FRASES NO POLÍTICAS EXTRAÍDAS: {total_frases}")

    def crear_dataset_entrenamiento(self, output_path, proporcion_no_politico=0.2):
        """Crea SOLO dataset de entrenamiento (sin split test)"""
        
        # Eliminar duplicados
        for categoria in self.dataset_entrenamiento:
            frases_unicas = list(set(self.dataset_entrenamiento[categoria]))
            self.dataset_entrenamiento[categoria] = frases_unicas
        
        print(f"\n DATOS DISPONIBLES PARA ENTRENAMIENTO:")
        print(f"   - Izquierda: {len(self.dataset_entrenamiento['izquierda'])}")
        print(f"   - Derecha: {len(self.dataset_entrenamiento['derecha'])}")
        print(f"   - No político: {len(self.dataset_entrenamiento['no_politico'])}")
        
        #  ESTRATEGIA: Balancear políticos tomando el MÍNIMO para mantener balance
        min_count_politico = min(len(self.dataset_entrenamiento["izquierda"]), 
                                len(self.dataset_entrenamiento["derecha"]))
        
        # Preparar datos políticos BALANCEADOS
        datos_izquierda = self.dataset_entrenamiento["izquierda"]
        datos_derecha = self.dataset_entrenamiento["derecha"]
        
        datos_politicos = datos_izquierda + datos_derecha
        etiquetas_politicas = (["izquierda"] * len(datos_izquierda) + 
                            ["derecha"] * len(datos_derecha))
        
        print(f" POLÍTICOS BALANCEADOS: {len(datos_politicos)} frases ({len(datos_izquierda)} izq + {len(datos_derecha)} der)")
        
        #  ESTRATEGIA: Calcular no políticos como porcentaje del entrenamiento político
        total_entrenamiento_politico = len(datos_politicos)
        cantidad_deseada_no_politico = int(total_entrenamiento_politico * proporcion_no_politico)
        
        # Preparar contenido no político SOLO para entrenamiento
        datos_no_politico = self.dataset_entrenamiento["no_politico"]
        
        # Limitar contenido no político a la proporción deseada
        datos_no_politico_balanceados = datos_no_politico[:cantidad_deseada_no_politico]
        etiquetas_no_politico_balanceadas = ["no_politico"] * len(datos_no_politico_balanceados)
        
        print(f" NO POLÍTICOS INCLUIDOS: {len(datos_no_politico_balanceados)} de {len(datos_no_politico)} disponibles ({proporcion_no_politico*100}% del entrenamiento político)")
        
        # Combinar entrenamiento (político + no político)
        datos_entrenamiento_completo = (list(datos_politicos) + 
                                    list(datos_no_politico_balanceados))
        etiquetas_entrenamiento_completo = (list(etiquetas_politicas) + 
                                        list(etiquetas_no_politico_balanceadas))
        
        # Crear DataFrame de entrenamiento
        df_entrenamiento = pd.DataFrame({
            'frase': datos_entrenamiento_completo,
            'ideologia': etiquetas_entrenamiento_completo
        })
        
        # Mezclar aleatoriamente
        df_entrenamiento = df_entrenamiento.sample(frac=1, random_state=42).reset_index(drop=True)
        
        # Guardar
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df_entrenamiento.to_csv(output_path, index=False, encoding='utf-8')
        
        # Estadísticas detalladas
        print(f"\n DATASET DE ENTRENAMIENTO FINAL:")
        print(f" Ruta: {output_path}")
        print(f" Total de frases: {len(df_entrenamiento)}")
        print(f"   - Izquierda: {len(df_entrenamiento[df_entrenamiento['ideologia'] == 'izquierda'])}")
        print(f"   - Derecha: {len(df_entrenamiento[df_entrenamiento['ideologia'] == 'derecha'])}")
        print(f"   - No político: {len(df_entrenamiento[df_entrenamiento['ideologia'] == 'no_politico'])}")
        print(f"   - Proporción no político: {len(df_entrenamiento[df_entrenamiento['ideologia'] == 'no_politico'])/len(df_entrenamiento)*100:.1f}%")
        
        
        return df_entrenamiento

def main():
    # Rutas (manteniendo tu estructura)
    base_path = r"D:\UniversidadUACM\Tesis\05_Redacción_Tesis\04_Desarrollo_Teórico_Metodologico\CSV_CORPUS"
    izquierda_path = os.path.join(base_path, "Izquierda")
    no_politicos_path = os.path.join(base_path, "NoPoliticos")
    derecha_path = os.path.join(base_path, "Derecha")
    output_path = os.path.join(base_path, "dataset_frases_entrenamiento_svm_final.csv")
    
    # Crear extractor
    extractor = RILEFrasesExtractor()
    
    # Procesar archivos EXTRACTANDO FRASES
    print("=" * 50)
    print("PROCESANDO MANIFIESTOS - EXTRACCIÓN DE FRASES PARA SVM")
    print("=" * 50)
    
    # Procesar cada carpeta
    print("=" * 50)
    print("PROCESANDO MANIFIESTOS - Izquierda")
    print("=" * 50)
    extractor.procesar_archivos_politicos(izquierda_path)
    print("=" * 50)
    print("PROCESANDO MANIFIESTOS - Derecha")
    print("=" * 50)
    extractor.procesar_archivos_politicos(derecha_path)
    print("=" * 50)
    print("PROCESANDO MANIFIESTOS - No politicos")
    print("=" * 50)
    extractor.procesar_archivos_no_politicos(no_politicos_path)

 
    extractor.crear_dataset_entrenamiento(output_path, proporcion_no_politico=0.2)
    
    print("\n¡Proceso completado! ")
    print("Dataset de ENTRENAMIENTO único creado para SVM")
    print("Contenido político balanceado (izquierda/derecha)")
    print("Contenido no político incluido (20% proporción)")
    print("Pruebas se realizarán con artículos reales de medios digitales")

if __name__ == "__main__":
    main()
