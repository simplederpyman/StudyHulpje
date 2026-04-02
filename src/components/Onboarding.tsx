import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Leaf, Brain, Timer, Sprout } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function Onboarding({ profile, setProfile }: Props) {
  const [step, setStep] = useState(0); // 0: Landing, 1: Name
  const [name, setName] = useState(profile.name);

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && name.trim()) {
      setProfile({ name, theme: 'bg-slate-50', onboarded: true });
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center relative transition-colors duration-500 overflow-hidden"
      style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2532&auto=format&fit=crop)' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm transition-colors duration-500"></div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-4xl w-full text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 dark:bg-black/30 p-5 rounded-[2rem] backdrop-blur-md border border-white/30">
                <Leaf className="w-16 h-16 text-green-300" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
              StudeerHulpje
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-12 font-medium max-w-2xl mx-auto drop-shadow-md">
              De ultieme, gamified studie-ervaring. Blijf gefocust, kweek je eigen tuin en leer slimmer met AI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white">
                <Timer className="w-8 h-8 mb-4 text-orange-300" />
                <h3 className="text-xl font-bold mb-2">Focus Timer</h3>
                <p className="text-slate-300">Pomodoro sessies met rustgevende geluiden en handige tips.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white">
                <Sprout className="w-8 h-8 mb-4 text-green-300" />
                <h3 className="text-xl font-bold mb-2">Zen Tuin</h3>
                <p className="text-slate-300">Verdien sterren met studeren en bouw je eigen virtuele tuin.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white">
                <Brain className="w-8 h-8 mb-4 text-blue-300" />
                <h3 className="text-xl font-bold mb-2">AI Buddy</h3>
                <p className="text-slate-300">Genereer direct quizzen, flashcards en samenvattingen.</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="bg-white text-slate-900 px-10 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto"
            >
              Start Nu <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white/70 dark:bg-black/40 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/50 dark:border-white/10 max-w-md w-full relative z-10 transition-colors duration-500"
          >
            <div className="flex justify-center mb-8">
              <div className="bg-green-500/20 dark:bg-green-500/30 p-4 rounded-3xl shadow-inner border border-white/40 dark:border-white/10">
                <Leaf className="w-10 h-10 text-green-700 dark:text-green-400" />
              </div>
            </div>
            
            <h2 className="text-4xl font-extrabold text-center text-slate-800 dark:text-white mb-3 tracking-tight transition-colors duration-500">
              Welkom!
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-10 font-medium text-lg transition-colors duration-500">
              Hoe mogen we je noemen?
            </p>

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jouw naam..."
                  className="w-full px-5 py-4 rounded-2xl bg-white/80 dark:bg-black/30 border-2 border-white/60 dark:border-white/10 focus:ring-4 focus:ring-green-400/30 focus:border-green-500 dark:focus:border-green-400 outline-none transition-all text-lg shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-slate-800 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  autoFocus
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:transform-none disabled:cursor-not-allowed"
              >
                Verder
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

