/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLocalStorage } from 'usehooks-ts';
import { UserProfile } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('studyflow-profile', {
    name: '',
    theme: 'bg-slate-50',
    onboarded: false,
  });

  return (
    <div className={`min-h-screen transition-colors duration-500 ${profile.theme}`}>
      <AnimatePresence mode="wait">
        {!profile.onboarded ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <Onboarding profile={profile} setProfile={setProfile} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto"
          >
            <Dashboard profile={profile} setProfile={setProfile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

