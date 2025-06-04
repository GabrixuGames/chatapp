import { useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { ChatMessage } from "@/components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatRoom() {
  const { user } = useAuth();
  const { messages, currentRoom } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Filtrar mensajes para la sala actual
  const roomMessages = messages.filter(
    (message) => message.room === currentRoom?.id
  );
  
  // Hacer scroll hacia abajo cuando los mensajes cambian
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [roomMessages]);
  
  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Select a room to start chatting</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="font-semibold text-lg">{currentRoom.name}</h2>
        <p className="text-sm text-muted-foreground">{currentRoom.description}</p>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {roomMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            roomMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={message.username === user?.username}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
