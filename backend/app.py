from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, flash, make_response
from flask_socketio import SocketIO, emit, join_room, leave_room, send
import pymysql
from scripts.db_utils import save_message, get_messages, verificar_usuario
from flask import send_from_directory
import requests
from flask_cors import CORS
from flask import Flask, request, jsonify, session
from scripts.db_utils import verificar_usuario


app = Flask(__name__)
app.secret_key = 'clave_secreta'
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',  # O 'None' si usas HTTPS
    SESSION_COOKIE_SECURE=False     # True si usas HTTPS
)


# CORS configurado con supports_credentials
CORS(app, origins=["http://localhost:8080"], supports_credentials=True)


# Configuración de Flask-SocketIO para aceptar conexiones desde http://localhost:8080
socketio = SocketIO(app, cors_allowed_origins="http://localhost:8080",)

# Ruta para la página principal (inicio de sesión)
@app.route("/")
def home():
    return render_template("index.html")


# Ruta para procesar el inicio de sesión
@app.route('/procesar_login', methods=['POST'])
def procesar_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    usuario = verificar_usuario(username, password)

    if usuario:
        session['username'] = usuario["user_name"]
        return jsonify({"message": "Login exitoso", "username": usuario["user_name"]}), 200
    else:
        return jsonify({"message": "Credenciales incorrectas"}), 401

@app.route("/verificar_sesion", methods=["GET"])
def verificar_sesion():
    if "username" in session:
        return jsonify({"username": session["username"]}), 200
    else:
        return jsonify({"message": "No autorizado"}), 401



# Ruta para unirse al chat
@app.route('/chat/<username>', methods=['GET'])
def chat(username):
    rooms = ["General", "Sala 1", "Sala 2"]  # Ejemplo de salas de chat
    return render_template('chat.html', username=username, rooms=rooms)


# Ruta para manejar la unión a una sala de chat
@socketio.on('join')
def on_join(data):
    username = data["username"]
    room = data["room"]
    join_room(room)
    
    # Obtener los mensajes históricos de la sala
    messages = get_messages(room)
    
    # Enviar los mensajes históricos al usuario que se unió
    send({
        "system_message": f"{username} has entered the room {room}.",
        "messages": messages  # Se envían los mensajes históricos
    }, room=room)



# Función para enviar prompt a Ollama
def enviar_a_ollama(prompt):
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",  # nombre del modelo en Ollama
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            return response.json()["response"]
        else:
            return "Error al obtener respuesta de la IA."
    except Exception as e:
        return f"Error al conectar con Ollama: {str(e)}"


# Conexión a la base de datos
def get_db_connection():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='root',
        database='CHATAPP',
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection

# Función para guardar el mensaje en la base de datos
from datetime import datetime

def save_message(username, room, message):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Convertir datetime a string
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Formato personalizado
            query = "INSERT INTO messages (username, room, message, timestamp) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (username, room, message, timestamp))
            connection.commit()
    except Exception as e:
        print(f"Error al guardar el mensaje: {e}")
    finally:
        connection.close()



# Función para obtener los mensajes de una sala
# Función para obtener los mensajes de una sala
def get_messages(room):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            query = "SELECT id, room, username, message, timestamp FROM messages WHERE room = %s ORDER BY timestamp ASC"
            cursor.execute(query, (room,))
            result = cursor.fetchall()
            
            # Convertir los resultados a un formato más fácil de manejar en el frontend
            messages = [
                {
                    "id": message[0],
                    "room": message[1],
                    "username": message[2],  # Cambiado a 'username'
                    "content": message[3],   # Cambiado a 'message' (ahora 'content' en el frontend)
                    "timestamp": message[4].isoformat()  # Convertir a formato ISO 8601 para facilitar su manejo
                }
                for message in result
            ]
            return messages
    except Exception as e:
        print(f"Error al obtener los mensajes: {e}")
        return []
    finally:
        connection.close()


# Maneja los mensajes recibidos
@socketio.on('message')
def handle_message(message_data):
    print("Mensaje recibido:", message_data)
    username = message_data.get('username')
    room_id = message_data.get('roomId')
    content = message_data.get('content')

    if not username or not room_id or not content:
        print("Datos incompletos en el mensaje:", message_data)
        return

    save_message(username, room_id, content)
    emit('message', message_data, room=room_id)

# Supongamos que tienes un diccionario con las salas y sus mensajes
rooms_messages = {
    "R1": [{"username": "user1", "content": "Hola", "timestamp": "2025-04-22T12:34:56Z"}],
    "R2": [{"username": "user2", "content": "¿Qué tal?", "timestamp": "2025-04-22T13:00:00Z"}],
    "R3": [{"username": "user3", "content": "¡Bienvenidos!", "timestamp": "2025-04-22T14:00:00Z"}],
}

@socketio.on('join')
def handle_join(room_id):
    """Cuando un usuario se une a una sala, se le envían los mensajes previos"""
    # Obtener los mensajes de la sala
    room_messages = get_messages(room_id)  # Suponiendo que esta función existe y obtiene los mensajes.
    emit('previous_messages', room_messages, room=room_id)



@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada"}), 200




# Controlamos cache para que no se guarde en el navegador
@app.after_request
def add_cache_control(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

# Ejecutar la aplicación
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True,  allow_unsafe_werkzeug=True)
