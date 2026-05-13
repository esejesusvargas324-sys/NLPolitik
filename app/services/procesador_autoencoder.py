import numpy as np
from typing import Tuple
from tensorflow.keras.models import Model    # type: ignore
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization  # type: ignore
from tensorflow.keras.optimizers import Adam  # type: ignore
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau  # type: ignore
from tensorflow.keras import regularizers # type: ignore

class ProcesadorAutoencoder:
    def __init__(self, input_dim: int, latent_dim: int = 12):  
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        self.autoencoder, self.encoder = self._construir_modelo_mejorado()
        print(f" * Autoencoder MEJORADO: {input_dim}D → {latent_dim}D")

    def _construir_modelo_mejorado(self) -> Tuple[Model, Model]:
        entrada = Input(shape=(self.input_dim,))
        
        # ENCODER
        codificado = Dense(384, activation='relu')(entrada)
        codificado = BatchNormalization()(codificado)
        codificado = Dropout(0.25)(codificado)
        
        codificado = Dense(128, activation='relu')(codificado)
        codificado = BatchNormalization()(codificado)
        codificado = Dropout(0.2)(codificado)
        
        codificado = Dense(32, activation='relu')(codificado)
        codificado = BatchNormalization()(codificado)
        
        # BOTTLENECK MEJORADO - CON LAS MODIFICACIONES CLAVE
        codificado = Dropout(0.1)(codificado)  # Pequeño dropout antes del bottleneck
        
        # Opción recomendada: Linear + BatchNorm + pequeña regularización
        cuello_botella = Dense(
            self.latent_dim, 
            activation='linear',
            kernel_regularizer=regularizers.l2(1e-5),
            name='bottleneck'
        )(codificado)
        #cuello_botella = BatchNormalization()(cuello_botella)
        
        # DECODER (simétrico)
        decodificado = Dense(32, activation='relu')(cuello_botella)
        decodificado = BatchNormalization()(decodificado)
        
        decodificado = Dense(128, activation='relu')(decodificado)
        decodificado = BatchNormalization()(decodificado)
        decodificado = Dropout(0.2)(decodificado)
        
        decodificado = Dense(384, activation='relu')(decodificado)
        decodificado = BatchNormalization()(decodificado)
        decodificado = Dropout(0.25)(decodificado)
        
        salida = Dense(self.input_dim, activation='linear')(decodificado)

        autoencoder = Model(inputs=entrada, outputs=salida)
        encoder = Model(inputs=entrada, outputs=cuello_botella)

        # Compilación con learning rate ligeramente menor
        autoencoder.compile(
            optimizer=Adam(learning_rate=0.0003),  # Reducido de 0.0005
            loss='mse',
            metrics=['mae', 'cosine_similarity']  # Añadí cosine similarity
        )
        
        return autoencoder, encoder

    # Los métodos entrenar() y codificar() se mantienen igual
    def entrenar(self, X: np.ndarray, epochs: int = 25, batch_size: int = 64) -> None:
        # Aumenté ligeramente las épocas y paciencia
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1,
                min_delta=0.0005
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=8,
                min_lr=0.00001,
                verbose=1
            )
        ]
        
        print(f" Entrenando autoencoder")
        print(f" Dimensión latente: {self.latent_dim}")
        
        self.autoencoder.fit(
            X, X, 
            epochs=epochs, 
            batch_size=batch_size, 
            shuffle=True, 
            verbose=1,
            validation_split=0.15,
            callbacks=callbacks
        )

    def codificar(self, X: np.ndarray) -> np.ndarray:
        return self.encoder.predict(X, verbose=0, batch_size=64)