# NLPolitik

**NLPolitik** es un pipeline de software para el análisis automatizado del discurso político en español. Clasifica textos en el espectro ideológico izquierda-derecha, identifica patrones discursivos mediante clustering y detecta la prominencia de temas económicos.

---

## Características

- Extracción de oraciones contextuales con patrones sintácticos (RAE)
- Embeddings semánticos con Sentence-BERT (1536 dimensiones)
- Reducción dimensional con autoencoder (12 dimensiones)
- Clustering no supervisado: K-Means, AGNES, DBSCAN
- Clasificación ideológica con SVM entrenada con MARPOR
- Detección de temas económicos con PLDA
- Interfaz web con Flask y visualización con ECharts
- Persistencia de análisis en MySQL

---

## Tecnologías

| Categoría | Tecnologías |
|-----------|-------------|
| Lenguaje | Python 3.9 |
| Web | Flask, HTML, CSS, JS, ECharts |
| NLP | spaCy, NLTK |
| Embeddings | Sentence-Transformers |
| Deep Learning | TensorFlow / Keras |
| Clustering | scikit-learn |
| Topic Modeling | tomotopy (PLDA) |
| Base de datos | MySQL, PyMySQL |

---

**Pipeline:** Texto → Preprocesamiento → SBERT → Autoencoder → Clustering → SVM → PLDA

---

## Instalación y uso

```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/nlpolitik.git
cd nlpolitik

# Crear entorno virtual
python -m venv my_venv
source my_venv/bin/activate  # Linux/Mac
my_venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos (editar config/database.py)

# Ejecutar
python run.py
