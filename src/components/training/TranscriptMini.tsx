import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptMiniProps {
  lines: Array<{
    who: 'you' | 'persona' | 'coach';
    text: string;
    at: string;
    bookmarked?: boolean;
  }>;
}

export function TranscriptMini({ lines }: TranscriptMiniProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'you':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'persona':
        return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'coach':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  const truncateText = (text: string, maxLength = 60) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };
  
  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {lines.map((line, idx) => (
        <div key={idx} className="flex items-start gap-3 text-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge 
              variant="outline" 
              className={cn("text-xs px-1.5 py-0.5 shrink-0", getRoleColor(line.who))}
            >
              {line.who === 'you' ? 'You' : line.who === 'persona' ? 'Persona' : 'Coach'}
            </Badge>
            <span className="text-xs text-muted-foreground shrink-0 font-mono">
              {line.at}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm flex-1 min-w-0">
              {truncateText(line.text)}
            </span>
            {line.bookmarked && (
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-yellow-600 dark:text-yellow-400">
                <Bookmark className="w-3 h-3 fill-current" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}