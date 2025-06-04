import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { io } from "socket.io-client";

// Define la estructura del mensaje
export interface Message {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

// Define la estructura de la sala
export interface Room {
  id: string;
  name: string;
  description: string;
}

interface ChatContextType {
  messages: Message[];
  rooms: Room[];
  currentRoom: Room | null;
  sendMessage: (content: string, userId: string) => void;
  setCurrentRoom: (roomId: string) => void;
  currentUserId: string;  // Añadimos el campo currentUserId
}

// Crear las salas iniciales
const initialRooms: Room[] = [
  { id: "R1", name: "Sala 1", description: "Bienvenido a la sala 1!" },
  { id: "R2", name: "Sala 2", description: "Bienvenido a la sala 2!" },
  { id: "R3", name: "Sala 3", description: "Bienvenido a la sala 3!" }
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Configura la conexión con Socket.IO
const socket = io("http://localhost:5000"); // Dirección de tu servidor Flask con SocketIO

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms] = useState<Room[]>(initialRooms);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(initialRooms[0]);
  const [currentUserId] = useState<string>(sessionStorage.getItem("userId") || "defaultUserId");

  useEffect(() => {
    // Establece la conexión para recibir mensajes en tiempo real
    socket.on("connect", () => {
      console.log("Conexión establecida con el servidor Socket.IO");
    });

    socket.on("message", (message) => {
      console.log("Mensaje recibido: ", message);
      message.timestamp = new Date(message.timestamp);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Escucha los mensajes previos cuando el usuario entra en una sala
    socket.on("previous_messages", (previousMessages: Message[]) => {
      console.log("Mensajes previos recibidos: ", previousMessages);
      setMessages(previousMessages);
    });

    return () => {
      socket.off("message");
      socket.off("previous_messages");
    };
  }, [currentRoom]);

  const sendMessage = (content: string, userId: string) => {
    if (!currentRoom) return;

    const username = sessionStorage.getItem("username") || "Invitado";

    const newMessage: Message = {
      id: Date.now().toString(),
      roomId: currentRoom.id,
      userId,
      username,
      content,
      timestamp: new Date()
    };

    console.log("Enviando mensaje: ", newMessage);

    // Enviar el mensaje al servidor
    socket.emit("message", newMessage);

    // Actualizar el estado local de mensajes
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages, newMessage];
      console.log("Mensajes actuales:", newMessages);
      return newMessages;
    });
  };

  const switchRoom = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      socket.emit("join", room.id); // Solicita los mensajes previos de la sala
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        rooms,
        currentRoom,
        sendMessage,
        setCurrentRoom: switchRoom,
        currentUserId,  // Pasamos el currentUserId a los componentes que lo necesiten
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
