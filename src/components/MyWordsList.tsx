import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Calendar, Award, Search, X, Volume2, Sparkles } from 'lucide-react';
import { SpeechService } from '../services/SpeechService';

interface CompletedWord {
  word: string;
  timestamp: string;
  accuracy: number;
}

interface MyWordsListProps {
  completedWords: CompletedWord[];
}

export default function MyWordsList({ completedWords }: MyWordsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWords = completedWords.filter(item =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const speak = (text: string) => {
    SpeechService.speak(text, { rate: 0.85, pitch: 1.1 });
  };

  if (!completedWords || completedWords.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-[32px] border-4 border-stone-100 shadow-sm">
        <div className="w-20 h-20 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-sky-200 text-4xl animate-bounce">
          📚
        </div>
        <h3 className="font-black text-stone-800 text-xl uppercase tracking-tight mb-2">My Word Vault is Empty!</h3>
        <p className="text-stone-500 font-bold text-xs uppercase tracking-wider max-w-xs mx-auto leading-relaxed">
          Play spelling games to collect words and build your magic dictionary!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white p-5 md:p-6 rounded-[32px] border-4 border-stone-100 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learned words..."
            className="w-full pl-10 pr-10 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl text-xs font-bold text-stone-800 placeholder-stone-400 focus:outline-none focus:border-sky-400 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <span className="text-xs font-black bg-sky-100 text-sky-800 px-3.5 py-3 rounded-2xl border border-sky-200 whitespace-nowrap shadow-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          {filteredWords.length} / {completedWords.length}
        </span>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {filteredWords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-stone-400 font-bold text-xs uppercase tracking-wider">No matching words found</p>
          </div>
        ) : (
          filteredWords.map((item, index) => {
            const dateStr = item.timestamp
              ? new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'Recent';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3.5 bg-gradient-to-r from-stone-50 to-amber-50/30 hover:from-white hover:to-white rounded-2xl border-2 border-stone-200 shadow-xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-300 shadow-xs">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-800 text-base md:text-lg uppercase tracking-wider">
                      {item.word}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speak(item.word)}
                    className="w-9 h-9 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl flex items-center justify-center border border-sky-300 transition-all active:scale-90"
                    title="Speak word"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-xs font-black text-amber-900">{item.accuracy}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
