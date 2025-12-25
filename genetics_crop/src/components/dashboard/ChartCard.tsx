import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  type: 'area' | 'bar' | 'pie';
  data: any[];
  dataKey?: string;
  xAxisKey?: string;
  colors?: string[];
}

const defaultColors = [
  'hsl(168, 87%, 42%)',
  'hsl(168, 70%, 55%)',
  'hsl(168, 50%, 65%)',
  'hsl(200, 80%, 50%)',
  'hsl(38, 92%, 50%)',
];

export function ChartCard({ 
  title, 
  description, 
  type, 
  data, 
  dataKey = 'value', 
  xAxisKey = 'name',
  colors = defaultColors 
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {type === 'area' ? (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(168, 15%, 90%)" />
                  <XAxis dataKey={xAxisKey} tick={{ fill: 'hsl(200, 10%, 45%)' }} />
                  <YAxis tick={{ fill: 'hsl(200, 10%, 45%)' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(168, 15%, 90%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={dataKey} 
                    stroke={colors[0]} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : type === 'bar' ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(168, 15%, 90%)" />
                  <XAxis dataKey={xAxisKey} tick={{ fill: 'hsl(200, 10%, 45%)' }} />
                  <YAxis tick={{ fill: 'hsl(200, 10%, 45%)' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(168, 15%, 90%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey={dataKey}
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(168, 15%, 90%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
