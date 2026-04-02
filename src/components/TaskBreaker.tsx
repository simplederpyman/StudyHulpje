import React, { useState } from 'react';
import { TaskStep } from '../types';
import { Sparkles, CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLocalStorage } from 'usehooks-ts';

// Simulated AI responses
const SIMULATED_STEPS = [
  "Verzamel alle benodigde materialen en bronnen.",
  "Maak een ruwe opzet of outline.",
  "Werk de eerste helft in detail uit.",
  "Werk de tweede helft in detail uit.",
  "Kijk alles na en verbeter waar nodig."
];

export default function TaskBreaker() {
  const [taskInput, setTaskInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useLocalStorage<TaskStep[]>('studyflow-taskbreaker', []);
  const [currentTask, setCurrentTask] = useLocalStorage<string>('studyflow-currenttask', '');

  const handleGenerate = () => {
    if (!taskInput.trim()) return;
    
    setIsGenerating(true);
    setCurrentTask(taskInput);
    
    // Simulate AI delay
    setTimeout(() => {
      const newSteps = SIMULATED_STEPS.map((text, i) => ({
        id: `step-${Date.now()}-${i}`,
        text,
        completed: false
      }));
      setSteps(newSteps);
      setIsGenerating(false);
      setTaskInput('');
    }, 1500);
  };

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, completed: !step.completed } : step
    ));
  };

  const clearTask = () => {
    setSteps([]);
    setCurrentTask('');
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 dark:bg-purple-500/30 p-3 rounded-2xl shadow-inner border border-white/40 dark:border-white/10">
          <Sparkles className="w-6 h-6 text-purple-700 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-500">AI Taak-Breaker</h2>
      </div>

      {steps.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors duration-500">
            Heb je een grote opdracht? Laat de AI het opbreken in kleine, behapbare stapjes!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Bijv. Boekverslag schrijven..."
              className="flex-1 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/30 border-2 border-white/60 dark:border-white/10 focus:ring-4 focus:ring-purple-400/30 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-white"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={!taskInput.trim() || isGenerating}
              className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-5 py-3 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:transform-none flex items-center justify-center min-w-[4rem]"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/5 transition-colors duration-500">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-1 transition-colors duration-500">{currentTask}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium transition-colors duration-500">{progress}% voltooid</p>
            </div>
            <button 
              onClick={clearTask}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline bg-white/50 dark:bg-black/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Nieuwe taak
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-white/50 dark:bg-black/30 rounded-full overflow-hidden border border-white/60 dark:border-white/10 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-2xl transition-all cursor-pointer border",
                    step.completed 
                      ? "bg-white/40 dark:bg-white/5 border-white/30 dark:border-white/5" 
                      : "bg-white/70 dark:bg-black/40 border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-black/60 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  )}
                  onClick={() => toggleStep(step.id)}
                >
                  <button className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                  <span className={cn(
                    "text-sm font-medium transition-all",
                    step.completed ? "text-slate-500 dark:text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"
                  )}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

