import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

interface RubricRadarProps {
  data: Array<{
    name: string;
    value: number;
    fullMark: number;
  }>;
  target?: number;
}

export function RubricRadar({ data, target = 80 }: RubricRadarProps) {
  const chartData = data.map(item => ({
    ...item,
    target
  }));
  
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            angle={90}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted))"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Your Score"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}