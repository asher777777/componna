import React from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Trash2, Sparkles, BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { CustomCrmChart, Contact } from '../types';
import { computeChartSeries } from '../services/customChartsService';
import { CHART_COLORS } from '../config';

interface Props {
  chart: CustomCrmChart;
  contacts: Contact[];
  onDelete: (id: string) => void;
}

export const CustomChartCard: React.FC<Props> = ({ chart, contacts, onDelete }) => {
  const seriesData = computeChartSeries(chart, contacts);

  const renderVisual = () => {
    if (seriesData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          אין נתונים זמינים לפילוח זה
        </div>
      );
    }

    if (chart.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={seriesData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {seriesData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(val: any) => [chart.metric === 'sum' ? `₪${val.toLocaleString()}` : `${val} רשומות`, chart.metric === 'sum' ? 'סכום' : 'כמות']}
              contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={seriesData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis hide />
            <Tooltip 
              formatter={(val: any) => [chart.metric === 'sum' ? `₪${val.toLocaleString()}` : `${val} רשומות`, chart.metric === 'sum' ? 'סכום' : 'כמות']}
              contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
            />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={seriesData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis hide />
            <Tooltip 
              formatter={(val: any) => [chart.metric === 'sum' ? `₪${val.toLocaleString()}` : `${val} רשומות`, chart.metric === 'sum' ? 'סכום' : 'כמות']}
              contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
            />
            <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar Chart
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={seriesData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip 
            formatter={(val: any) => [chart.metric === 'sum' ? `₪${val.toLocaleString()}` : `${val} רשומות`, chart.metric === 'sum' ? 'סכום' : 'כמות']}
            contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
          />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5 mb-2">
        <div className="flex items-center gap-2">
          {chart.createdBy === 'ai' ? (
            <span className="p-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="p-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <BarChart2 className="w-3.5 h-3.5" />
            </span>
          )}
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {chart.title}
            </h4>
            {chart.description && (
              <p className="text-[10px] text-gray-400 line-clamp-1">{chart.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(chart.id)}
          className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          title="מחק גרף זה"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-56 w-full" dir="ltr">
        {renderVisual()}
      </div>
    </div>
  );
};
