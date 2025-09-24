import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Persona } from '@/data/data';
import { TrendingUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import trainingAvatar from '@/assets/training-avatar.mp4';

interface PersonaStageProps {
  persona: Persona;
  mood: string;
  intensity: number;
  onEscalate: () => void;
  onReset: () => void;
}

export function PersonaStage({
  persona,
  mood,
  intensity,
  onEscalate,
  onReset,
}: PersonaStageProps) {
  const getMoodColor = (mood: string, intensity: number) => {
    const baseColors = {
      'Angry': intensity > 2 ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      'Upset': intensity > 2 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30' : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
      'Anxious': intensity > 2 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30' : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      'Confused': intensity > 2 ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    };
    return baseColors[mood as keyof typeof baseColors] || 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  };

  return (
    <Card className="rounded-2xl border-slate-800/50 dark:border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={persona.avatar} />
                <AvatarFallback>{persona.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{persona.name}</p>
                <p className="text-xs text-muted-foreground">{persona.role}</p>
              </div>
            </div>
            <Badge className={cn('border', getMoodColor(mood, intensity))}>
              {mood}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEscalate}
              className="border-red-500/20 hover:border-red-500/40 text-red-700 dark:text-red-400"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Escalate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              className="border-slate-500/20 hover:border-slate-500/40"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Area */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900/50">
          <div style={{ aspectRatio: '16/10.8' }}>
            <video
              src={trainingAvatar}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}