import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Share2, Award, Clock, X, Grid, BookOpen, ShieldCheck, Check } from 'lucide-react';
import CharacterCollection from './CharacterCollection';
import MyWordsList from './MyWordsList';
import PhonicsRadarChart from './PhonicsRadarChart';
import { DeviceService } from '../services/DeviceService';

interface ParentDashboardProps {
  stats: {
    wordsLearned: number;
    accuracy: number;
    timeSpent: number;
    streak: number;
    coins: number;
    unlockedCharacters: string[];
    completedWords?: { word: string; timestamp: string; accuracy: number }[];
  };
  onClose: () => void;
  onUnlockCharacter: (id: string, cost: number) => void;
}

export default function ParentDashboard({ stats, onClose, onUnlockCharacter }: ParentDashboardProps) {
  const [unlockedGate, setUnlockedGate] = useState(false);
  const [numA] = useState(() => Math.floor(Math.random() * 5) + 3);
  const [numB] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [parentAnswer, setParentAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'collection' | 'words'>('stats');

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentAnswer.trim(), 10) === numA + numB) {
      setUnlockedGate(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  const shareProgress = async () => {
    const text = `My child has learned ${stats.wordsLearned} new words on English Explorer with ${stats.accuracy}% accuracy! 🚀 #KidsLearning`;
    const shared = await DeviceService.share({
      title: 'English Explorer Progress',
      text: text,
    });

    if (!shared) {
      const copied = await DeviceService.copyToClipboard(text);
      if (copied) {
        DeviceService.showAlert("Progress card copied to clipboard!");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden border-4 border-stone-200 max-h-[90vh] flex flex-col"
      >
        {!unlockedGate ? (
          /* Parent Gate Security Screen */
          <div className="p-8 md:p-10 text-center relative flex flex-col items-center justify-center min-h-[380px]">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6 text-stone-500" />
            </button>

            <div className="w-16 h-16 bg-sky-100 rounded-3xl flex items-center justify-center mb-4 border-2 border-sky-200">
              <ShieldCheck className="w-8 h-8 text-sky-600" />
            </div>

            <h2 className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-1">Grown-Ups Only</h2>
            <p className="text-stone-500 font-bold text-xs uppercase tracking-wider max-w-xs mb-6">
              Please solve this quick math problem to open Parent Settings & Analytics.
            </p>

            <form onSubmit={handleGateSubmit} className="w-full max-w-xs space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 text-center">
                <span className="text-2xl font-black text-stone-800">
                  What is {numA} + {numB} ?
                </span>
              </div>

              <input
                type="number"
                value={parentAnswer}
                onChange={(e) => setParentAnswer(e.target.value)}
                placeholder="Enter answer"
                autoFocus
                className="w-full text-center text-xl font-black p-3 bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-sky-500"
              />

              {gateError && (
                <p className="text-red-500 text-xs font-bold uppercase">Incorrect, please try again!</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl border-b-4 border-sky-700 transition-all active:translate-y-0.5"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Main Parent Dashboard Content */
          <>
            <div className="bg-stone-50 p-6 md:p-8 text-stone-800 relative border-b-4 border-stone-200">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2.5 bg-white hover:bg-stone-100 rounded-2xl border-2 border-stone-200 transition-colors shadow-xs z-10"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-sky-500 rounded-3xl flex items-center justify-center shadow-lg border-b-4 border-sky-700">
                  <BarChart2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase text-stone-800">Parent Dashboard</h2>
                  <p className="text-stone-500 font-bold text-xs uppercase tracking-wider">Learning Metrics & Insights</p>
                </div>
              </div>

              <div className="flex bg-stone-200 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('collection')}
                  className={`flex-1 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'collection' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                >
                  Mascots
                </button>
                <button
                  onClick={() => setActiveTab('words')}
                  className={`flex-1 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all ${activeTab === 'words' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500'}`}
                >
                  Words
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 max-h-[450px]">
              <AnimatePresence mode="wait">
                {activeTab === 'stats' ? (
                  <motion.div
                    key="stats-content"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 uppercase tracking-widest font-black block mb-1">Accuracy</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-600" />
                          <span className="text-2xl font-black text-emerald-950">{stats.accuracy}%</span>
                        </div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <span className="text-[10px] text-amber-800 uppercase tracking-widest font-black block mb-1">Words Learned</span>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          <span className="text-2xl font-black text-amber-950">{stats.wordsLearned}</span>
                        </div>
                      </div>
                    </div>

                    <PhonicsRadarChart completedWords={stats.completedWords || []} />

                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-200 shadow-xs">
                          <Clock className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                          <p className="font-black text-stone-800 text-xs uppercase tracking-tight">Active Learning Time</p>
                          <p className="text-[10px] text-stone-500 font-bold uppercase">{Math.max(1, Math.floor(stats.timeSpent / 60))} mins active</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200">
                      <h3 className="font-black text-sky-900 mb-1 uppercase text-xs">Parent Tip</h3>
                      <p className="text-sky-800 font-bold text-xs leading-relaxed">
                        Praise effort rather than speed! Encourage your child to say phonics sounds out loud while placing the letters.
                      </p>
                    </div>

                    <button
                      onClick={shareProgress}
                      className="w-full py-3.5 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider text-xs"
                    >
                      <Share2 className="w-4 h-4" /> Share Progress Summary
                    </button>
                  </motion.div>
                ) : activeTab === 'collection' ? (
                  <motion.div
                    key="collection-content"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                  >
                    <CharacterCollection
                      unlockedIds={stats.unlockedCharacters}
                      availableCoins={stats.coins}
                      onUnlock={onUnlockCharacter}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="words-content"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                  >
                    <MyWordsList completedWords={stats.completedWords || []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
