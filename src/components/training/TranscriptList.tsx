import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TranscriptMessage {
  who: 'you' | 'persona' | 'coach';
  text: string;
  at: string;
  bookmarked?: boolean;
}

interface TranscriptListProps {
  messages: TranscriptMessage[];
}

export function TranscriptList({ messages }: TranscriptListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  const getMessageStyles = (who: string) => {
    switch (who) {
      case 'you':
        return {
          bubble: 'bg-primary text-primary-foreground ml-auto',
          container: 'justify-end',
          avatar: 'bg-primary text-primary-foreground',
          avatarText: 'You'
        };
      case 'persona':
        return {
          bubble: 'bg-muted',
          container: 'justify-start',
          avatar: 'bg-secondary text-secondary-foreground',
          avatarText: 'AI'
        };
      case 'coach':
        return {
          bubble: 'bg-accent text-accent-foreground',
          container: 'justify-center',
          avatar: 'bg-accent text-accent-foreground',
          avatarText: 'Coach'
        };
      default:
        return {
          bubble: 'bg-muted',
          container: 'justify-start',
          avatar: 'bg-muted text-muted-foreground',
          avatarText: '?'
        };
    }
  };

  if (messages.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        <p>Conversation will appear here once you start the session...</p>
      </div>
    );
  }

  return (
    <div className="h-96 pr-4 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((message, index) => {
          const styles = getMessageStyles(message.who);
          
          return (
            <div key={index} className={cn("flex items-start gap-3", styles.container)}>
              {message.who !== 'you' && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  styles.avatar
                )}>
                  {styles.avatarText}
                </div>
              )}
              
              <div className={cn(
                "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                styles.bubble
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs opacity-70">
                    {formatTime(message.at)}
                  </span>
                  {message.who === 'coach' && (
                    <Badge variant="outline" className="text-xs">
                      Coach Tip
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              
              {message.who === 'you' && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  styles.avatar
                )}>
                  {styles.avatarText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}