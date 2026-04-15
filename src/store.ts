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
  stage: number; // 0: empty, 1: seed, 2: sprout, 3: small, 4: medium, 5: full
  plantedAt: number | null;
  lastWatered: number | null;
  level?: number;
  waterCount: number; // Progress towards next stage or level
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  type: 'seed' | 'tool' | 'decoration' | 'upgrade';
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color?: string;
}

export const SHOP_ITEMS: Record<string, ShopItem> = {
  'seed_sunflower': { id: 'seed_sunflower', name: 'Zonnebloem Zaadje', description: 'Groeit uit tot een vrolijke zonnebloem.', price: 5, emoji: '🌻', type: 'seed', rarity: 'Common', color: 'from-yellow-400 to-orange-500' },
  'seed_tulip': { id: 'seed_tulip', name: 'Tulp Zaadje', description: 'Een prachtige Hollandse tulp.', price: 10, emoji: '🌷', type: 'seed', rarity: 'Common', color: 'from-pink-400 to-rose-500' },
  'seed_rose': { id: 'seed_rose', name: 'Roos Zaadje', description: 'Een elegante rode roos.', price: 25, emoji: '🌹', type: 'seed', rarity: 'Rare', color: 'from-red-500 to-rose-700' },
  'seed_sakura': { id: 'seed_sakura', name: 'Sakura Zaadje', description: 'Een magische kersenbloesem.', price: 100, emoji: '🌸', type: 'seed', rarity: 'Epic', color: 'from-pink-300 to-purple-400' },
  'seed_tree': { id: 'seed_tree', name: 'Boompje', description: 'Een stevige boom die langzaam groeit.', price: 50, emoji: '🌳', type: 'seed', rarity: 'Rare', color: 'from-green-500 to-emerald-700' },
  'water': { id: 'water', name: 'Magisch Water', description: 'Laat je planten direct een groeifase overslaan.', price: 5, emoji: '💧', type: 'tool', rarity: 'Common', color: 'from-blue-400 to-cyan-500' },
  'upgrade_star': { id: 'upgrade_star', name: 'Sterrenstof', description: 'Upgrade een volgroeide plant naar het volgende level!', price: 50, emoji: '✨', type: 'upgrade', rarity: 'Epic', color: 'from-amber-300 to-yellow-500' },
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
  waterPlant: (tileId: number, useInventoryItem?: boolean) => boolean;
  upgradePlant: (tileId: number) => boolean;
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
        level: 1,
        waterCount: 0,
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
            level: 1,
            waterCount: 0,
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

      waterPlant: (tileId, useInventoryItem = false) => {
        const state = get();
        const tile = state.garden[tileId];
        
        if (tile && tile.plantId) {
          const canWater = useInventoryItem ? (state.inventory['water'] || 0) > 0 : state.stars >= 1;
          
          if (canWater) {
            const newGarden = [...state.garden];
            const nextWaterCount = (tile.waterCount || 0) + 1;
            let nextStage = tile.stage;
            let nextLevel = tile.level || 1;
            
            // Growth logic: Every 3 waterings = next stage (up to 5)
            if (nextStage < 5 && nextWaterCount >= 3) {
              nextStage += 1;
              // Reset waterCount when moving to next stage
              newGarden[tileId] = {
                ...tile,
                stage: nextStage,
                waterCount: 0,
                lastWatered: Date.now(),
              };
            } else if (nextStage === 5 && nextWaterCount >= 10) {
              // Leveling logic: Every 10 waterings at max stage = level up
              nextLevel += 1;
              newGarden[tileId] = {
                ...tile,
                level: nextLevel,
                waterCount: 0,
                lastWatered: Date.now(),
              };
            } else {
              newGarden[tileId] = {
                ...tile,
                waterCount: nextWaterCount,
                lastWatered: Date.now(),
              };
            }

            if (useInventoryItem) {
              set({
                garden: newGarden,
                inventory: {
                  ...state.inventory,
                  ['water']: state.inventory['water'] - 1
                }
              });
            } else {
              set({
                garden: newGarden,
                stars: state.stars - 1,
              });
            }
            return true;
          }
        }
        return false;
      },

      upgradePlant: (tileId) => {
        const state = get();
        const tile = state.garden[tileId];
        // Upgrade requires stage 5 and an upgrade_star in inventory
        if (tile && tile.plantId && tile.stage === 5 && (state.inventory['upgrade_star'] || 0) > 0) {
          const newGarden = [...state.garden];
          newGarden[tileId] = {
            ...tile,
            level: (tile.level || 1) + 1,
          };
          set({
            garden: newGarden,
            inventory: {
              ...state.inventory,
              ['upgrade_star']: state.inventory['upgrade_star'] - 1
            }
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
        stars: state.stars + (session.duration * 5) // Earn 5 stars per minute
      })),

      setBackground: (bg) => set({ background: bg }),
    }),
    {
      name: 'studeerhulpje-storage',
    }
  )
);
