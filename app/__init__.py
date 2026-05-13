from app.controllers.routes import main_bp
from flask import Flask
from config.database import init_db

def create_app():
    app = Flask(__name__)
    app.secret_key = 'tu_clave_secreta_segura_987!XxA'  # ← puedes cambiarla por algo más fuerte
    init_db(app)
    # Registrar Blueprints, extensiones, rutas, etc.

    app.register_blueprint(main_bp) 
    return app
