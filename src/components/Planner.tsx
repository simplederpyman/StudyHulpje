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
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Weekplanner</h2>
          <p className="text-sm text-slate-500">Klik op een vak en daarna op een dag om in te plannen.</p>
        </div>
      </div>

      {/* Smart Tip */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex items-center gap-3 text-amber-700 text-sm">
        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="font-medium">{tip}</p>
      </div>

      {/* Subjects Palette */}
      <div className="flex flex-wrap gap-2 mb-6">
        {DEFAULT_SUBJECTS.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(selectedSubject?.id === subject.id ? null : subject)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
              subject.color,
              "text-white shadow-sm hover:shadow-md",
              selectedSubject?.id === subject.id ? "ring-2 ring-offset-2 ring-slate-800 scale-105" : "opacity-90 hover:opacity-100"
            )}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {DAYS.map(day => {
          const daySubjects = (plan[day] || []).map(id => DEFAULT_SUBJECTS.find(s => s.id === id)).filter(Boolean) as Subject[];
          
          return (
            <div 
              key={day}
              onClick={() => selectedSubject && toggleSubjectForDay(day, selectedSubject.id)}
              className={cn(
                "min-h-[120px] rounded-2xl border-2 p-2 transition-colors flex flex-col gap-1.5",
                selectedSubject ? "cursor-pointer hover:border-slate-300 border-dashed border-slate-200" : "border-slate-100 bg-slate-50/50"
              )}
            >
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                      "text-xs font-medium text-white px-2 py-1.5 rounded-md flex justify-between items-center group",
                      subject.color
                    )}
                  >
                    <span className="truncate">{subject.name.substring(0, 3)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubjectForDay(day, subject.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {selectedSubject && !daySubjects.find(s => s.id === selectedSubject.id) && (
                <div className="mt-auto flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
