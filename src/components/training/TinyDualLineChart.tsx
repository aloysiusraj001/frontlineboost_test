import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TinyDualLineChartProps {
  points: Array<{
    t: number;
    empathy: number;
    compliance: number;
    clarity?: number;
  }>;
}

export function TinyDualLineChart({ points }: TinyDualLineChartProps) {
  const formatTooltipValue = (value: number, name: string) => {
    return [`${Math.round(value)}%`, name];
  };
  
  const formatTooltipLabel = (label: number) => {
    const mins = Math.floor(label / 60);
    const secs = label % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="t" 
            axisLine={false} 
            tickLine={false} 
            tick={false}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={false}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
          />
          <Line 
            type="monotone" 
            dataKey="empathy" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            name="Empathy"
          />
          <Line 
            type="monotone" 
            dataKey="compliance" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            dot={false}
            strokeDasharray="3 3"
            name="Compliance"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-primary rounded"></div>
          <span className="text-muted-foreground">Empathy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-chart-2 rounded" style={{ backgroundImage: 'repeating-linear-gradient(to right, hsl(var(--chart-2)), hsl(var(--chart-2)) 2px, transparent 2px, transparent 4px)' }}></div>
          <span className="text-muted-foreground">Compliance</span>
        </div>
      </div>
    </div>
  );
}