import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, Timer, Calendar, Moon, Sun, Leaf, Music as MusicIcon, Bot, Sprout, Image as ImageIcon, X } from 'lucide-react';
import Pomodoro from './Pomodoro';
import Planner from './Planner';
import DailyCheckIn from './DailyCheckIn';
import Music from './Music';
import StudyBuddy from './StudyBuddy';
import Garden from './Garden';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store';

interface Props {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const TABS = [
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'plan', label: 'Plan', icon: Calendar },
  { id: 'buddy', label: 'Buddy', icon: Bot },
  { id: 'tuin', label: 'Tuin', icon: Sprout },
  { id: 'music', label: 'Muziek', icon: MusicIcon },
  { id: 'reflect', label: 'Reflect', icon: Moon }
];

const BACKGROUNDS = [
  { id: 'forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2532&auto=format&fit=crop' },
  { id: 'mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2532&auto=format&fit=crop' },
  { id: 'rain', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2532&auto=format&fit=crop' },
  { id: 'sunset', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2532&auto=format&fit=crop' },
  { id: 'cafe', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2532&auto=format&fit=crop' },
  { id: 'library', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2532&auto=format&fit=crop' }
];

export default function Dashboard({ profile, setProfile, theme, setTheme }: Props) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { background, setBackground } = useAppStore();

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
        style={{ backgroundImage: `url(${background})` }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-900/60 backdrop-blur-[2px] transition-colors duration-1000"></div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-y-auto pb-32">
        <div className="max-w-5xl mx-auto w-full p-4 md:p-8 flex-1 flex flex-col">
          
          {/* Header */}
          <header className="flex items-center justify-between bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 mb-8 transition-colors duration-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 dark:bg-green-500/30 p-2 rounded-2xl">
                <Leaf className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                  StudeerHulpje
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm capitalize font-medium">{today}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block bg-white/50 dark:bg-black/30 px-4 py-2 rounded-full border border-white/20 dark:border-white/5">
                Hoi, {profile.name}!
              </span>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/20 bg-white/40 dark:bg-black/30 rounded-full transition-all shadow-sm border border-white/20 dark:border-white/5"
                title="Instellingen"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Settings Modal */}
          <AnimatePresence>
            {showSettings && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                  onClick={() => setShowSettings(false)}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Instellingen
                    </h3>
                    <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        setShowSettings(false);
                        setShowBgPicker(true);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-200">
                        <ImageIcon className="w-5 h-5 text-blue-500" /> Achtergrond aanpassen
                      </span>
                    </button>
                    
                    <button 
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-200">
                        {theme === 'light' ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-yellow-500" />} 
                        Thema wisselen
                      </span>
                      <span className="text-sm text-slate-500 capitalize">{theme}</span>
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-8"
                    >
                      <span className="flex items-center gap-3 font-medium text-red-600 dark:text-red-400">
                        Uitloggen / Reset
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Background Picker Modal */}
          <AnimatePresence>
            {showBgPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                  onClick={() => setShowBgPicker(false)}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Kies een Achtergrond</h3>
                    <button onClick={() => setShowBgPicker(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setBackground(bg.url);
                          setShowBgPicker(false);
                        }}
                        className={cn(
                          "relative aspect-video rounded-xl overflow-hidden border-4 transition-all hover:scale-105",
                          background === bg.url ? "border-green-500 shadow-lg" : "border-transparent"
                        )}
                      >
                        <img src={bg.url} alt={bg.id} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
                  className="col-start-1 row-start-1 max-w-4xl mx-auto w-full"
                >
                  <Planner />
                </motion.div>
              )}

              {activeTab === 'buddy' && (
                <motion.div
                  key="buddy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-start-1 row-start-1 w-full"
                >
                  <StudyBuddy />
                </motion.div>
              )}

              {activeTab === 'tuin' && (
                <motion.div
                  key="tuin"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-start-1 row-start-1 w-full"
                >
                  <Garden />
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-3xl p-2 rounded-full shadow-2xl border border-white/50 dark:border-white/10 flex items-center gap-1 sm:gap-2 transition-colors duration-500 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full transition-all duration-300 font-medium shrink-0",
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
                  <span className={cn("text-sm", isActive ? "inline-block" : "hidden sm:inline-block")}>
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

