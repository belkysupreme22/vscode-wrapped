import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { getAchievementIcon } from '../utils/formatters';
import EmptyState from '../components/EmptyState';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function AchievementsSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-10"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lunar-50 mb-2">Hall of Fame</h2>
        <p className="text-lunar-400 italic">Proof of your dedication</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {metrics.achievements.length > 0 ? (
          metrics.achievements.map((achievement, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="flex flex-col items-center gap-3 w-40 p-6 rounded-2xl bg-gradient-to-br from-lunar-900/60 to-black border border-lunar-700/50 shadow-xl"
            >
              <div className="text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {getAchievementIcon(achievement)}
              </div>
              <span className="text-center text-sm font-bold uppercase tracking-wide text-lunar-100">
                {achievement}
              </span>
            </motion.div>
          ))
        ) : (
          <EmptyState message="No achievements found. Your story is just beginning..." />
        )}
      </div>

      {isRoastMode && roast && (
        <div className="bg-lunar-950 p-6 rounded-2xl border-l-4 border-red-500 text-red-200">
          <div className="text-xs uppercase font-black text-red-500 mb-1 tracking-widest">Cruel Reality</div>
          <p className="italic">"{roast}"</p>
        </div>
      )}
    </motion.div>
  );
}
