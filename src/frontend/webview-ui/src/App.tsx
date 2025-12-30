import { useState, useMemo, useEffect } from 'react';
import { useVsCodeMessages, useVsCodeApi } from './hooks/useVsCodeApi';
import { AggregatedMetrics } from './types/metrics';
import { generateRoasts } from './utils/roasts';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import SlideContainer from './components/SlideContainer';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRoastMode, setIsRoastMode] = useState(false);
  const vscode = useVsCodeApi();

  useEffect(() => {
    vscode.postMessage({ command: 'ready' });
  }, [vscode]);

  useVsCodeMessages<AggregatedMetrics>('updateMetrics', (data) => {
    setMetrics(data);
  });

  const roasts = useMemo(() => metrics ? generateRoasts(metrics) : {}, [metrics]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen text-lunar-300 animate-pulse font-mono">
        Aggregating your legend...
      </div>
    );
  }

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, 10));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="relative min-h-screen p-6 md:p-12 overflow-y-auto selection:bg-lunar-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lunar-800/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lunar-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Bar */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button 
          onClick={() => setIsRoastMode(!isRoastMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
            isRoastMode 
              ? "bg-red-500/20 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              : "bg-lunar-900/40 border-lunar-800 text-lunar-400 hover:border-lunar-600"
          )}
        >
          <Flame size={18} className={isRoastMode ? "animate-bounce" : ""} />
          <span className="text-sm font-semibold uppercase tracking-wider">Roast Mode</span>
        </button>
      </div>

      {/* Slide Content Area */}
      <main className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] w-full">
        <SlideContainer 
            metrics={metrics}
            activeSlide={currentSlide}
            isRoastMode={isRoastMode}
            roasts={roasts}
            timeRange={(metrics as any).timeRange}
        />
      </main>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-8 flex items-center justify-between bg-gradient-to-t from-[var(--vscode-editor-background)] to-transparent pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 rounded-full bg-lunar-900/60 border border-lunar-800 text-lunar-200 hover:border-lunar-500 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            disabled={currentSlide === 10}
            className="p-3 rounded-full bg-lunar-500 text-white shadow-lg shadow-lunar-500/20 hover:bg-lunar-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="text-lunar-500 font-mono text-sm tracking-widest uppercase">
          {currentSlide + 1} / 11
        </div>
      </div>
    </div>
  );
}
