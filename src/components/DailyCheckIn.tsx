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
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Dagelijkse Check-in</h2>
        <div className="flex bg-white/50 dark:bg-black/30 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-white/60 dark:border-white/10 transition-colors duration-500">
          <button 
            onClick={() => setIsEvening(false)}
            className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2", !isEvening ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
          >
            <Sun className="w-4 h-4" /> Ochtend
          </button>
          <button 
            onClick={() => setIsEvening(true)}
            className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2", isEvening ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
          >
            <Moon className="w-4 h-4" /> Avond
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Morning Section */}
        <div className={cn("transition-all duration-500", isEvening ? "opacity-40 pointer-events-none scale-95" : "opacity-100 scale-100")}>
          <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2 transition-colors duration-500">
            Mijn 3 prioriteiten vandaag
          </h3>
          <div className="space-y-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0 border border-white/40 dark:border-white/10 shadow-inner">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={checkIn.priorities[index]}
                  onChange={(e) => updatePriority(index, e.target.value)}
                  placeholder={`Prioriteit ${index + 1}...`}
                  className="flex-1 px-5 py-3 rounded-2xl bg-white/80 dark:bg-black/30 border-2 border-white/60 dark:border-white/10 focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                  tabIndex={isEvening ? -1 : 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Evening Section */}
        <div className={cn("transition-all duration-500", !isEvening ? "opacity-40 pointer-events-none scale-95" : "opacity-100 scale-100")}>
          <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2 transition-colors duration-500">
            Hoe ging het vandaag?
          </h3>
          
          <div className="bg-white/50 dark:bg-black/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-sm transition-colors duration-500">
            <div className="flex justify-between items-center mb-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => updateMood(mood.value)}
                  className={cn(
                    "text-5xl transition-all hover:scale-110 hover:-translate-y-1",
                    checkIn.mood === mood.value ? "scale-125 drop-shadow-xl" : "opacity-50 grayscale hover:grayscale-0"
                  )}
                  tabIndex={!isEvening ? -1 : 0}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400 px-2 mt-6 transition-colors duration-500">
              <span>Zwaar</span>
              <span>Geweldig</span>
            </div>
          </div>

          {checkIn.mood !== -1 && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-bold text-green-700 dark:text-green-400 mt-6 bg-green-500/20 dark:bg-green-500/30 py-2 px-4 rounded-full inline-block mx-auto border border-white/40 dark:border-white/10 shadow-sm"
            >
              Opgeslagen! Goed gedaan vandaag. 🎉
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}

