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
          className="text-8xl drop-shadow-lg"
        >
          {PLANT_STAGES[plantStage]}
        </motion.div>
      </div>

      {/* Timer */}
      <div className="text-center mb-8">
        <div className="text-7xl font-bold text-slate-800 font-mono tracking-tighter mb-2">
          {formatTime(timeLeft)}
        </div>
        <p className="text-slate-400 text-sm font-medium">
          {isActive ? 'Blijf gefocust...' : 'Klaar om te starten?'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className={cn(
            "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md",
            isActive 
              ? "bg-orange-100 text-orange-700 hover:bg-orange-200" 
              : "bg-slate-900 text-white hover:bg-slate-800"
          )}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {isActive ? 'Pauze' : 'Start Focus'}
        </button>
        
        <button
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center relative overflow-hidden min-h-[400px]">
      {/* Background Pulse if active */}
      {isActive && !pipWindow && (
        <motion.div 
          className="absolute inset-0 bg-blue-50/50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-700">Focus Garden</h2>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-full">
            <button 
              onClick={() => handleSound('silence')}
              className={cn("p-2 rounded-full transition-colors", sound === 'silence' ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600")}
              title="Stilte"
            >
              <VolumeX className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSound('rain')}
              className={cn("p-2 rounded-full transition-colors", sound === 'rain' ? "bg-blue-100 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              title="Regen"
            >
              <CloudRain className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleSound('coffee')}
              className={cn("p-2 rounded-full transition-colors", sound === 'coffee' ? "bg-orange-100 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              title="Koffiehuis"
            >
              <Coffee className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <button 
              onClick={togglePiP}
              className={cn("p-2 rounded-full transition-colors", pipWindow ? "bg-purple-100 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>
          </div>
        </div>

        {pipWindow ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
            <PictureInPicture className="w-12 h-12 opacity-50" />
            <p>Timer is geopend in een apart venster.</p>
            <button onClick={togglePiP} className="text-blue-500 underline text-sm">Sluit venster</button>
            {createPortal(<TimerContent />, pipWindow.document.body)}
          </div>
        ) : (
          <TimerContent />
        )}
      </div>
    </div>
  );
}
