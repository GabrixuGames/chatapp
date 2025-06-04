# 💬 ChatAPP - Aplicación de Chat en Vivo

ChatAPP es una aplicación web de chat en tiempo real construida con un stack moderno: **React + Vite** en el frontend y **Flask + Flask-SocketIO** en el backend. Utiliza una base de datos SQL para manejar usuarios y mensajes.

## 🚀 Funcionalidades

- Registro e inicio de sesión de usuarios
- Envío y recepción de mensajes en tiempo real
- Almacenamiento de mensajes en base de datos
- Interfaz rápida y reactiva gracias a React + Vite
- Backend ligero y eficiente con Flask-SocketIO

## 🛠️ Tecnologías Utilizadas

### Frontend
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Socket.IO Client](https://socket.io/)

### Backend
- [Python](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/)
- [SQLite](https://www.sqlite.org/) (o cualquier otra base de datos SQL)

## 📁 Estructura del Proyecto

```text
ChatAPP/
├── backend/
│   ├── app.py                  # Archivo principal del servidor Flask
│   ├── db_utils.py             # Funciones para manejar la base de datos
│   └── requirements.txt        # Dependencias del backend
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes de React
│   │   ├── App.jsx             # Componente principal
│   │   └── main.jsx            # Punto de entrada de React
│   ├── public/                 # Archivos públicos
│   └── vite.config.js          # Configuración de Vite
│
├── database/
│   └── chatapp.db              # Base de datos SQLite (opcional)
│
└── README.md                   # Documentación del proyecto
```

## ⚙️ Configuración del Proyecto

### 🔧 Requisitos

- Python 3.8 o superior
- Node.js 16 o superior
- npm o yarn

### 📦 Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/tu-usuario/ChatAPP.git
cd ChatAPP
```

2. **Instalar y ejecutar backend**

```cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

2. **Instalar y ejecutar frontend**
   
```cd ../frontend
npm install
npm run dev
```
### 🧪 Uso
  - Abre dos terminales: una para el backend (python app.py) y otra para el frontend (npm run dev)
  - Abre tu navegador en http://localhost:5173
  - Regístrate o inicia sesión
  - ¡Empieza a chatear en tiempo real!

### 📌 Notas
  - La base de datos puede ser SQLite para desarrollo y se puede migrar a otra (como MySQL o PostgreSQL) para producción.
  - Si se despliega en producción, se recomienda usar HTTPS y configurar correctamente CORS en Flask.
