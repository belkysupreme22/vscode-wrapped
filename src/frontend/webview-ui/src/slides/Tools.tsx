import React from 'react';
import { motion } from 'framer-motion';
import { AggregatedMetrics } from '../types/metrics';
import { formatNumber } from '../utils/formatters';
import { Search, Zap, Wand2, BookOpen } from 'lucide-react';

interface SlideProps {
  metrics: AggregatedMetrics;
  isRoastMode: boolean;
  roast?: string;
}

export default function ToolsSlide({ metrics, isRoastMode, roast }: SlideProps) {
  const tools = [
    { icon: <Zap className="text-yellow-400" />, label: 'IntelliSense', val: metrics.totalIntelliSenseAccepts },
    { icon: <BookOpen className="text-blue-400" />, label: 'Definitions', val: metrics.totalGoToDefinition },
    { icon: <Wand2 className="text-purple-400" />, label: 'Auto-Formats', val: metrics.totalFormatDocument },
    { icon: <Search className="text-lunar-400" />, label: 'Quick Fixes', val: metrics.totalQuickFixes },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl space-y-12"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-lunar-50">Master of the IDE</h2>
        <p className="text-lunar-400">You really squeezed every feature out of VS Code</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ x: i % 2 === 0 ? -20 : 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-lunar-900/30 border border-lunar-800 p-6 rounded-2xl flex items-center gap-4 group hover:bg-lunar-800/20 transition-colors"
          >
            <div className="p-3 bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                {tool.icon}
            </div>
            <div>
                <div className="text-2xl font-mono font-bold text-white">{formatNumber(tool.val)}</div>
                <div className="text-xs uppercase font-bold text-lunar-500 tracking-wider font-sans">{tool.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {isRoastMode && roast && (
        <div className="text-center text-red-400 italic font-medium px-4 py-3 bg-red-900/10 border-x-2 border-red-500/20">
            "{roast}"
        </div>
      )}
    </motion.div>
  );
}
