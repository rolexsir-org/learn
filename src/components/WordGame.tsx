import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Sparkles, Lightbulb, RefreshCw, ArrowRight, Grid, Type, Mic, MicOff, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { WordItem, INITIAL_WORDS, MOTIVATIONAL_QUOTES } from '../constants';
import { getWordMeaningSimple } from '../lib/gemini';
import { fireWordCompleteConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audio';
import { SpeechService } from '../services/SpeechService';
import { AudioManager } from '../services/AudioManager';
import { ExplorerButton, ExplorerCard, ProgressPill } from './UiCore';
import { cn } from '../lib/utils';

interface WordGameProps {
  onComplete: (wordId: string, accuracy: number, speed: number) => void;
  soundEnabled: boolean;
  activeWordIndex?: number;
  wordsList?: WordItem[];
  onNextWord?: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function WordGame({
  onComplete,
  soundEnabled,
  activeWordIndex = 0,
  wordsList = INITIAL_WORDS,
  onNextWord
}: WordGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(activeWordIndex);
  const [userSlots, setUserSlots] = useState<(string | null)[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [useFullAlphabet, setUseFullAlphabet] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'try-again'>('none');
  const [showMeaning, setShowMeaning] = useState(false);
  const [meaningText, setMeaningText] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [hintActive, setHintActive] = useState(false);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [showCelebrationSequence, setShowCelebrationSequence] = useState(false);
  const [celebrationParticles, setCelebrationParticles] = useState<Array<{ id: number; emoji: string; x: number; y: number; scale: number; rotate: number }>>([]);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechModalOpen, setSpeechModalOpen] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<{
    message: string;
    isMatch: boolean;
    accuracyScore?: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setCurrentWordIndex(activeWordIndex);
  }, [activeWordIndex]);

  const safeWordsList = (wordsList && wordsList.length > 0) ? wordsList : INITIAL_WORDS;
  const safeIndex = (isNaN(currentWordIndex) || currentWordIndex < 0) ? 0 : Math.abs(currentWordIndex) % safeWordsList.length;
  const currentWord: WordItem = safeWordsList[safeIndex] || INITIAL_WORDS[0];
  const targetPhonics = currentWord.phonics || currentWord.text.split('');

  useEffect(() => {
    initWord();
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [currentWord.id]);

  const initWord = () => {
    setUserSlots(Array(targetPhonics.length).fill(null));
    const letters = [...targetPhonics];
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    setScrambledLetters(letters);
    setFeedback('none');
    setShowMeaning(false);
    setShowCelebrationSequence(false);
    setHintActive(false);
    setSpeechModalOpen(false);
    setIsListening(false);
    setStartTime(Date.now());
  };

  const processPronunciation = (transcript: string) => {
    const text = transcript.toLowerCase().trim();
    const target = currentWord.text.toLowerCase().trim();
    const isExactMatch = text.includes(target);

    if (isExactMatch) {
      soundFx.playCorrect();
      setSpeechFeedback({
        message: `🌟 Perfect! You said "${currentWord.text}" correctly!`,
        isMatch: true
      });
      setUserSlots(targetPhonics);
      setTimeout(() => {
        setSpeechModalOpen(false);
        handleSuccess();
      }, 1500);
    } else {
      soundFx.playIncorrect();
      setSpeechFeedback({
        message: `I heard "${transcript}". Try saying "${currentWord.text}" again! 📢`,
        isMatch: false
      });
    }
  };

  const startListening = () => {
    soundFx.playPop();
    setSpeechModalOpen(true);
    setSpeechFeedback(null);
    setSpeechTranscript('');

    const activeListener = SpeechService.listen({
      lang: 'en-US',
      onStart: () => setIsListening(true),
      onResult: (t, isFinal) => {
        setSpeechTranscript(t);
        if (isFinal) processPronunciation(t);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
    });
    recognitionRef.current = activeListener;
  };

  const speak = (text: string) => {
    SpeechService.speak(text, { pitch: 1.05 });
  };

  const handleSuccess = async () => {
    setFeedback('success');
    setShowCelebrationSequence(true);
    fireWordCompleteConfetti();
    soundFx.playSuccessFanfare();

    const emojis = ['⭐', '🌟', '✨', '🎉', '🏆', '👑', '🎈', '💖'];
    setCelebrationParticles(Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 300 - 50,
      scale: Math.random() * 0.5 + 1,
      rotate: (Math.random() - 0.5) * 720
    })));

    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setEncouragement(randomQuote);
    SpeechService.speak(currentWord.text, { pitch: 1.05, onEnd: () => AudioManager.playCelebration() });

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    onComplete(currentWord.id, 100, timeSpent);

    try {
      const meaning = await getWordMeaningSimple(currentWord.text);
      setMeaningText(meaning);
    } catch (e) {
      setMeaningText(currentWord.hintSentence || `A brilliant word!`);
    }

    setTimeout(() => {
      setShowMeaning(true);
      setShowCelebrationSequence(false);
    }, 2000);
  };

  const nextWord = () => {
    soundFx.playNav();
    if (onNextWord) onNextWord();
    else setCurrentWordIndex((prev) => (prev + 1) % wordsList.length);
  };

  const findDropSlotIndex = (point: { x: number; y: number }) => {
    for (let i = 0; i < slotRefs.current.length; i++) {
      const ref = slotRefs.current[i];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) return i;
      }
    }
    return -1;
  };

  const placeLetterInSlot = (letter: string, targetSlotIndex?: number) => {
    const letterUpper = letter.toUpperCase();
    speak(letterUpper);

    let destIndex = targetSlotIndex;
    if (destIndex === undefined || destIndex < 0) destIndex = userSlots.findIndex((s) => s === null);
    if (destIndex === -1 || destIndex >= userSlots.length) return;

    const newSlots = [...userSlots];
    newSlots[destIndex] = letterUpper;
    setUserSlots(newSlots);

    const fullText = newSlots.join('');
    if (fullText === currentWord.text) {
      handleSuccess();
    } else if (newSlots.every((s) => s !== null)) {
      setFeedback('try-again');
      soundFx.playIncorrect();
    } else {
      soundFx.playCorrect();
    }
  };

  const clearSlot = (index: number) => {
    soundFx.playPop();
    const copy = [...userSlots];
    copy[index] = null;
    setUserSlots(copy);
    setFeedback('none');
  };

  const getLetterColor = (index: number) => {
    const colors = [
      'from-orange-400 to-amber-500 border-amber-600',
      'from-sky-400 to-blue-500 border-blue-600',
      'from-emerald-400 to-green-500 border-emerald-600',
      'from-purple-400 to-indigo-500 border-indigo-600',
      'from-rose-400 to-pink-500 border-pink-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      <ExplorerCard className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!showMeaning ? (
            <motion.div
              key={`game-${currentWord.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <div className="bg-amber-100/80 px-5 py-2 rounded-2xl border-2 border-amber-200 flex items-center gap-3">
                  <span className="text-3xl animate-float">{currentWord.emoji}</span>
                  <span className="font-black text-amber-900 text-sm uppercase tracking-widest">
                    Level {currentWordIndex + 1}
                  </span>
                </div>

                <ExplorerButton variant="glass" size="icon" onClick={() => speak(currentWord.text)}>
                  <Volume2 className="w-6 h-6" />
                </ExplorerButton>
              </div>

              {/* Slot Grid */}
              <div className="mb-12 w-full">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Complete the Word
                  </span>
                  <button
                    onClick={() => { soundFx.playPop(); setHintActive(!hintActive); }}
                    className="ml-4 p-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-600 border border-amber-200 transition-colors"
                  >
                    <Lightbulb className={cn("w-4 h-4", hintActive && "fill-amber-400")} />
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 md:gap-5">
                  {targetPhonics.map((char, i) => (
                    <motion.div
                      key={`slot-${i}`}
                      ref={(el) => { slotRefs.current[i] = el; }}
                      onClick={() => userSlots[i] && clearSlot(i)}
                      className={cn(
                        "w-16 h-22 md:w-24 md:h-32 rounded-[24px] border-4 flex items-center justify-center text-4xl md:text-5xl font-black transition-all cursor-pointer soft-3d",
                        userSlots[i]
                          ? "bg-gradient-to-b from-white to-stone-50 border-amber-400 text-stone-800"
                          : "bg-stone-50/50 border-dashed border-stone-200 text-stone-200"
                      )}
                    >
                      {userSlots[i] || (hintActive && i === 0 ? char : '')}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Letter Bank */}
              <div className="w-full flex flex-col items-center gap-6">
                <div className="flex gap-2 bg-stone-100/80 p-1 rounded-2xl border border-stone-200">
                  <button onClick={() => setUseFullAlphabet(false)} className={cn("px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all", !useFullAlphabet ? "bg-white shadow-md text-amber-900" : "text-stone-400")}>Scrambled</button>
                  <button onClick={() => setUseFullAlphabet(true)} className={cn("px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all", useFullAlphabet ? "bg-white shadow-md text-amber-900" : "text-stone-400")}>Keyboard</button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl">
                  {(useFullAlphabet ? ALPHABET : scrambledLetters).map((letter, idx) => (
                    <motion.div
                      key={`${letter}-${idx}`}
                      drag
                      dragSnapToOrigin
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      whileTap={{ scale: 0.9 }}
                      onDragEnd={(_, info) => {
                        const slotIdx = findDropSlotIndex(info.point);
                        if (slotIdx !== -1) placeLetterInSlot(letter, slotIdx);
                      }}
                      onClick={() => placeLetterInSlot(letter)}
                      className={cn(
                        "w-14 h-18 md:w-16 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black text-white shadow-soft-3d border-b-6 gpu-accelerated cursor-grab active:cursor-grabbing bg-gradient-to-b",
                        getLetterColor(idx)
                      )}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Game Actions */}
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <ExplorerButton variant="secondary" onClick={startListening}>
                  <Mic className="w-5 h-5 animate-pulse" />
                  Speak It
                </ExplorerButton>
                <ExplorerButton variant="ghost" onClick={initWord} size="icon">
                  <RefreshCw className="w-5 h-5" />
                </ExplorerButton>
              </div>
            </motion.div>
          ) : (
            /* Mastery Screen */
            <motion.div
              key="mastery"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 text-center max-w-lg mx-auto"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl md:text-9xl mb-6 drop-shadow-soft-3d-lg"
              >
                {currentWord.emoji}
              </motion.div>

              <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full font-black text-sm uppercase tracking-[0.2em] border-2 border-emerald-200 mb-4 shadow-sm">
                Word Mastered!
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-4">
                {currentWord.text}
              </h2>

              <ExplorerCard padding="sm" className="mb-10 bg-amber-50/50 border-amber-100 shadow-none">
                <p className="text-lg md:text-xl font-bold text-stone-600 leading-relaxed italic">
                  "{meaningText}"
                </p>
              </ExplorerCard>

              <ExplorerButton variant="success" size="lg" onClick={nextWord} fullWidth>
                <span>Keep Exploring</span>
                <ArrowRight className="w-6 h-6" />
              </ExplorerButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Particles Overlay */}
        <AnimatePresence>
          {showCelebrationSequence && (
            <div className="absolute inset-0 pointer-events-none z-50">
              {celebrationParticles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: p.scale, x: p.x, y: p.y, rotate: p.rotate }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 text-4xl"
                >
                  {p.emoji}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ExplorerCard>

      {/* Mic Modal */}
      <AnimatePresence>
        {speechModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full"
            >
              <ExplorerCard className="text-center relative pt-12">
                <button onClick={() => setSpeechModalOpen(false)} className="absolute top-6 right-6 p-2 text-stone-300 hover:text-stone-600"><Trash2 className="w-6 h-6" /></button>
                <div className="text-6xl mb-6 animate-bounce-subtle">{currentWord.emoji}</div>
                <h3 className="text-2xl mb-2 uppercase tracking-tight">Say "{currentWord.text}"</h3>
                <p className="text-stone-400 text-sm font-bold mb-8">Speak clearly into the mic!</p>

                <div className="flex justify-center mb-10">
                  <div className="relative">
                    {isListening && (
                      <motion.div
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-amber-400 rounded-full"
                      />
                    )}
                    <button className={cn("relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-all", isListening ? "bg-rose-500 text-white" : "bg-amber-400 text-amber-950")}>
                      {isListening ? <Mic className="w-10 h-10 animate-pulse" /> : <MicOff className="w-10 h-10" />}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl min-h-[60px] flex items-center justify-center border-2 border-stone-100">
                   <p className="text-lg font-black text-stone-800 italic">{speechTranscript || 'Waiting for you...'}</p>
                </div>

                {speechFeedback && (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn("mt-6 p-4 rounded-2xl border-2 font-bold", speechFeedback.isMatch ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800")}>
                    {speechFeedback.message}
                  </motion.div>
                )}
              </ExplorerCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
