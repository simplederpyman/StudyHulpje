export type Subject = {
  id: string;
  name: string;
  color: string;
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'nl', name: 'Nederlands', color: 'bg-blue-400' },
  { id: 'math', name: 'Wiskunde', color: 'bg-red-400' },
  { id: 'en', name: 'Engels', color: 'bg-green-400' },
  { id: 'chem', name: 'Scheikunde', color: 'bg-purple-400' },
  { id: 'hist', name: 'Geschiedenis', color: 'bg-orange-400' },
];

export type DayPlan = {
  [day: string]: string[]; // array of subject ids
};

export type TaskStep = {
  id: string;
  text: string;
  completed: boolean;
};

export type DailyCheckIn = {
  date: string;
  priorities: string[];
  mood: number; // 0-3 (😫 😐 😊 💪)
};

export type UserProfile = {
  name: string;
  theme: string;
  onboarded: boolean;
};
