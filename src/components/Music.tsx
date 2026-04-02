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
    <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/40">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-pink-500/20 p-3 rounded-2xl shadow-inner border border-white/40">
          <Headphones className="w-6 h-6 text-pink-700" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Studie Muziek</h2>
          <p className="text-sm text-slate-600 font-medium">Achtergrondmuziek voor ultieme focus</p>
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
                ? "bg-pink-500/80 text-white border-pink-400 scale-105 shadow-md"
                : "bg-white/50 text-slate-700 border-white/60 hover:bg-white/80 hover:-translate-y-0.5"
            )}
          >
            <span>{playlist.emoji}</span>
            <span>{playlist.name}</span>
          </button>
        ))}
      </div>

      <div className="rounded-[2rem] overflow-hidden shadow-inner border-2 border-white/50 bg-slate-100/30 backdrop-blur-sm">
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
