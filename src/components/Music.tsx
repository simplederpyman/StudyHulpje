import React, { useState } from 'react';
import { Headphones, Music as MusicIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const PLAYLISTS = [
  { id: '37i9dQZF1DWWQRwui0ExPn', name: 'Lofi Beats', emoji: '🎧' },
  { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', emoji: '🧠' },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', emoji: '🎹' },
  { id: '37i9dQZF1DWYcDQ1hSjOpY', name: 'Deep Sleep / Rain', emoji: '🌧️' },
];

export default function Music() {
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0].id);

  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 transition-colors duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-pink-500/20 dark:bg-pink-500/30 p-3 rounded-2xl shadow-inner border border-white/40 dark:border-white/10">
          <Headphones className="w-6 h-6 text-pink-700 dark:text-pink-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors duration-500">Studie Muziek</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium transition-colors duration-500">Achtergrondmuziek voor ultieme focus</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {PLAYLISTS.map(playlist => (
          <button
            key={playlist.id}
            onClick={() => setActivePlaylist(playlist.id)}
            className={cn(
              "px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm border",
              activePlaylist === playlist.id
                ? "bg-pink-500/80 dark:bg-pink-600/80 text-white border-pink-400 dark:border-pink-500 scale-105 shadow-md"
                : "bg-white/50 dark:bg-black/30 text-slate-700 dark:text-slate-200 border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:-translate-y-0.5"
            )}
          >
            <span>{playlist.emoji}</span>
            <span>{playlist.name}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[2rem] overflow-hidden shadow-inner border-2 border-white/50 dark:border-white/10 bg-slate-100/30 dark:bg-black/20 backdrop-blur-sm transition-colors duration-500">
        <iframe
          style={{ borderRadius: '32px' }}
          src={`https://open.spotify.com/embed/playlist/${activePlaylist}?utm_source=generator&theme=0`}
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
