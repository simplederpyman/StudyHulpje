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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-purple-100 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">AI Taak-Breaker</h2>
      </div>

      {steps.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Heb je een grote opdracht? Laat de AI het opbreken in kleine, behapbare stapjes!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Bijv. Boekverslag schrijven..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={!taskInput.trim() || isGenerating}
              className="bg-slate-900 text-white px-4 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[4rem]"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-medium text-slate-800 mb-1">{currentTask}</h3>
              <p className="text-sm text-slate-500">{progress}% voltooid</p>
            </div>
            <button 
              onClick={clearTask}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 underline"
            >
              Nieuwe taak
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500 rounded-full"
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
                    "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer",
                    step.completed ? "bg-slate-50" : "hover:bg-slate-50"
                  )}
                  onClick={() => toggleStep(step.id)}
                >
                  <button className="mt-0.5 shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <span className={cn(
                    "text-sm transition-all",
                    step.completed ? "text-slate-400 line-through" : "text-slate-700"
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
