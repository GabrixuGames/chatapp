import pymysql

# Configuración de la conexión a la base de datos
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',  # Cambia esto según tu configuración
    'database': 'CHATAPP'  # Cambia por el nombre de tu base de datos
}

def verificar_usuario(username, password):
    conn = None
    try:
        conn = pymysql.connect(**db_config)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        query = "SELECT * FROM Users WHERE user_name = %s AND user_pass = %s"
        cursor.execute(query, (username, password))
        result = cursor.fetchone()
        return result
    except pymysql.MySQLError as err:
        print(f"Error al conectar con la base de datos: {err}")
        return None
    finally:
        if conn:
            conn.close()



# Función para obtener la conexión con la base de datos
def get_db_connection():
    # Configura los parámetros de conexión
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='root',  # La nueva contraseña del usuario
        database='CHATAPP',  # El nombre de la base de datos
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection

# Función para guardar un mensaje en la base de datos
def save_message(username, room, message):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Inserta el mensaje en la tabla 'messages'
            query = "INSERT INTO messages (username, room, message) VALUES (%s, %s, %s)"
            cursor.execute(query, (username, room, message))
            connection.commit()  # Asegúrate de confirmar la transacción
    except Exception as e:
        print(f"Error al guardar el mensaje: {e}")
    finally:
        connection.close()

# Función para obtener los mensajes de una sala específica
def get_messages(room):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Selecciona los mensajes de la sala
            query = "SELECT * FROM messages WHERE room = %s ORDER BY timestamp ASC"
            cursor.execute(query, (room,))
            return cursor.fetchall()
    except Exception as e:
        print(f"Error al obtener los mensajes: {e}")
        return []
    finally:
        connection.close()
