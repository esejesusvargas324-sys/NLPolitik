from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy import text

db = SQLAlchemy()

def init_db(app: Flask):
    # Configuración para procesamiento LARGO (horas)
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        'mysql+pymysql://root:NLPolitikContraseña@localhost/nlpolitik'
    )

    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:Contraseña@localhost/nlpolitik"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    #  CONFIGURACIÓN CRÍTICA para procesamiento de 30min+
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 28000,          # Reciclar antes del timeout de MySQL
        'pool_pre_ping': True,          # Ping automático antes de usar conexión
        'pool_size': 5,                 # Conexiones iniciales
        'max_overflow': 10,             # Máximo si se necesitan más
        'pool_timeout': 30,             # Timeout para obtener conexión
        
        'connect_args': {
            'connect_timeout': 30,      # 30 seg para conectar
            'read_timeout': 3600,       # 1 HORA para lecturas
            'write_timeout': 3600,      #  1 HORA para escrituras
            'charset': 'utf8mb4',
        }
    }

    db.init_app(app)

    # Prueba de conexión
    try:
        with app.app_context():
            db.session.execute(text('SELECT 1'))
            print(" Conexión exitosa con NLPolitikDB")
            
            # Verificar timeout de MySQL
            result = db.session.execute(text("SHOW VARIABLES LIKE 'wait_timeout'"))
            timeout = result.fetchone()[1]
            print(f" MySQL wait_timeout: {timeout} segundos")
            
    except Exception as e:
        print(f" Error: {e}")
