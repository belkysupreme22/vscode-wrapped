import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { formatNumber, formatTime } from '../utils/formatters';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function TimeSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-lunar-400 uppercase tracking-[0.2em] font-bold text-sm">Chronicles of Code</h2>
        <div className="flex flex-col items-center">
            <motion.span 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-8xl md:text-9xl font-mono font-black text-lunar-50"
            >
                {metrics.daysOpened}
            </motion.span>
            <span className="text-2xl text-lunar-200 font-bold -mt-2">Days of Activity</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-lunar-900/30 border border-lunar-800 p-6 rounded-2xl">
            <div className="text-3xl font-mono font-bold text-lunar-100">{formatTime(metrics.totalCodingTimeMinutes)}</div>
            <div className="text-lunar-400 text-xs uppercase tracking-wider font-bold mt-1">Total Coding Time</div>
        </div>
        <div className="bg-lunar-900/30 border border-lunar-800 p-6 rounded-2xl">
            <div className="text-3xl font-mono font-bold text-lunar-100">{metrics.streak}</div>
            <div className="text-lunar-400 text-xs uppercase tracking-wider font-bold mt-1">Longest Streak</div>
        </div>
      </div>

      {isRoastMode && roast && (
        <div className="text-center text-red-400 italic font-medium animate-pulse">
            {roast}
        </div>
      )}
    </motion.div>
  );
}
