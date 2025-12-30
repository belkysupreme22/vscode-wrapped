import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { formatNumber, formatHour } from '../utils/formatters';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function BentoSummarySlide({ metrics, isRoastMode, roast }: SlideProps) {
  const items = [
    { label: 'Lines Added', value: formatNumber(metrics.totalLinesAdded), color: 'text-lunar-100', size: 'col-span-1 row-span-1' },
    { label: 'Debug Sessions', value: metrics.totalDebugSessions, color: 'text-blue-300', size: 'col-span-1 row-span-1' },
    { label: 'Files Created', value: metrics.totalFilesCreated, color: 'text-purple-300', size: 'col-span-1 row-span-1' },
    { label: 'Edits', value: formatNumber(metrics.totalEdits), color: 'text-orange-300', size: 'col-span-1 row-span-1' },
    { label: 'Most Productive Hour', value: formatHour(metrics.mostProductiveHour), color: 'text-lunar-200', size: 'col-span-1 row-span-1' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">The Big Picture</h2>
        <p className="text-lunar-400 font-medium">Your year condensed into blocks</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-4 h-[500px]">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              ${item.size} p-6 rounded-3xl bg-lunar-900/40 border border-lunar-800 
              flex flex-col justify-between hover:border-lunar-500 transition-all group
              backdrop-blur-md
            `}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-lunar-500 group-hover:text-lunar-300 transition-colors">
              {item.label}
            </span>
            <span className={`text-4xl md:text-5xl font-mono font-black ${item.color} tracking-tighter`}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>

      {isRoastMode && roast && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 font-medium text-center italic">
          "{roast}"
        </div>
      )}
    </motion.div>
  );
}
