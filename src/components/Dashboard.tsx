import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, Timer, Calendar, Moon, Sun, Leaf, Music as MusicIcon } from 'lucide-react';
import Pomodoro from './Pomodoro';
import Planner from './Planner';
import TaskBreaker from './TaskBreaker';
import DailyCheckIn from './DailyCheckIn';
import Music from './Music';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const TABS = [
  { 
    id: 'focus', 
    label: 'Focus', 
    icon: Timer, 
    bg: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2532&auto=format&fit=crop' // Forest
  },
  { 
    id: 'plan', 
    label: 'Plan', 
    icon: Calendar, 
    bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2532&auto=format&fit=crop' // Mountains
  },
  {
    id: 'music',
    label: 'Muziek',
    icon: MusicIcon,
    bg: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2532&auto=format&fit=crop' // Rain on window / cozy nature
  },
  { 
    id: 'reflect', 
    label: 'Reflect', 
    icon: Moon, 
    bg: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2532&auto=format&fit=crop' // Sunset
  }
];

export default function Dashboard({ profile, setProfile, theme, setTheme }: Props) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleLogout = () => {
    setProfile({ ...profile, onboarded: false });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const activeBg = TABS.find(t => t.id === activeTab)?.bg;

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{ backgroundImage: `url(${activeBg})` }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-900/60 backdrop-blur-[2px] transition-colors duration-1000"></div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-y-auto pb-32">
        <div className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1 flex flex-col">
          
          {/* Header */}
          <header className="flex items-center justify-between bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl shadow-lg border border-white/40 dark:border-white/10 mb-8 transition-colors duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 dark:bg-green-500/30 p-2 rounded-2xl">
                <Leaf className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                  StudyFlow
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm capitalize font-medium">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block bg-white/50 dark:bg-black/30 px-4 py-2 rounded-full border border-white/20 dark:border-white/5">
                Hoi, {profile.name}!
              </span>
              <button 
                onClick={toggleTheme}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/20 bg-white/40 dark:bg-black/30 rounded-full transition-all shadow-sm border border-white/20 dark:border-white/5"
                title="Wissel Thema"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/20 bg-white/40 dark:bg-black/30 rounded-full transition-all shadow-sm border border-white/20 dark:border-white/5"
                title="Instellingen / Uitloggen"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Content with AnimatePresence for tab switching */}
          <main className="flex-1 relative grid grid-cols-1 grid-rows-1 items-start">
            <AnimatePresence>
              {activeTab === 'focus' && (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-start-1 row-start-1 max-w-2xl mx-auto w-full"
                >
                  <Pomodoro />
                </motion.div>
              )}

              {activeTab === 'plan' && (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-start-1 row-start-1 grid grid-cols-1 lg:grid-cols-2 gap-6 w-full"
                >
                  <Planner />
                  <TaskBreaker />
                </motion.div>
              )}

              {activeTab === 'reflect' && (
                <motion.div
                  key="reflect"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-start-1 row-start-1 max-w-3xl mx-auto w-full"
                >
                  <DailyCheckIn />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Music tab is always mounted to keep Spotify playing */}
            <motion.div
              initial={false}
              animate={{ 
                opacity: activeTab === 'music' ? 1 : 0, 
                y: activeTab === 'music' ? 0 : 20,
                pointerEvents: activeTab === 'music' ? 'auto' : 'none',
                visibility: activeTab === 'music' ? 'visible' : 'hidden',
                zIndex: activeTab === 'music' ? 10 : -1
              }}
              transition={{ duration: 0.3 }}
              className="col-start-1 row-start-1 max-w-3xl mx-auto w-full"
            >
              <Music />
            </motion.div>
          </main>
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-3xl p-2 rounded-full shadow-2xl border border-white/50 dark:border-white/10 flex items-center gap-2 transition-colors duration-500">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 font-medium",
                  isActive 
                    ? "text-slate-900 dark:text-slate-900 shadow-sm" 
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-white dark:bg-white/90 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("w-5 h-5", isActive ? "text-green-600" : "")} />
                  <span className={cn("hidden sm:inline-block", isActive ? "block" : "hidden")}>
                    {tab.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

