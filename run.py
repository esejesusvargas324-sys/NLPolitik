from app import create_app
#from app.services.procesador_nlp import ProcesadorNLP

# Se crea instancia de la app Flask
app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
    #ProcesadorNLP.descargar_recursos()
     
        
        

