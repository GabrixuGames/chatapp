
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { MessageCircle } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { sendMessage } = useChat();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    sendMessage(message.trim(), user.id, user.name);
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[80px] resize-none bg-white"
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-10 w-10 rounded-full"
          disabled={!message.trim()}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
}
