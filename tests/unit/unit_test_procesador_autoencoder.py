import unittest
import numpy as np
import tempfile
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from app.services.procesador_autoencoder import ProcesadorAutoencoder

class TestProcesadorAutoencoder(unittest.TestCase):
    
    def setUp(self):
        """Configuración inicial para las pruebas"""
        # Dimensiones de prueba más pequeñas para velocidad
        self.input_dim = 10
        self.latent_dim = 4
        self.autoencoder = ProcesadorAutoencoder(
            input_dim=self.input_dim, 
            latent_dim=self.latent_dim
        )
    
    # --- PRUEBA 1: UT-AE-001 ---
    def test_01_inicializacion_correcta(self):
        """Validar inicialización del autoencoder"""
        print("\n" + "="*60)
        print("PRUEBA 1: UT-AE-001")
        print("Título: Validar inicialización del autoencoder")
        print("Precondiciones: Ninguna")
        print("Cobertura: Constructor __init__() - modelos creados")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Crear instancia de ProcesadorAutoencoder")
        
        resultado_esperado = "Autoencoder y encoder creados correctamente"
        tiene_autoencoder = self.autoencoder.autoencoder is not None
        tiene_encoder = self.autoencoder.encoder is not None
        
        resultado_real = f"Autoencoder: {'SÍ' if tiene_autoencoder else 'NO'}, " \
                        f"Encoder: {'SÍ' if tiene_encoder else 'NO'}, " \
                        f"Dimensión: {self.input_dim}D → {self.latent_dim}D"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = tiene_autoencoder and tiene_encoder
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertIsNotNone(self.autoencoder.autoencoder)
        self.assertIsNotNone(self.autoencoder.encoder)
        self.assertEqual(self.autoencoder.input_dim, self.input_dim)
        self.assertEqual(self.autoencoder.latent_dim, self.latent_dim)
    
    # --- PRUEBA 2: UT-AE-002 ---
    def test_02_estructura_modelos_correcta(self):
        """Validar estructura de los modelos"""
        print("\n" + "="*60)
        print("PRUEBA 2: UT-AE-002")
        print("Título: Validar estructura de los modelos")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Modelos - dimensiones de entrada/salida")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Verificar dimensiones de capas de entrada/salida")
        
        # Verificar autoencoder
        ae_input_shape = self.autoencoder.autoencoder.input_shape[1]
        ae_output_shape = self.autoencoder.autoencoder.output_shape[1]
        
        # Verificar encoder
        encoder_input_shape = self.autoencoder.encoder.input_shape[1]
        encoder_output_shape = self.autoencoder.encoder.output_shape[1]
        
        resultado_esperado = f"Autoencoder: {self.input_dim}→{self.input_dim}, " \
                           f"Encoder: {self.input_dim}→{self.latent_dim}"
        resultado_real = f"Autoencoder: {ae_input_shape}→{ae_output_shape}, " \
                        f"Encoder: {encoder_input_shape}→{encoder_output_shape}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        
        estado = (ae_input_shape == self.input_dim and 
                  ae_output_shape == self.input_dim and
                  encoder_input_shape == self.input_dim and
                  encoder_output_shape == self.latent_dim)
        
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(ae_input_shape, self.input_dim)
        self.assertEqual(ae_output_shape, self.input_dim)
        self.assertEqual(encoder_input_shape, self.input_dim)
        self.assertEqual(encoder_output_shape, self.latent_dim)
    
    # --- PRUEBA 3: UT-AE-003 ---
    def test_03_codificacion_dimension_correcta(self):
        """Validar codificación mantiene dimensiones"""
        print("\n" + "="*60)
        print("PRUEBA 3: UT-AE-003")
        print("Título: Validar codificación mantiene dimensiones")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método codificar() - dimensiones de salida")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Codificar datos de prueba y verificar dimensiones")
        
        # Datos de prueba
        X_prueba = np.random.randn(5, self.input_dim).astype(np.float32)
        Z = self.autoencoder.codificar(X_prueba)
        
        resultado_esperado = f"Shape: (5, {self.latent_dim})"
        resultado_real = f"Shape: {Z.shape}, Tipo: {Z.dtype}"
        
        print(f"Entrada shape: {X_prueba.shape}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = Z.shape == (5, self.latent_dim)
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertEqual(Z.shape, (5, self.latent_dim))
        self.assertEqual(Z.dtype, np.float32)
    
    # --- PRUEBA 4: UT-AE-004 ---
    def test_04_consistencia_codificacion(self):
        """Validar consistencia en codificación (20 ejecuciones)"""
        print("\n" + "="*60)
        print("PRUEBA 4: UT-AE-004")
        print("Título: Validar consistencia en codificación")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método codificar() - consistencia 20 ejecuciones")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Codificar mismos datos 20 veces")
        
        X_prueba = np.random.randn(3, self.input_dim).astype(np.float32)
        codificaciones = []
        
        print(f"Entrada shape: {X_prueba.shape}")
        print("Generando 20 codificaciones...")
        
        for i in range(20):
            Z = self.autoencoder.codificar(X_prueba)
            codificaciones.append(Z)
            if i < 3:
                print(f"  Ejecución {i+1}: shape {Z.shape}, media={Z.mean():.6f}")
        
        # Verificar que todas sean iguales (autoencoder determinístico)
        primera = codificaciones[0]
        todas_iguales = True
        
        for i, Z in enumerate(codificaciones[1:], 1):
            if not np.allclose(Z, primera, rtol=1e-5, atol=1e-7):
                print(f"  Diferencia en ejecución {i+1}: max diff={np.max(np.abs(Z - primera)):.2e}")
                todas_iguales = False
        
        resultado_esperado = "20 codificaciones idénticas (modelo determinístico)"
        resultado_real = f"{'Todas iguales' if todas_iguales else 'Diferencias detectadas'}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if todas_iguales else 'FALLIDO'}")
        
        self.assertTrue(todas_iguales, "Las codificaciones no son consistentes")
    
    # --- PRUEBA 5: UT-AE-005 ---
    def test_05_prediccion_entrada_ceros(self):
        """Validar codificación con entrada de ceros"""
        print("\n" + "="*60)
        print("PRUEBA 5: UT-AE-005")
        print("Título: Validar codificación con entrada de ceros")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método codificar() - entrada de ceros")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Codificar matriz de ceros")
        
        X_ceros = np.zeros((2, self.input_dim), dtype=np.float32)
        Z = self.autoencoder.codificar(X_ceros)
        
        resultado_esperado = "Codificación cercana a cero (debido a capas BatchNorm)"
        resultado_real = f"Shape: {Z.shape}, Rango: [{Z.min():.2e}, {Z.max():.2e}]"
        
        print(f"Entrada: matriz de ceros {X_ceros.shape}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        
        # Con BatchNormalization, la salida puede no ser exactamente cero
        # pero debería estar en un rango razonable
        rango_aceptable = (-2.0, 2.0)
        en_rango = Z.min() >= rango_aceptable[0] and Z.max() <= rango_aceptable[1]
        
        print(f"Estado: {'APROBADO' if en_rango else 'FALLIDO'}")
        self.assertTrue(en_rango, f"Valores fuera de rango: {Z.min():.2f}, {Z.max():.2f}")
    
    # --- PRUEBA 6: UT-AE-006 ---
    def test_06_entrenamiento_basico(self):
        """Validar entrenamiento básico sin errores"""
        print("\n" + "="*60)
        print("PRUEBA 6: UT-AE-006")
        print("Título: Validar entrenamiento básico")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método entrenar() - ejecución sin errores")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Entrenar con pocos epochs y datos simples")
        
        # Datos de entrenamiento simples
        n_muestras = 10
        X_entrenamiento = np.random.randn(n_muestras, self.input_dim).astype(np.float32)
        
        print(f"Datos entrenamiento: {X_entrenamiento.shape}")
        print("Iniciando entrenamiento (2 epochs)...")
        
        try:
            # Entrenar solo 2 epochs para prueba rápida
            self.autoencoder.entrenar(X_entrenamiento, epochs=2, batch_size=4)
            resultado_real = "Entrenamiento completado sin excepciones"
            exito = True
        except Exception as e:
            resultado_real = f"Error en entrenamiento: {str(e)}"
            exito = False
        
        resultado_esperado = "Entrenamiento ejecutado sin errores"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if exito else 'FALLIDO'}")
        
        self.assertTrue(exito, "El entrenamiento lanzó una excepción")
    
    # --- PRUEBA 7: UT-AE-007 ---
    def test_07_reduccion_dimensionalidad_efectiva(self):
        """Validar que la reducción dimensional ocurre"""
        print("\n" + "="*60)
        print("PRUEBA 7: UT-AE-007")
        print("Título: Validar reducción dimensional efectiva")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Codificación - reducción de dimensiones")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Verificar que latent_dim < input_dim")
        
        reduccion_porcentaje = (1 - self.latent_dim/self.input_dim) * 100
        
        resultado_esperado = f"Reducción dimensional efectiva ({reduccion_porcentaje:.1f}%)"
        resultado_real = f"Input: {self.input_dim}D → Latente: {self.latent_dim}D " \
                        f"(reducción: {reduccion_porcentaje:.1f}%)"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        estado = self.latent_dim < self.input_dim
        print(f"Estado: {'APROBADO' if estado else 'FALLIDO'}")
        
        self.assertLess(self.latent_dim, self.input_dim, 
                       "No hay reducción dimensional (latent_dim >= input_dim)")
    
    # --- PRUEBA 8: UT-AE-008 ---
    def test_08_codificacion_lotes_variables(self):
        """Validar codificación con diferentes tamaños de lote"""
        print("\n" + "="*60)
        print("PRUEBA 8: UT-AE-008")
        print("Título: Validar codificación con lotes variables")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método codificar() - diferentes tamaños de batch")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Codificar con batch de 1, 5 y 10 muestras")
        
        tamaños = [1, 3, 7]
        resultados = []
        
        for tamaño in tamaños:
            X = np.random.randn(tamaño, self.input_dim).astype(np.float32)
            Z = self.autoencoder.codificar(X)
            resultados.append((tamaño, Z.shape))
            print(f"  Batch {tamaño}: entrada {X.shape} → salida {Z.shape}")
        
        # Verificar que todos mantienen la dimensión latente correcta
        correctos = all(shape[1] == self.latent_dim for _, shape in resultados)
        
        resultado_esperado = f"Todos mantienen dimensión latente: {self.latent_dim}D"
        resultado_real = f"Resultados: {', '.join([f'batch{s}→{s}×{d}' for s, (_, (_, d)) in enumerate(resultados)])}"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if correctos else 'FALLIDO'}")
        
        for tamaño, shape in resultados:
            self.assertEqual(shape[1], self.latent_dim, 
                           f"Batch {tamaño} no mantiene dimensión latente")
    
    # --- PRUEBA 9: UT-AE-009 ---
    def test_09_resumen_modelo_disponible(self):
        """Validar que el modelo tiene resumen"""
        print("\n" + "="*60)
        print("PRUEBA 9: UT-AE-009")
        print("Título: Validar resumen del modelo disponible")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Modelo - método summary() disponible")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Verificar que se puede llamar a summary()")
        
        try:
            # Capturar output de summary (no imprimirlo)
            self.autoencoder.autoencoder.summary(print_fn=lambda x: None)
            resultado_real = "Método summary() disponible y funcional"
            exito = True
        except Exception as e:
            resultado_real = f"Error en summary(): {str(e)}"
            exito = False
        
        resultado_esperado = "Resumen del modelo accesible"
        
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        print(f"Estado: {'APROBADO' if exito else 'FALLIDO'}")
        
        self.assertTrue(exito, "El método summary() falló")
    
    # --- PRUEBA 10: UT-AE-010 ---
    def test_10_codificacion_valores_extremos(self):
        """Validar codificación con valores extremos"""
        print("\n" + "="*60)
        print("PRUEBA 10: UT-AE-010")
        print("Título: Validar codificación con valores extremos")
        print("Precondiciones: Autoencoder inicializado")
        print("Cobertura: Método codificar() - valores muy grandes/pequeños")
        print("Dependencias simuladas: TensorFlow/Keras")
        print("Pasos: 1. Codificar con valores extremos")
        
        # Crear datos con valores extremos
        X_extremos = np.array([
            [1000.0] * self.input_dim,  # Valores muy grandes
            [-1000.0] * self.input_dim, # Valores muy pequeños
            [1e6] * self.input_dim,     # Valores extremadamente grandes
        ], dtype=np.float32)
        
        try:
            Z = self.autoencoder.codificar(X_extremos)
            resultado_real = f"Codificación exitosa, shape: {Z.shape}, " \
                           f"rango: [{Z.min():.2f}, {Z.max():.2f}]"
            exito = True
        except Exception as e:
            resultado_real = f"Error en codificación: {str(e)}"
            exito = False
        
        resultado_esperado = "Manejo robusto de valores extremos (sin NaN/Inf)"
        
        print(f"Entrada: valores extremos {X_extremos.shape}")
        print(f"Resultado esperado: {resultado_esperado}")
        print(f"Resultado real: {resultado_real}")
        
        if exito:
            # Verificar que no hay NaN o Inf
            tiene_nan = np.any(np.isnan(Z))
            tiene_inf = np.any(np.isinf(Z))
            robusto = not (tiene_nan or tiene_inf)
            print(f"  NaN: {'SÍ' if tiene_nan else 'NO'}, Inf: {'SÍ' if tiene_inf else 'NO'}")
            print(f"Estado: {'APROBADO' if robusto else 'FALLIDO'}")
            self.assertFalse(tiene_nan, "Resultados contienen NaN")
            self.assertFalse(tiene_inf, "Resultados contienen Inf")
        else:
            print(f"Estado: FALLIDO")
            self.fail("Codificación falló con valores extremos")

if __name__ == '__main__':
    print("INICIO DE PRUEBAS UNITARIAS - PROCESADOR AUTOENCODER")
    print("="*60)
    unittest.main(verbosity=0)