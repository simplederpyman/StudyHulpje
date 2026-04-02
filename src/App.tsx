/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLocalStorage } from 'usehooks-ts';
import { UserProfile } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';

export default function App() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('studyflow-profile', {
    name: '',
    theme: 'bg-slate-50', // We'll keep this in state for backwards compatibility, but won't use it for the background anymore
    onboarded: false,
  });

  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('studyflow-colortheme', 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full overflow-hidden bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-500">
      <AnimatePresence mode="wait">
        {!profile.onboarded ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full"
          >
            <Onboarding profile={profile} setProfile={setProfile} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen w-full"
          >
            <Dashboard profile={profile} setProfile={setProfile} theme={theme} setTheme={setTheme} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


