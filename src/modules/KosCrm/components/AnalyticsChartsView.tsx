import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { CRMAnalyticsData } from '../types';
import { CHART_COLORS } from '../config';

interface Props {
  data: CRMAnalyticsData;
  onTagClick?: (tag: string) => void;
  onCommunityClick?: (comm: string) => void;
}

export const AnalyticsChartsView: React.FC<Props> = ({
  data,
  onTagClick,
  onCommunityClick,
}) => {
  // Tags data for Bar Chart (Top 8)
  const tagsData = Object.entries(data.tagsCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Communities data for Pie Chart
  const communitiesData = Object.entries(data.communitiesCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Lead Sources data
  const sourcesData = Object.entries(data.leadSourcesCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Tags Distribution */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
          <span>התפלגות תגיות מובילות</span>
          <span className="text-xs text-gray-400 font-normal">לפי כמות</span>
        </h4>
        <div className="h-56 w-full" dir="ltr">
          {tagsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagsData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={85} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} אנשי קשר`, 'כמות']} 
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#6366f1" 
                  radius={[0, 4, 4, 0]} 
                  onClick={(entry: any) => onTagClick?.(entry?.name || entry?.payload?.name)} 
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">אין נתוני תגיות להצגה</div>
          )}
        </div>
      </div>

      {/* Communities Distribution */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
          <span>חלוקה לפי קהילות / קבוצות</span>
          <span className="text-xs text-gray-400 font-normal">פילוח באחוזים</span>
        </h4>
        <div className="h-56 w-full" dir="ltr">
          {communitiesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={communitiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry: any) => onCommunityClick?.(entry?.name || entry?.payload?.name)}
                  className="cursor-pointer"
                >
                  {communitiesData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} אנשי קשר`, 'כמות']}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">אין נתוני קהילות להצגה</div>
          )}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-between">
          <span>מקורות הגעה מובילים</span>
          <span className="text-xs text-gray-400 font-normal">ערוצי שיווק</span>
        </h4>
        <div className="h-56 w-full" dir="ltr">
          {sourcesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcesData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis hide />
                <Tooltip 
                  formatter={(val: any) => [`${val} לידים`, 'כמות']}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">אין נתוני מקורות להצגה</div>
          )}
        </div>
      </div>
    </div>
  );
};
