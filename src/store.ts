import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySession {
  id: string;
  task: string;
  duration: number;
  date: string;
}

export interface GardenTile {
  id: number;
  plantId: string | null;
  stage: number; // 0: empty, 1: seed, 2: sprout, 3: full
  plantedAt: number | null;
  lastWatered: number | null;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  type: 'seed' | 'tool' | 'decoration';
}

export const SHOP_ITEMS: Record<string, ShopItem> = {
  'seed_sunflower': { id: 'seed_sunflower', name: 'Zonnebloem Zaadje', description: 'Groeit uit tot een vrolijke zonnebloem.', price: 5, emoji: '🌻', type: 'seed' },
  'seed_tulip': { id: 'seed_tulip', name: 'Tulp Zaadje', description: 'Een prachtige Hollandse tulp.', price: 10, emoji: '🌷', type: 'seed' },
  'seed_tree': { id: 'seed_tree', name: 'Boompje', description: 'Een stevige boom die langzaam groeit.', price: 20, emoji: '🌳', type: 'seed' },
  'water': { id: 'water', name: 'Gieter', description: 'Laat je planten sneller groeien.', price: 2, emoji: '💧', type: 'tool' },
};

interface AppState {
  stars: number;
  inventory: Record<string, number>;
  garden: GardenTile[];
  sessions: StudySession[];
  background: string;
  
  addStars: (amount: number) => void;
  removeStars: (amount: number) => void;
  buyItem: (itemId: string, quantity: number) => boolean;
  plantSeed: (tileId: number, seedId: string) => void;
  waterPlant: (tileId: number) => boolean;
  addSession: (session: Omit<StudySession, 'id' | 'date'>) => void;
  setBackground: (bg: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      stars: 10, // Start with some stars
      inventory: {},
      garden: Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        plantId: null,
        stage: 0,
        plantedAt: null,
        lastWatered: null,
      })),
      sessions: [],
      background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2532&auto=format&fit=crop',

      addStars: (amount) => set((state) => ({ stars: state.stars + amount })),
      
      removeStars: (amount) => set((state) => ({ stars: Math.max(0, state.stars - amount) })),
      
      buyItem: (itemId, quantity) => {
        const state = get();
        const item = SHOP_ITEMS[itemId];
        const totalCost = item.price * quantity;
        
        if (state.stars >= totalCost) {
          set((state) => ({
            stars: state.stars - totalCost,
            inventory: {
              ...state.inventory,
              [itemId]: (state.inventory[itemId] || 0) + quantity
            }
          }));
          return true;
        }
        return false;
      },

      plantSeed: (tileId, seedId) => set((state) => {
        if ((state.inventory[seedId] || 0) > 0) {
          const newGarden = [...state.garden];
          newGarden[tileId] = {
            ...newGarden[tileId],
            plantId: seedId,
            stage: 1,
            plantedAt: Date.now(),
          };
          return {
            garden: newGarden,
            inventory: {
              ...state.inventory,
              [seedId]: state.inventory[seedId] - 1
            }
          };
        }
        return state;
      }),

      waterPlant: (tileId) => {
        const state = get();
        const tile = state.garden[tileId];
        // Water costs 1 star, max stage is 3
        if (tile && tile.plantId && tile.stage < 3 && state.stars >= 1) {
          const newGarden = [...state.garden];
          newGarden[tileId] = {
            ...tile,
            stage: tile.stage + 1,
            lastWatered: Date.now(),
          };
          set({
            garden: newGarden,
            stars: state.stars - 1,
          });
          return true;
        }
        return false;
      },

      addSession: (session) => set((state) => ({
        sessions: [
          {
            ...session,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
          },
          ...state.sessions
        ],
        stars: state.stars + 1 // Earn 1 star per session
      })),

      setBackground: (bg) => set({ background: bg }),
    }),
    {
      name: 'studeerhulpje-storage',
    }
  )
);
