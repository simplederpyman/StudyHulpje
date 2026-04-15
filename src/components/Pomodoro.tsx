import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, Coffee, PictureInPicture, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useInterval } from 'usehooks-ts';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { useAppStore } from '../store';

const DEFAULT_TIME = 25 * 60;
const LEAVE_PENALTY_TIME = 30; // 30 seconds

// Emojis for plant stages
const PLANT_STAGES = ['🌱', '🌿', '🪴', '🌳', '🌸'];

const TIPS = [
  "Tip: Zet je telefoon op 'Niet Storen' tijdens een focus sessie.",
  "Tip: Drink een glas water voordat je begint.",
  "Tip: Breek grote taken op in kleinere, behapbare stukjes.",
  "Tip: Beloon jezelf na een succesvolle sessie!",
  "Tip: Zorg voor voldoende frisse lucht in je kamer."
];

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME);
  const [duration, setDuration] = useState(25); // in minutes
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState('25');
  const [plantStage, setPlantStage] = useState(0);
  const [sound, setSound] = useState<'silence' | 'rain' | 'coffee'>('silence');
  const [visibility, setVisibility] = useState<DocumentVisibilityState>('visible');
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [currentTip, setCurrentTip] = useState(TIPS[0]);
  
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  
  const { addSession, sessions } = useAppStore();
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(document.visibilityState);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useInterval(
    () => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setIsActive(false);
          handleComplete();
          return duration * 60;
        }
        return time - 1;
      });
    },
    isActive ? 1000 : null
  );

  useEffect(() => {
    if (visibility === 'hidden' && isActive && !pipWindow) {
      hiddenTimeRef.current = Date.now();
    } else if (visibility === 'visible' && hiddenTimeRef.current && isActive) {
      const hiddenDuration = (Date.now() - hiddenTimeRef.current) / 1000;
      if (hiddenDuration > LEAVE_PENALTY_TIME) {
        setPlantStage((prev) => Math.max(0, prev - 1));
        alert('Je was te lang weg! Je plantje is een beetje gekrompen. Blijf gefocust! 🌱');
      }
      hiddenTimeRef.current = null;
    }
  }, [visibility, isActive, pipWindow]);

  const handleComplete = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setPlantStage((prev) => Math.min(PLANT_STAGES.length - 1, prev + 1));
    setShowCompletionModal(true);
  };

  const saveSession = () => {
    if (taskName.trim()) {
      addSession({
        task: taskName,
        duration: duration
      });
      setTaskName('');
      setShowCompletionModal(false);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
  };

  const handleTimeSubmit = () => {
    const mins = parseInt(inputMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 120) {
      setDuration(mins);
      setTimeLeft(mins * 60);
      setIsEditing(false);
    } else {
      setInputMinutes(duration.toString());
      setIsEditing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSound = (type: 'silence' | 'rain' | 'coffee') => {
    setSound(type);
  };

  const togglePiP = async () => {
    if (pipWindow) {
      pipWindow.close();
      return;
    }

    if (!('documentPictureInPicture' in window)) {
      alert('Picture-in-Picture wordt niet ondersteund in deze browser.');
      return;
    }

    try {
      // @ts-ignore
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 300,
        height: 350,
      });

      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pip.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText;
          link.href = styleSheet.href || '';
          pip.document.head.appendChild(link);
        }
      });

      const tailwindScript = document.createElement('script');
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      pip.document.head.appendChild(tailwindScript);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pip);
    } catch (error) {
      console.error('PiP failed:', error);
      alert('Kon Picture-in-Picture niet starten.');
    }
  };

  const TimerContent = () => (
    <div className={cn("flex flex-col items-center justify-center h-full w-full", pipWindow ? "p-6 bg-slate-50 dark:bg-slate-900" : "")}>
      {/* Plant Visualization */}
      <div className="flex justify-center mb-8 h-32 items-end">
        <motion.div 
          key={plantStage}
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="text-8xl drop-shadow-2xl"
        >
          {PLANT_STAGES[plantStage]}
        </motion.div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        {isEditing && !isActive ? (
          <div className="flex flex-col items-center mb-2">
            <input
              type="number"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              onBlur={handleTimeSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTimeSubmit()}
              className="text-7xl md:text-8xl font-bold text-slate-800 dark:text-white font-mono tracking-tighter bg-transparent border-b-4 border-green-500 outline-none w-48 text-center"
              autoFocus
              min="1"
              max="120"
            />
            <p className="text-xs text-slate-500 mt-2">Druk op Enter om op te slaan (1-120 min)</p>
          </div>
        ) : (
          <div 
            className="text-7xl md:text-8xl font-bold text-slate-800 dark:text-white font-mono tracking-tighter mb-2 drop-shadow-sm transition-colors duration-500 cursor-pointer hover:text-green-600 dark:hover:text-green-400"
            onClick={() => !isActive && setIsEditing(true)}
            title={!isActive ? "Klik om tijd aan te passen" : ""}
          >
            {formatTime(timeLeft)}
          </div>
        )}
        <p className="text-slate-600 dark:text-slate-300 font-medium bg-white/40 dark:bg-black/30 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-white/20 dark:border-white/5 transition-colors duration-500">
          {isActive ? 'Blijf gefocust...' : 'Klaar om te starten?'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            isActive 
              ? "bg-orange-100/90 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/60 backdrop-blur-md" 
              : "bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white backdrop-blur-md"
          )}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {isActive ? 'Pauze' : 'Start Focus'}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-white/50 dark:bg-black/30 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20 transition-all shadow-sm hover:shadow-md backdrop-blur-md border border-white/60 dark:border-white/10"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Tip */}
      {!pipWindow && (
        <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md px-4">
          {currentTip}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 flex flex-col items-center relative overflow-hidden min-h-[500px] transition-colors duration-500">
        {/* Background Pulse if active */}
        {isActive && !pipWindow && (
          <motion.div 
            className="absolute inset-0 bg-green-500/10 dark:bg-green-400/5"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        <div className="relative z-10 w-full h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Pomodoro Timer</h2>
            <div className="flex gap-2 bg-white/50 dark:bg-black/30 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-white/60 dark:border-white/10 transition-colors duration-500">
              <button 
                onClick={() => handleSound('silence')}
                className={cn("p-2.5 rounded-full transition-all", sound === 'silence' ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10")}
                title="Stilte"
              >
                <VolumeX className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSound('rain')}
                className={cn("p-2.5 rounded-full transition-all", sound === 'rain' ? "bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10")}
                title="Regen"
              >
                <CloudRain className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleSound('coffee')}
                className={cn("p-2.5 rounded-full transition-all", sound === 'coffee' ? "bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10")}
                title="Koffiehuis"
              >
                <Coffee className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300/50 dark:bg-slate-600/50 mx-1 self-center" />
              <button 
                onClick={togglePiP}
                className={cn("p-2.5 rounded-full transition-all", pipWindow ? "bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10")}
                title="Picture in Picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </button>
            </div>
          </div>

          {pipWindow ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-col gap-4 bg-white/30 dark:bg-black/20 rounded-3xl m-4 border border-white/40 dark:border-white/10 transition-colors duration-500">
              <PictureInPicture className="w-12 h-12 opacity-50" />
              <p className="font-medium">Timer is geopend in een apart venster.</p>
              <button onClick={togglePiP} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium">Sluit venster</button>
              {createPortal(<TimerContent />, pipWindow.document.body)}
            </div>
          ) : (
            <TimerContent />
          )}
        </div>
      </div>

      {/* Sessions Table */}
      {sessions.length > 0 && (
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recente Sessies</h3>
          <div className="overflow-hidden rounded-2xl border border-white/40 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/50 dark:bg-black/30 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold">Taak</th>
                  <th className="px-4 py-3 font-semibold">Duur</th>
                  <th className="px-4 py-3 font-semibold">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-white/5">
                {sessions.slice(0, 5).map((session) => (
                  <tr key={session.id} className="bg-white/30 dark:bg-black/10 hover:bg-white/50 dark:hover:bg-black/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{session.task}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{session.duration} min</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(session.date).toLocaleDateString('nl-NL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowCompletionModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Sessie Voltooid!</h3>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                Goed gedaan! Je hebt ⭐ 1 verdiend. Wat heb je precies gedaan tijdens deze sessie?
              </p>
              
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Bijv. Wiskunde hoofdstuk 3 gelezen..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-500 outline-none transition-colors mb-6 text-slate-800 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveSession()}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCompletionModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Overslaan
                </button>
                <button 
                  onClick={saveSession}
                  disabled={!taskName.trim()}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
                >
                  Opslaan
                </button>
              </div>
              
              <button 
                onClick={() => setShowCompletionModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
