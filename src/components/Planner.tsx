import React, { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { DayPlan, DEFAULT_SUBJECTS, Subject } from '../types';
import { Lightbulb, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

const TIPS = [
  "Tip: Plan moeilijke vakken in de ochtend!",
  "Tip: Neem elke 45 minuten een korte pauze.",
  "Tip: Wissel alfa en bèta vakken af voor betere focus.",
  "Tip: Herhaling is de sleutel tot succes.",
  "Tip: Drink genoeg water tijdens het studeren! 💧"
];

export default function Planner() {
  const [plan, setPlan] = useLocalStorage<DayPlan>('studyflow-planner', {});
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  const toggleSubjectForDay = (day: string, subjectId: string) => {
    setPlan(prev => {
      const daySubjects = prev[day] || [];
      if (daySubjects.includes(subjectId)) {
        return { ...prev, [day]: daySubjects.filter(id => id !== subjectId) };
      } else {
        return { ...prev, [day]: [...daySubjects, subjectId] };
      }
    });
  };

  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Weekplanner</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors duration-500">Klik op een vak en daarna op een dag om in te plannen.</p>
        </div>
      </div>

      {/* Smart Tip */}
      <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3 text-slate-700 dark:text-slate-200 text-sm shadow-sm transition-colors duration-500">
        <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-xl shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <p className="font-medium">{tip}</p>
      </div>

      {/* Subjects Palette */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/40 dark:bg-black/20 p-3 rounded-2xl border border-white/50 dark:border-white/5 transition-colors duration-500">
        {DEFAULT_SUBJECTS.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(selectedSubject?.id === subject.id ? null : subject)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5",
              subject.color,
              "text-white shadow-sm hover:shadow-md",
              selectedSubject?.id === subject.id ? "ring-4 ring-offset-2 ring-white/50 dark:ring-offset-black/50 scale-105" : "opacity-90 hover:opacity-100 hover:-translate-y-0.5"
            )}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {DAYS.map(day => {
          const daySubjects = (plan[day] || []).map(id => DEFAULT_SUBJECTS.find(s => s.id === id)).filter(Boolean) as Subject[];
          
          return (
            <div 
              key={day}
              onClick={() => selectedSubject && toggleSubjectForDay(day, selectedSubject.id)}
              className={cn(
                "min-h-[140px] rounded-2xl border-2 p-2 transition-all flex flex-col gap-1.5",
                selectedSubject 
                  ? "cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 border-dashed border-slate-300 dark:border-slate-600 bg-white/30 dark:bg-white/5" 
                  : "border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/30 shadow-sm"
              )}
            >
              <div className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 bg-white/50 dark:bg-black/40 py-1 rounded-lg transition-colors duration-500">
                {day}
              </div>
              
              <AnimatePresence>
                {daySubjects.map(subject => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={cn(
                      "text-xs font-bold text-white px-2 py-2 rounded-xl flex justify-between items-center group shadow-sm",
                      subject.color
                    )}
                  >
                    <span className="truncate">{subject.name.substring(0, 3)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubjectForDay(day, subject.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {selectedSubject && !daySubjects.find(s => s.id === selectedSubject.id) && (
                <div className="mt-auto flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Plus className="w-5 h-5 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/50 rounded-full p-0.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
