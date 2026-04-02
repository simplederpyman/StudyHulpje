import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const THEMES = [
  { id: 'bg-slate-50', name: 'Minimal', color: 'bg-slate-200' },
  { id: 'bg-blue-50', name: 'Ocean', color: 'bg-blue-200' },
  { id: 'bg-pink-50', name: 'Sakura', color: 'bg-pink-200' },
  { id: 'bg-green-50', name: 'Mint', color: 'bg-green-200' },
  { id: 'bg-purple-50', name: 'Lavender', color: 'bg-purple-200' },
];

export default function Onboarding({ profile, setProfile }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.name);
  const [theme, setTheme] = useState(profile.theme);

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2) {
      setProfile({ name, theme, onboarded: true });
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-3 rounded-2xl">
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
        Welkom bij StudyFlow 🌱
      </h1>
      <p className="text-center text-slate-500 mb-8">
        Jouw persoonlijke, afleidingsvrije studie dashboard.
      </p>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Hoe mogen we je noemen?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Alex"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              autoFocus
            />
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kies je favoriete thema
          </label>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "h-12 rounded-xl transition-all border-2",
                  t.color,
                  theme === t.id ? "border-blue-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                )}
                title={t.name}
              />
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={handleNext}
        disabled={step === 1 && !name.trim()}
        className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {step === 1 ? 'Volgende' : 'Start met studeren'}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
