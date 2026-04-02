import React, { useState, useEffect } from 'react';
import { DailyCheckIn as DailyCheckInType } from '../types';
import { useLocalStorage } from 'usehooks-ts';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const MOODS = [
  { value: 0, emoji: '😫', label: 'Zwaar' },
  { value: 1, emoji: '😐', label: 'Mwah' },
  { value: 2, emoji: '😊', label: 'Goed' },
  { value: 3, emoji: '💪', label: 'Geweldig' },
];

export default function DailyCheckIn() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useLocalStorage<DailyCheckInType>(`studyflow-checkin-${todayStr}`, {
    date: todayStr,
    priorities: ['', '', ''],
    mood: -1,
  });

  const [isEvening, setIsEvening] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setIsEvening(hour >= 16); // After 4 PM is considered evening for the check-in
  }, []);

  const updatePriority = (index: number, value: string) => {
    const newPriorities = [...checkIn.priorities];
    newPriorities[index] = value;
    setCheckIn({ ...checkIn, priorities: newPriorities });
  };

  const updateMood = (value: number) => {
    setCheckIn({ ...checkIn, mood: value });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Dagelijkse Check-in</h2>
        <div className="flex bg-slate-100 p-1 rounded-full">
          <button 
            onClick={() => setIsEvening(false)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2", !isEvening ? "bg-white shadow-sm text-slate-800" : "text-slate-500")}
          >
            <Sun className="w-4 h-4" /> Ochtend
          </button>
          <button 
            onClick={() => setIsEvening(true)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2", isEvening ? "bg-white shadow-sm text-slate-800" : "text-slate-500")}
          >
            <Moon className="w-4 h-4" /> Avond
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Morning Section */}
        <div className={cn("transition-opacity duration-300", isEvening ? "opacity-50 pointer-events-none" : "opacity-100")}>
          <h3 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
            Mijn 3 prioriteiten vandaag
          </h3>
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={checkIn.priorities[index]}
                  onChange={(e) => updatePriority(index, e.target.value)}
                  placeholder={`Prioriteit ${index + 1}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all text-sm"
                  tabIndex={isEvening ? -1 : 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Evening Section */}
        <div className={cn("transition-opacity duration-300", !isEvening ? "opacity-50 pointer-events-none" : "opacity-100")}>
          <h3 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
            Hoe ging het vandaag?
          </h3>
          
          <div className="bg-slate-50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => updateMood(mood.value)}
                  className={cn(
                    "text-4xl transition-all hover:scale-110",
                    checkIn.mood === mood.value ? "scale-125 drop-shadow-md" : "opacity-50 grayscale"
                  )}
                  tabIndex={!isEvening ? -1 : 0}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-400 px-2 mt-4">
              <span>Zwaar</span>
              <span>Geweldig</span>
            </div>
          </div>

          {checkIn.mood !== -1 && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-medium text-slate-600 mt-4"
            >
              Opgeslagen! Goed gedaan vandaag. 🎉
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
