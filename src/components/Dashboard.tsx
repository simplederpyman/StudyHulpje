import React from 'react';
import { UserProfile } from '../types';
import { Settings, LogOut } from 'lucide-react';
import Pomodoro from './Pomodoro';
import Planner from './Planner';
import TaskBreaker from './TaskBreaker';
import DailyCheckIn from './DailyCheckIn';

interface Props {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

export default function Dashboard({ profile, setProfile }: Props) {
  const today = new Date().toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleLogout = () => {
    setProfile({ ...profile, onboarded: false });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            StudyFlow 🌱
          </h1>
          <p className="text-slate-500 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium text-slate-700 hidden sm:inline-block">
            Hoi, {profile.name}!
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors"
            title="Instellingen / Uitloggen"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro */}
        <div className="lg:col-span-5 space-y-6">
          <Pomodoro />
        </div>

        {/* Right Column: Planner & Task Breaker */}
        <div className="lg:col-span-7 space-y-6">
          <Planner />
          <TaskBreaker />
        </div>
      </div>

      {/* Bottom: Daily Check-in */}
      <DailyCheckIn />

      {/* Footer */}
      <footer className="text-center text-slate-400 text-sm mt-8">
        Je data blijft veilig op je eigen apparaat ✓
      </footer>
    </div>
  );
}
