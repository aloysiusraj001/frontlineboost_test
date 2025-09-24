import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VoiceConversationProps {
  messages: ConversationMessage[];
  personaName: string;
}

export function VoiceConversation({ messages, personaName }: VoiceConversationProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  if (messages.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground bg-card rounded-lg border">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Ready to Start Training</p>
          <p className="text-sm">Your voice conversation with {personaName} will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96 bg-card rounded-lg border">
      <div className="p-4 space-y-4">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          
          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              )}
              
              <div className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-lg",
                isUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {isUser ? 'You' : personaName}
                  </Badge>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              
              {isUser && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}