import React, { useState, useEffect } from 'react';
import { useAppStore, SHOP_ITEMS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingBag, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function Garden() {
  const { stars, garden, inventory, buyItem, plantSeed } = useAppStore();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ items: {name: string, qty: number, price: number}[], total: number } | null>(null);

  const handleTileClick = (tileId: number) => {
    const tile = garden.find(t => t.id === tileId);
    if (!tile) return;

    if (selectedInventoryItem && SHOP_ITEMS[selectedInventoryItem].type === 'seed') {
      if (!tile.plantId) {
        plantSeed(tileId, selectedInventoryItem);
        setSelectedInventoryItem(null);
        // Play pop sound or animation
      }
    } else if (tile.plantId && tile.stage < 3) {
      // Water plant directly if clicked
      const success = useAppStore.getState().waterPlant(tileId);
      if (success) {
        // Show some water animation
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#3b82f6', '#60a5fa', '#93c5fd'] // Blue water colors
        });
      }
    }
  };

  const handleBuy = (itemId: string) => {
    const success = buyItem(itemId, 1);
    if (success) {
      const item = SHOP_ITEMS[itemId];
      setReceipt({
        items: [{ name: item.name, qty: 1, price: item.price }],
        total: item.price
      });
      setIsShopOpen(false);
    } else {
      // Shake wallet or show error
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Header / Wallet */}
      <div className="flex justify-between items-center mb-8 bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-2xl shadow-inner border border-yellow-200 dark:border-yellow-700/50">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jouw Sterren</p>
            <motion.p 
              key={stars}
              initial={{ scale: 1.2, color: '#eab308' }}
              animate={{ scale: 1, color: 'inherit' }}
              className="text-3xl font-black text-slate-800 dark:text-white"
            >
              {stars}
            </motion.p>
          </div>
        </div>
        <button
          onClick={() => setIsShopOpen(true)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="hidden sm:inline">Shop</span>
        </button>
      </div>

      {/* Inventory Bar */}
      <div className="mb-8 bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl shadow-sm border border-white/40 dark:border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max">
          {Object.entries(inventory).filter(([_, qty]) => qty > 0).map(([itemId, qty]) => {
            const item = SHOP_ITEMS[itemId];
            const isSelected = selectedInventoryItem === itemId;
            return (
              <button
                key={itemId}
                onClick={() => setSelectedInventoryItem(isSelected ? null : itemId)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 min-w-[100px]",
                  isSelected 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 scale-105 shadow-md" 
                    : "bg-white/50 dark:bg-black/20 border-white/60 dark:border-white/5 hover:bg-white/80 dark:hover:bg-black/40"
                )}
              >
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                  {qty}
                </span>
              </button>
            );
          })}
          {Object.values(inventory).every(qty => qty === 0) && (
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium py-4 px-2">Je inventaris is leeg. Koop zaadjes in de shop!</p>
          )}
        </div>
      </div>

      {/* Garden Grid (5x5) */}
      <div className="bg-[#8B5A2B]/10 dark:bg-[#8B5A2B]/20 backdrop-blur-md p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] border-4 border-[#8B5A2B]/20 dark:border-[#8B5A2B]/30 shadow-inner">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto">
          {garden.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile.id)}
              className={cn(
                "relative aspect-square rounded-xl sm:rounded-3xl transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden group",
                !tile.plantId ? "bg-[#654321]/20 hover:bg-[#654321]/30 shadow-inner" : "bg-[#8FBC8F]/30 shadow-sm hover:bg-[#8FBC8F]/40",
                selectedInventoryItem && !tile.plantId ? "ring-4 ring-blue-400/50 ring-inset" : ""
              )}
            >
              {/* Dirt texture overlay */}
              {!tile.plantId && (
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4a3018 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
              )}
              
              {tile.plantId && (
                <>
                  <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-3xl sm:text-5xl md:text-6xl drop-shadow-lg z-10"
                    style={{
                      originY: 1,
                      animation: tile.stage === 3 ? 'sway 3s ease-in-out infinite alternate' : 'none'
                    }}
                  >
                    {SHOP_ITEMS[tile.plantId].emoji}
                  </motion.div>
                  {tile.stage < 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1">
                        💧 -1 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shop Drawer */}
      <AnimatePresence>
        {isShopOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShopOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl z-50 border-l border-white/40 dark:border-white/10 flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" /> Shop
                </h2>
                <button onClick={() => setIsShopOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {Object.values(SHOP_ITEMS).map(item => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-yellow-600 dark:text-yellow-500 font-bold text-sm">
                        <Star className="w-4 h-4 fill-current" /> {item.price}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={stars < item.price}
                      className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Animation */}
      <AnimatePresence>
        {receipt && (
          <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
            <motion.div
              initial={{ y: -50, opacity: 0, rotateX: 90 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-[#fdfbf7] text-slate-800 p-6 sm:p-8 w-[90vw] max-w-sm shadow-2xl pointer-events-auto relative"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(0,0,0,0.02)',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 5px) 100%, calc(100% - 10px) calc(100% - 10px), calc(100% - 15px) 100%, calc(100% - 20px) calc(100% - 10px), calc(100% - 25px) 100%, calc(100% - 30px) calc(100% - 10px), calc(100% - 35px) 100%, calc(100% - 40px) calc(100% - 10px), calc(100% - 45px) 100%, calc(100% - 50px) calc(100% - 10px), calc(100% - 55px) 100%, calc(100% - 60px) calc(100% - 10px), calc(100% - 65px) 100%, calc(100% - 70px) calc(100% - 10px), calc(100% - 75px) 100%, calc(100% - 80px) calc(100% - 10px), calc(100% - 85px) 100%, calc(100% - 90px) calc(100% - 10px), calc(100% - 95px) 100%, calc(100% - 100px) calc(100% - 10px), calc(100% - 105px) 100%, calc(100% - 110px) calc(100% - 10px), calc(100% - 115px) 100%, calc(100% - 120px) calc(100% - 10px), calc(100% - 125px) 100%, calc(100% - 130px) calc(100% - 10px), calc(100% - 135px) 100%, calc(100% - 140px) calc(100% - 10px), calc(100% - 145px) 100%, calc(100% - 150px) calc(100% - 10px), calc(100% - 155px) 100%, calc(100% - 160px) calc(100% - 10px), calc(100% - 165px) 100%, calc(100% - 170px) calc(100% - 10px), calc(100% - 175px) 100%, calc(100% - 180px) calc(100% - 10px), calc(100% - 185px) 100%, calc(100% - 190px) calc(100% - 10px), calc(100% - 195px) 100%, calc(100% - 200px) calc(100% - 10px), calc(100% - 205px) 100%, calc(100% - 210px) calc(100% - 10px), calc(100% - 215px) 100%, calc(100% - 220px) calc(100% - 10px), calc(100% - 225px) 100%, calc(100% - 230px) calc(100% - 10px), calc(100% - 235px) 100%, calc(100% - 240px) calc(100% - 10px), calc(100% - 245px) 100%, calc(100% - 250px) calc(100% - 10px), calc(100% - 255px) 100%, calc(100% - 260px) calc(100% - 10px), calc(100% - 265px) 100%, calc(100% - 270px) calc(100% - 10px), calc(100% - 275px) 100%, calc(100% - 280px) calc(100% - 10px), calc(100% - 285px) 100%, calc(100% - 290px) calc(100% - 10px), calc(100% - 295px) 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="text-center font-mono space-y-4">
                <p className="text-xl font-bold">☕ STUDYFLOW SHOP</p>
                <p className="text-slate-400">------------------------</p>
                
                <div className="text-left space-y-2">
                  {receipt.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.qty}x {item.name}</span>
                      <span>⭐ {item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-slate-400">------------------------</p>
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAAL</span>
                  <span>⭐ {receipt.total}</span>
                </div>
                
                <div className="text-left text-sm text-slate-500 mt-4 space-y-1">
                  <p>Betaald met: Sterren</p>
                  <p>Transactie: #SF{Math.floor(Math.random() * 10000)}</p>
                </div>
                
                <p className="font-bold mt-6">[🌱 Bedankt!]</p>
              </div>
              
              <button 
                onClick={() => setReceipt(null)}
                className="absolute -top-4 -right-4 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sway {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
      `}} />
    </div>
  );
}
