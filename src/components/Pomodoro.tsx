import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, Coffee, PictureInPicture } from 'lucide-react';
import { motion } from 'motion/react';
import { useInterval } from 'usehooks-ts';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

const POMODORO_TIME = 25 * 60;
const LEAVE_PENALTY_TIME = 30; // 30 seconds

// Emojis for plant stages
const PLANT_STAGES = ['🌱', '🌿', '🪴', '🌳', '🌸'];

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [plantStage, setPlantStage] = useState(0);
  const [sound, setSound] = useState<'silence' | 'rain' | 'coffee'>('silence');
  const [visibility, setVisibility] = useState<DocumentVisibilityState>('visible');
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  
  const hiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisibility(document.visibilityState);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Audio refs (mocking actual audio for now, in a real app these would be actual Audio objects)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useInterval(
    () => {
      setTimeLeft((time) => {
        if (time <= 1) {
          setIsActive(false);
          handleComplete();
          return POMODORO_TIME;
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
        // Penalty!
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
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(POMODORO_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSound = (type: 'silence' | 'rain' | 'coffee') => {
    setSound(type);
    // In a real implementation, we would play/pause audio here.
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

      // Copy styles to the new window
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

      // Add Tailwind base styles
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
    <div className={cn("flex flex-col items-center justify-center h-full", pipWindow ? "p-6 bg-slate-50" : "")}>
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
      <div className="text-center mb-8">
        <div className="text-7xl md:text-8xl font-bold text-slate-800 font-mono tracking-tighter mb-2 drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>
        <p className="text-slate-600 font-medium bg-white/40 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm">
          {isActive ? 'Blijf gefocust...' : 'Klaar om te starten?'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            isActive 
              ? "bg-orange-100/90 text-orange-700 hover:bg-orange-200 backdrop-blur-md" 
              : "bg-slate-900/90 text-white hover:bg-slate-800 backdrop-blur-md"
          )}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {isActive ? 'Pauze' : 'Start Focus'}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-white/50 text-slate-700 hover:bg-white/80 transition-all shadow-sm hover:shadow-md backdrop-blur-md"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/40 flex flex-col items-center relative overflow-hidden min-h-[500px]">
      {/* Background Pulse if active */}
      {isActive && !pipWindow && (
        <motion.div 
          className="absolute inset-0 bg-green-500/10"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Focus Garden</h2>
          <div className="flex gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-full shadow-sm border border-white/60">
            <button 
              onClick={() => handleSound('silence')}
              className={cn("p-2.5 rounded-full transition-all", sound === 'silence' ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              title="Stilte"
            >
              <VolumeX className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSound('rain')}
              className={cn("p-2.5 rounded-full transition-all", sound === 'rain' ? "bg-blue-100 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              title="Regen"
            >
              <CloudRain className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSound('coffee')}
              className={cn("p-2.5 rounded-full transition-all", sound === 'coffee' ? "bg-orange-100 text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              title="Koffiehuis"
            >
              <Coffee className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-300/50 mx-1 self-center" />
            <button 
              onClick={togglePiP}
              className={cn("p-2.5 rounded-full transition-all", pipWindow ? "bg-purple-100 text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")}
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
        </div>

        {pipWindow ? (
          <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-4 bg-white/30 rounded-3xl m-4 border border-white/40">
            <PictureInPicture className="w-12 h-12 opacity-50" />
            <p className="font-medium">Timer is geopend in een apart venster.</p>
            <button onClick={togglePiP} className="text-blue-600 hover:text-blue-700 underline font-medium">Sluit venster</button>
            {createPortal(<TimerContent />, pipWindow.document.body)}
          </div>
        ) : (
          <TimerContent />
        )}
      </div>
    </div>
  );
}
