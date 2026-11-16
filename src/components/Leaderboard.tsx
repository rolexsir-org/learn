import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, Sparkles, Crown, Medal, Heart, ShieldCheck, RefreshCw, Zap, Users, ChevronUp } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { soundFx } from '../utils/audio';
import { ExplorerCard, IconBadge, ExplorerButton } from './UiCore';
import { cn } from '../lib/utils';

interface LeaderboardProps {
  userStars: number;
  userCoins: number;
  userStreak: number;
  soundEnabled: boolean;
  currentUserId?: string;
}

interface Learner {
  id: string;
  name: string;
  stars: number;
  streak: number;
  avatar: string;
  league: string;
  isCurrentUser?: boolean;
  highFives: number;
}

const BENCHMARK_LEARNERS: Omit<Learner, 'isCurrentUser'>[] = [
  { id: 'bm-1', name: 'Aria Starling 🌟', stars: 145, streak: 12, avatar: '🦊', league: 'Diamond', highFives: 42 },
  { id: 'bm-2', name: 'Leo Lionheart 🦁', stars: 120, streak: 9, avatar: '🦁', league: 'Diamond', highFives: 38 },
  { id: 'bm-3', name: 'Milo Monkey 🐒', stars: 98, streak: 7, avatar: '🐒', league: 'Gold', highFives: 29 },
  { id: 'bm-4', name: 'Sammy Squirrel 🐿️', stars: 85, streak: 5, avatar: '🐿️', league: 'Gold', highFives: 21 },
  { id: 'bm-5', name: 'Maya Explorer 🦄', stars: 72, streak: 4, avatar: '🦄', league: 'Silver', highFives: 18 },
  { id: 'bm-6', name: 'Oliver Owl 🦉', stars: 60, streak: 3, avatar: '🦉', league: 'Silver', highFives: 15 },
  { id: 'bm-7', name: 'Zoe Zebra 🦓', stars: 45, streak: 2, avatar: '🦓', league: 'Bronze', highFives: 10 },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  userStars,
  userCoins,
  userStreak,
  currentUserId
}) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'alltime'>('weekly');
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [cheeredIds, setCheeredIds] = useState<Record<string, number>>({});

  const fetchLeaderboard = async () => {
    setLoading(true);
    let realUsers: Learner[] = [];

    try {
      const q = query(collection(db, 'users'), orderBy('totalStars', 'desc'), limit(15));
      const querySnap = await getDocs(q);
      
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        const uid = docSnap.id;
        const isMe = uid === currentUserId || (auth.currentUser && uid === auth.currentUser.uid);
        
        realUsers.push({
          id: uid,
          name: data.displayName || (isMe ? 'You (Super Learner)' : `Explorer ${uid.substring(0, 4)}`),
          stars: data.totalStars || 0,
          streak: data.currentStreak || 1,
          avatar: isMe ? '🌟' : ['🦊', '🦁', '🐼', '🐯', '🐰'][Math.abs(uid.charCodeAt(0) || 0) % 5],
          league: data.totalStars > 100 ? 'Diamond' : data.totalStars > 50 ? 'Gold' : 'Silver',
          isCurrentUser: Boolean(isMe),
          highFives: Math.floor((data.totalStars || 10) / 3)
        });
      });
    } catch (err) {}

    const activeUid = currentUserId || auth.currentUser?.uid || 'local-me';
    const myIndex = realUsers.findIndex(u => u.isCurrentUser || u.id === activeUid);

    if (myIndex >= 0) {
      realUsers[myIndex].stars = Math.max(realUsers[myIndex].stars, userStars);
      realUsers[myIndex].streak = Math.max(realUsers[myIndex].streak, userStreak);
    } else {
      realUsers.push({
        id: activeUid,
        name: 'You (Super Learner) ⭐',
        stars: userStars,
        streak: userStreak,
        avatar: '🌟',
        league: userStars > 100 ? 'Diamond' : userStars > 50 ? 'Gold' : 'Silver',
        isCurrentUser: true,
        highFives: Math.floor(userStars / 2) + 5
      });
    }

    const combined = [...realUsers];
    BENCHMARK_LEARNERS.forEach(bm => {
      if (!combined.some(c => c.name === bm.name)) {
        combined.push({ ...bm, isCurrentUser: false });
      }
    });

    combined.sort((a, b) => b.stars - a.stars);
    setLearners(combined.slice(0, 10));
    setLoading(false);
  };

  useEffect(() => { fetchLeaderboard(); }, [userStars, userStreak, timeframe, currentUserId]);

  const handleHighFive = (id: string) => {
    soundFx.playChime();
    setCheeredIds(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const top3 = learners.slice(0, 3);
  const rest = learners.slice(3);
  const myRankIndex = learners.findIndex(l => l.isCurrentUser);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Premium Header Banner */}
      <ExplorerCard className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-amber-300 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-amber-950">
          <div className="flex items-center gap-5">
            <IconBadge icon="🏆" size="lg" color="bg-white/90 border-amber-300 text-3xl shadow-lg" />
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <span className="text-[10px] font-black bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  Diamond League 💎
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">Weekly Star Champions</h2>
            </div>
          </div>

          <div className="flex bg-amber-950/20 p-1.5 rounded-2xl border border-amber-500/40 backdrop-blur-sm">
            <button
              onClick={() => { soundFx.playPop(); setTimeframe('weekly'); }}
              className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all", timeframe === 'weekly' ? "bg-white text-amber-950 shadow-md" : "text-amber-900 hover:bg-white/10")}
            >
              This Week
            </button>
            <button
              onClick={() => { soundFx.playPop(); setTimeframe('alltime'); }}
              className={cn("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all", timeframe === 'alltime' ? "bg-white text-amber-950 shadow-md" : "text-amber-900 hover:bg-white/10")}
            >
              Legends
            </button>
          </div>
        </div>
      </ExplorerCard>

      {loading ? (
        <ExplorerCard className="w-full flex flex-col items-center justify-center gap-4 py-20">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <span className="text-sm font-black text-amber-800 uppercase tracking-widest">Gathering Champion Stars...</span>
        </ExplorerCard>
      ) : (
        <div className="w-full flex flex-col gap-8">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end px-2 md:px-8">
             {/* 2nd Place */}
             {top3[1] && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center group">
                 <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">{top3[1].avatar}</div>
                 <ExplorerCard padding="sm" className={cn("w-full h-32 flex flex-col items-center justify-center text-center relative border-slate-300 bg-slate-50 shadow-slate-100", top3[1].isCurrentUser && "ring-4 ring-amber-400 border-amber-500")}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-400 text-slate-700 flex items-center justify-center font-black text-xs">2</div>
                    <p className="text-xs font-black text-slate-800 truncate w-full mb-2">{top3[1].name}</p>
                    <div className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1.5 shadow-inner-soft">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      {top3[1].stars}
                    </div>
                 </ExplorerCard>
               </motion.div>
             )}

             {/* 1st Place */}
             {top3[0] && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center group">
                 <div className="text-2xl animate-bounce mb-1">👑</div>
                 <div className="text-5xl md:text-7xl mb-4 group-hover:scale-110 transition-transform">{top3[0].avatar}</div>
                 <ExplorerCard padding="sm" className={cn("w-full h-40 flex flex-col items-center justify-center text-center relative border-amber-400 bg-gradient-to-b from-yellow-50 to-amber-100 shadow-amber-200/50 scale-110 z-10", top3[0].isCurrentUser && "ring-4 ring-amber-500")}>
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 border-2 border-white text-amber-950 flex items-center justify-center font-black text-lg shadow-md">1</div>
                    <p className="text-sm font-black text-amber-950 truncate w-full mb-3">{top3[0].name}</p>
                    <div className="bg-amber-950 text-amber-300 px-4 py-1.5 rounded-full text-base font-black flex items-center gap-2 shadow-lg">
                      <Star className="w-5 h-5 fill-amber-300" />
                      {top3[0].stars}
                    </div>
                 </ExplorerCard>
               </motion.div>
             )}

             {/* 3rd Place */}
             {top3[2] && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center group">
                 <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform">{top3[2].avatar}</div>
                 <ExplorerCard padding="sm" className={cn("w-full h-28 flex flex-col items-center justify-center text-center relative border-orange-200 bg-orange-50 shadow-orange-100", top3[2].isCurrentUser && "ring-4 ring-amber-400 border-amber-500")}>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-100 border-2 border-orange-400 text-orange-700 flex items-center justify-center font-black text-xs">3</div>
                    <p className="text-xs font-black text-orange-800 truncate w-full mb-2">{top3[2].name}</p>
                    <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1.5 shadow-inner-soft">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      {top3[2].stars}
                    </div>
                 </ExplorerCard>
               </motion.div>
             )}
          </div>

          {/* Current Rank Quick Status */}
          {myRankIndex >= 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-2">
              <div className="bg-amber-950/90 text-white p-5 rounded-[32px] shadow-xl flex items-center justify-between border-4 border-amber-400/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner-soft">#{myRankIndex + 1}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Your Current Rank</p>
                    <p className="text-lg font-black tracking-tight">You're making great progress!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20 shadow-inner-soft">
                  <ChevronUp className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <span className="font-black text-xl tabular-nums">{userStars}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Rest of the Table */}
          <ExplorerCard padding="sm" className="bg-white/80 backdrop-blur-md">
            <div className="px-4 py-2 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] flex items-center justify-between border-b border-stone-100 mb-4">
               <span>Explorer Rank</span>
               <div className="flex gap-10">
                 <span>Streak</span>
                 <span>Stars</span>
                 <span>Cheer</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              {rest.map((l, idx) => {
                const rank = idx + 4;
                const cheeredCount = cheeredIds[l.id] || 0;
                return (
                  <motion.div
                    key={l.id}
                    whileHover={{ x: 5 }}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-3xl border-2 transition-all",
                      l.isCurrentUser ? "bg-amber-50 border-amber-300 shadow-md" : "bg-white border-stone-100 hover:border-amber-100"
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                       <span className="w-6 text-center text-xs font-black text-stone-300">#{rank}</span>
                       <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl shadow-inner-soft shrink-0">{l.avatar}</div>
                       <div className="min-w-0">
                         <p className={cn("text-sm font-black truncate", l.isCurrentUser ? "text-amber-950" : "text-stone-800")}>{l.name}</p>
                         <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{l.league} League</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                       <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-xl text-xs font-black">
                         <Flame className="w-3.5 h-3.5 fill-orange-400" />
                         {l.streak}d
                       </div>
                       <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl text-sm font-black shadow-sm">
                         <Star className="w-4 h-4 fill-amber-950" />
                         {l.stars}
                       </div>
                       <ExplorerButton variant="glass" size="sm" className="rounded-xl border-b-2" onClick={() => handleHighFive(l.id)}>
                         <span>✋</span>
                         <span className="tabular-nums">{l.highFives + cheeredCount}</span>
                       </ExplorerButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ExplorerCard>
        </div>
      )}
    </div>
  );
};
