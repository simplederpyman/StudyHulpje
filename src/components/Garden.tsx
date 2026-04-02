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

    if (selectedInventoryItem) {
      const item = SHOP_ITEMS[selectedInventoryItem];
      if (item.type === 'seed' && !tile.plantId) {
        plantSeed(tileId, selectedInventoryItem);
        setSelectedInventoryItem(null);
      } else if (item.type === 'upgrade' && tile.plantId && tile.stage === 3) {
        const success = useAppStore.getState().upgradePlant(tileId);
        if (success) {
           confetti({
             particleCount: 50,
             spread: 60,
             origin: { y: 0.6 },
             colors: ['#fde047', '#eab308', '#ca8a04']
           });
           setSelectedInventoryItem(null);
        }
      } else if (item.type === 'tool' && selectedInventoryItem === 'water' && tile.plantId && tile.stage < 3) {
        const success = useAppStore.getState().waterPlant(tileId, true);
        if (success) {
          confetti({
            particleCount: 30,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#3b82f6', '#60a5fa', '#93c5fd']
          });
          setSelectedInventoryItem(null);
        }
      }
    } else if (tile.plantId && tile.stage < 3) {
      // Water plant directly if clicked (costs 1 star)
      const success = useAppStore.getState().waterPlant(tileId, false);
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
      <div className="mb-8 bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-4 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max">
          {Object.entries(inventory).filter(([_, qty]) => qty > 0).map(([itemId, qty]) => {
            const item = SHOP_ITEMS[itemId];
            const isSelected = selectedInventoryItem === itemId;
            return (
              <button
                key={itemId}
                onClick={() => setSelectedInventoryItem(isSelected ? null : itemId)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 min-w-[110px] group",
                  isSelected 
                    ? "bg-blue-50 dark:bg-blue-900/40 border-blue-400 scale-105 shadow-lg ring-4 ring-blue-400/20" 
                    : "bg-white/50 dark:bg-black/20 border-white/60 dark:border-white/5 hover:bg-white/80 dark:hover:bg-black/40 hover:scale-[1.02]"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-inner bg-gradient-to-br transition-transform group-hover:scale-110",
                  item.color || "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
                )}>
                  {item.emoji}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{item.name}</span>
                <span className="absolute -top-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
                  {qty}
                </span>
              </button>
            );
          })}
          {Object.values(inventory).every(qty => qty === 0) && (
            <div className="flex items-center justify-center w-full py-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Je inventaris is leeg. Koop items in de shop!
              </p>
            </div>
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
                    className={cn(
                      "text-3xl sm:text-5xl md:text-6xl drop-shadow-lg z-10",
                      (tile.level || 1) > 1 && "filter drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]"
                    )}
                    style={{
                      originY: 1,
                      animation: tile.stage === 3 ? 'sway 3s ease-in-out infinite alternate' : 'none'
                    }}
                  >
                    {SHOP_ITEMS[tile.plantId].emoji}
                  </motion.div>
                  {(tile.level || 1) > 1 && (
                    <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm z-20">
                      Lv.{tile.level}
                    </div>
                  )}
                  {tile.stage < 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <span className="text-white font-bold text-xs sm:text-sm flex items-center gap-1">
                        💧 -1 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                  )}
                  {tile.stage === 3 && selectedInventoryItem === 'upgrade_star' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 rounded-xl sm:rounded-3xl">
                      <span className="text-yellow-900 font-bold text-xs sm:text-sm flex items-center gap-1 bg-yellow-400 px-2 py-1 rounded-full">
                        ✨ Upgrade
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShopOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden flex flex-col max-h-full"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 flex justify-between items-center border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-lg">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Premium Shop</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Koop zeldzame zaden en magische upgrades</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 px-4 py-2 rounded-2xl">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-xl text-slate-800 dark:text-white">{stars}</span>
                  </div>
                  <button onClick={() => setIsShopOpen(false)} className="p-3 bg-white/50 dark:bg-black/30 rounded-full hover:bg-white dark:hover:bg-black/50 transition-colors">
                    <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
              
              {/* Bento Grid Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(SHOP_ITEMS).map(item => (
                    <div key={item.id} className="group relative rounded-3xl p-[2px] overflow-hidden">
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", item.color || "from-slate-400 to-slate-500")} />
                      <div className="relative h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.4rem] p-6 flex flex-col border border-white/40 dark:border-white/10">
                        <div className="flex justify-between items-start mb-4">
                          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner bg-gradient-to-br", item.color || "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900")}>
                            {item.emoji}
                          </div>
                          {item.rarity && (
                            <span className={cn(
                              "text-xs font-bold px-3 py-1 rounded-full shadow-sm",
                              item.rarity === 'Common' ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" :
                              item.rarity === 'Rare' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
                              item.rarity === 'Epic' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" :
                              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
                            )}>
                              {item.rarity}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex-1 mb-6">{item.description}</p>
                        
                        <button
                          onClick={() => handleBuy(item.id)}
                          disabled={stars < item.price}
                          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        >
                          Koop voor {item.price} <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
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
