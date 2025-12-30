import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { getDayName, formatTime } from '../utils/formatters';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * ProductivitySlide handles the visualization of coding activity over time.
 * It dynamically switches between three distinct grid layouts (Weekly, Monthly, Yearly)
 * based on the quantified data available in the metrics payload.
 */
export default function ProductivitySlide({ metrics, isRoastMode, roast, timeRange = 'weekly' }: SlideProps) {
  const maxDayVal = Math.max(...Object.values(metrics.activityByDay));
  const maxHistoryVal = Math.max(...metrics.dailyHistory.map(h => h.count), 1);

  /**
   * Renders a GitHub-style activity grid (52 weeks x 7 days).
   * It transforms the flat dailyHistory array into 2D columns for CSS Grid/Flex layout.
   */
  const renderYearlyGrid = () => {
    const columns: { date: string, count: number }[][] = [];
    let currentColumn: { date: string, count: number }[] = [];
    
    metrics.dailyHistory.forEach((day, i) => {
        currentColumn.push(day);
        if (currentColumn.length === 7 || i === metrics.dailyHistory.length - 1) {
            columns.push(currentColumn);
            currentColumn = [];
        }
    });

    const monthLabels: { name: string, colIndex: number }[] = [];
    let lastMonth = -1;
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    columns.forEach((col, i) => {
        const firstDay = new Date(col[0].date);
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
            // Check if this is a starting December that would clash with January
            const isStartingDec = i === 0 && month === 11;
            const janIdx = columns.findIndex((c, idx) => idx > i && idx < i + 4 && new Date(c[0].date).getMonth() === 0);
            
            if (isStartingDec && janIdx !== -1) {
                // Skip this Dec in favor of the upcoming Jan
                return; 
            }

            // Ensure at least 3 columns width breathing room between labels
            const lastLabelsIdx = monthLabels.length > 0 ? monthLabels[monthLabels.length - 1].colIndex : -10;
            if (i - lastLabelsIdx > 3) {
                // Prevent showing Dec twice if it already appeared at the start (edge case protection)
                if (month === 11 && monthLabels.some(l => l.name === 'Dec')) {
                    return;
                }

                monthLabels.push({
                    name: MONTH_NAMES[month],
                    colIndex: i
                });
                lastMonth = month;
            }
        }
    });

    return (
        <div className="flex flex-col items-center">
            {/* Month Labels Row */}
            <div className="flex w-full overflow-hidden mb-2 relative h-4">
                {monthLabels.map((lbl, i) => (
                    <span 
                        key={i} 
                        className="text-[9px] font-bold text-lunar-600 absolute whitespace-nowrap"
                        style={{ left: `${lbl.colIndex * 12}px` }}
                    >
                        {lbl.name}
                    </span>
                ))}
            </div>
            
            <div 
                className="flex gap-1 overflow-x-auto pb-4 w-full justify-start select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {columns.map((col, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {col.map((day) => {
                            const intensity = maxHistoryVal > 0 ? (day.count / maxHistoryVal) : 0;
                            return (
                                <div 
                                    key={day.date}
                                    className="w-2 h-2 rounded-[1px] transition-colors"
                                    style={{ 
                                        backgroundColor: day.count === 0 ? 'rgba(255, 255, 255, 0.05)' : `rgba(91, 116, 101, ${0.1 + intensity * 0.9})`,
                                        boxShadow: day.count === maxHistoryVal && day.count > 0 ? '0 0 4px rgba(91, 116, 101, 0.4)' : 'none'
                                    }}
                                    title={`${day.date}: ${day.count} activities`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderMonthlyGrid = () => {
    return (
        <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto py-6">
            {['S','M','T','W','T','F','S'].map(d => (
                <span key={d} className="text-[10px] font-bold text-lunar-600 text-center">{d}</span>
            ))}
            {metrics.dailyHistory.map((day) => {
                const intensity = day.count / maxHistoryVal;
                const isPeak = day.count === maxHistoryVal && day.count > 0;
                return (
                    <motion.div 
                        key={day.date}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                            "aspect-square rounded-lg border transition-all",
                            isPeak ? "border-white/20 shadow-lg" : "border-lunar-800/20"
                        )}
                        style={{ 
                            backgroundColor: day.count === 0 ? 'rgba(255, 255, 255, 0.05)' : `rgba(91, 116, 101, ${0.1 + intensity * 0.9})`
                        }}
                    />
                );
            })}
        </div>
    );
  };

  const renderWeeklyGrid = () => {
    return (
      <div className="flex justify-center items-center gap-3 py-10">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const val = metrics.activityByDay[day] || 0;
          const intensity = maxDayVal > 0 ? (val / maxDayVal) : 0;
          const isMostProductive = day === metrics.mostProductiveDay;
          
          return (
            <div key={day} className="flex flex-col items-center gap-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: day * 0.05, type: "spring" }}
                className={cn(
                  "w-12 h-12 rounded-md transition-all duration-500 relative",
                  isMostProductive 
                    ? "bg-lunar-500 shadow-[0_0_20px_rgba(91,116,101,0.6)] ring-2 ring-white/20" 
                    : "bg-lunar-500/20"
                )}
                style={!isMostProductive ? { 
                  backgroundColor: val === 0 ? 'rgba(255, 255, 255, 0.05)' : `rgba(91, 116, 101, ${0.1 + intensity * 0.7})` 
                } : {}}
              >
                {isMostProductive && (
                  <motion.div 
                    layoutId="peak-highlight"
                    className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                )}
              </motion.div>
              <span className={cn(
                "text-[10px] font-bold tracking-tighter transition-colors",
                isMostProductive ? "text-lunar-100" : "text-lunar-600"
              )}>
                {getDayName(day).substring(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lunar-50">
            {timeRange === 'yearly' ? 'A Year of Progress' : timeRange === 'monthly' ? 'Monthly Momentum' : 'Your Weekly Rhythm'}
        </h2>
        <p className="text-lunar-400">
            {timeRange === 'yearly' ? `${metrics.daysOpened} days of impact` : `Most productive on ${getDayName(metrics.mostProductiveDay)}s`}
        </p>
      </div>

      <div className="bg-lunar-900/40 p-6 rounded-[2rem] border border-lunar-800">
          {timeRange === 'yearly' ? renderYearlyGrid() : timeRange === 'monthly' ? renderMonthlyGrid() : renderWeeklyGrid()}
          
          <div className="mt-4 flex items-center justify-center w-full gap-2 text-lunar-600">
              <span className="text-[10px]">Less</span>
              <div className="flex gap-1">
                  {[0.05, 0.3, 0.5, 0.75, 1].map((op, i) => (
                      <div key={i} className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: i === 0 ? 'rgba(255,255,255,0.05)' : `rgba(91, 116, 101, ${op})` }} />
                  ))}
              </div>
              <span className="text-[10px]">More</span>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-lunar-900/40 p-4 rounded-2xl border border-lunar-800 flex flex-col justify-center items-center text-center">
            <span className="text-lunar-400 uppercase tracking-widest font-bold text-[10px] mb-1">Late Night Coding</span>
            <span className="text-lunar-100 font-mono font-bold text-xl">{formatTime(metrics.totalLateNightMinutes)}</span>
        </div>
        <div className="bg-lunar-900/40 p-4 rounded-2xl border border-lunar-800 flex flex-col justify-center items-center text-center">
            <span className="text-lunar-400 uppercase tracking-widest font-bold text-[10px] mb-1">Weekend Coding</span>
            <span className="text-lunar-100 font-mono font-bold text-xl">{metrics.weekendCodingPercentage}%</span>
        </div>
      </div>

      {isRoastMode && roast && (
        <p className="text-center text-red-400 italic font-medium px-8">"{roast}"</p>
      )}
    </motion.div>
  );
}
