import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { Bug, Terminal, AlertCircle } from 'lucide-react';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function DebuggingSlide({ metrics, isRoastMode, roast }: SlideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-red-100 flex items-center justify-center gap-3">
          <Bug className="text-red-500 animate-bounce" />
          The Debugging Grind
        </h2>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-red-950/40 to-transparent p-6 rounded-2xl border-l-4 border-red-500 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <AlertCircle className="text-red-400" />
                <span className="text-lunar-100 font-bold text-lg">Failed Builds</span>
            </div>
            <span className="text-4xl font-mono font-black text-red-400">{metrics.totalFailedBuilds}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-lunar-900/40 p-6 rounded-2xl border border-lunar-800 text-center">
                <div className="text-3xl font-mono font-bold text-white mb-1">{metrics.totalDebugSessions}</div>
                <div className="text-xs uppercase font-bold text-lunar-500">Debug Sessions</div>
            </div>
            <div className="bg-lunar-900/40 p-6 rounded-2xl border border-lunar-800 text-center">
                <div className="text-3xl font-mono font-bold text-white mb-1">{metrics.totalTerminalLaunches}</div>
                <div className="text-xs uppercase font-bold text-lunar-500">Terminal Hits</div>
            </div>
        </div>
      </div>

      {isRoastMode && roast && (
        <p className="text-center text-red-400/80 italic font-medium p-6 bg-red-950/20 rounded-3xl border border-red-500/10">
            "{roast}"
        </p>
      )}
    </motion.div>
  );
}
