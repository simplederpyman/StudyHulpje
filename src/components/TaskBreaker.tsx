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
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/40">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-500/20 p-3 rounded-2xl shadow-inner border border-white/40">
          <Sparkles className="w-6 h-6 text-purple-700" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">AI Taak-Breaker</h2>
      </div>

      {steps.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            Heb je een grote opdracht? Laat de AI het opbreken in kleine, behapbare stapjes!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Bijv. Boekverslag schrijven..."
              className="flex-1 px-5 py-3 rounded-2xl bg-white/80 border-2 border-white/60 focus:ring-4 focus:ring-purple-400/30 focus:border-purple-500 outline-none transition-all shadow-sm placeholder:text-slate-400 font-medium text-slate-800"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={!taskInput.trim() || isGenerating}
              className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:transform-none flex items-center justify-center min-w-[4rem]"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end bg-white/40 p-4 rounded-2xl border border-white/50">
            <div>
              <h3 className="font-bold text-slate-800 mb-1">{currentTask}</h3>
              <p className="text-sm text-slate-600 font-medium">{progress}% voltooid</p>
            </div>
            <button 
              onClick={clearTask}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline bg-white/50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Nieuwe taak
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-white/50 rounded-full overflow-hidden border border-white/60 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
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
                      ? "bg-white/40 border-white/30" 
                      : "bg-white/70 border-white/60 hover:bg-white/90 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  )}
                  onClick={() => toggleStep(step.id)}
                >
                  <button className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                  <span className={cn(
                    "text-sm font-medium transition-all",
                    step.completed ? "text-slate-500 line-through" : "text-slate-800"
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

