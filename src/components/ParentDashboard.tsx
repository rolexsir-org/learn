import React, { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, Share2, Award, Clock, X, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import CharacterCollection from './CharacterCollection';
import MyWordsList from './MyWordsList';
const PhonicsRadarChart = lazy(() => import('./PhonicsRadarChart'));
import { DeviceService } from '../services/DeviceService';
import { AudioManager, type AudioPreferences, type MusicPlaybackStatus } from '../services/AudioManager';
import { SpeechService, type AvailableSpeechVoice } from '../services/SpeechService';

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
  soundEnabled: boolean;
  onToggleSound: () => void;
  audioPreferences: AudioPreferences;
  onAudioPreferencesChange: (patch: Partial<AudioPreferences>) => void;
}

const formatAudioTime = (time: number) => `${Math.floor((time || 0) / 60)}:${String(Math.floor((time || 0) % 60)).padStart(2, '0')}`;

export default function ParentDashboard({ stats, onClose, onUnlockCharacter, soundEnabled, onToggleSound, audioPreferences, onAudioPreferencesChange }: ParentDashboardProps) {
  const [availableVoices, setAvailableVoices] = useState<AvailableSpeechVoice[]>([]);
  const [musicPlayback, setMusicPlayback] = useState<MusicPlaybackStatus>(() => AudioManager.getPlaybackStatus());
  const [unlockedGate, setUnlockedGate] = useState(false);
  const [numA] = useState(() => Math.floor(Math.random() * 5) + 3);
  const [numB] = useState(() => Math.floor(Math.random() * 4) + 2);
  const [parentAnswer, setParentAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'collection' | 'words' | 'settings'>('stats');

  React.useEffect(() => SpeechService.subscribeVoices(setAvailableVoices), []);
  React.useEffect(() => AudioManager.subscribePlayback(setMusicPlayback), []);

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={unlockedGate ? 'parent-dashboard-title' : 'parent-gate-title'}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden border-4 border-stone-200 max-h-[90vh] flex flex-col"
      >
        {!unlockedGate ? (
          /* Parent Gate Security Screen */
          <div className="p-8 md:p-10 text-center relative flex flex-col items-center justify-center min-h-[380px]">
            <button
              type="button"
              aria-label="Close parent dashboard"
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6 text-stone-500" />
            </button>

            <div className="w-16 h-16 bg-sky-100 rounded-3xl flex items-center justify-center mb-4 border-2 border-sky-200">
              <ShieldCheck className="w-8 h-8 text-sky-600" />
            </div>

            <h2 id="parent-gate-title" className="text-2xl font-black text-stone-800 uppercase tracking-tight mb-1">Grown-Ups Only</h2>
            <p className="text-stone-500 font-bold text-xs uppercase tracking-wider max-w-xs mb-6">
              Please solve this quick math problem to open Parent Settings & Analytics.
            </p>

            <form onSubmit={handleGateSubmit} className="w-full max-w-xs space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 text-center">
                <span id="parent-math-challenge" className="text-2xl font-black text-stone-800">
                  What is {numA} + {numB} ?
                </span>
              </div>

              <input
                type="number"
                aria-label="Answer to the parent check"
                aria-describedby={`parent-math-challenge${gateError ? ' parent-gate-error' : ''}`}
                value={parentAnswer}
                onChange={(e) => setParentAnswer(e.target.value)}
                placeholder="Enter answer"
                autoFocus
                className="w-full text-center text-xl font-black p-3 bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-sky-500"
              />

              {gateError && (
                <p id="parent-gate-error" role="alert" className="text-red-500 text-xs font-bold uppercase">Incorrect, please try again!</p>
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
                type="button"
                aria-label="Close parent dashboard"
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
                  <h2 id="parent-dashboard-title" className="text-2xl font-black tracking-tight uppercase text-stone-800">Parent Dashboard</h2>
                  <p className="text-stone-500 font-bold text-xs uppercase tracking-wider">Learning Metrics & Insights</p>
                </div>
              </div>

              <div role="tablist" aria-label="Parent dashboard sections" className="grid grid-cols-4 gap-1 rounded-2xl bg-stone-100 p-1">
                {([
                  ['stats', 'Overview'],
                  ['collection', 'Characters'],
                  ['words', 'Words'],
                  ['settings', 'Settings'],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    id={`parent-tab-${tab}`}
                    role="tab"
                    aria-controls="parent-settings-panel"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`min-h-10 rounded-xl px-2 py-2 text-[10px] font-semibold transition-colors sm:text-xs ${activeTab === tab ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div
              id="parent-settings-panel"
              role="tabpanel"
              aria-labelledby={`parent-tab-${activeTab}`}
              tabIndex={0}
              className="p-6 overflow-y-auto flex-1 max-h-[450px] focus:outline-none"
            >
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

                    <Suspense fallback={<div className="h-64" role="status">Loading learning insights…</div>}>
                      <PhonicsRadarChart completedWords={stats.completedWords || []} />
                    </Suspense>

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
                ) : activeTab === 'words' ? (
                  <motion.div
                    key="words-content"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                  >
                    <MyWordsList completedWords={stats.completedWords || []} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="settings-content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    <section aria-labelledby="parent-settings-title" className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
                            {soundEnabled ? <Volume2 aria-hidden="true" size={19} /> : <VolumeX aria-hidden="true" size={19} />}
                          </span>
                          <div>
                            <h3 id="parent-settings-title" className="m-0 text-sm font-semibold text-stone-800">All learning audio</h3>
                            <p className="mb-0 mt-1 text-xs leading-relaxed text-stone-500">Mute or unmute music, effects and narration.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-label="All learning audio"
                          aria-checked={soundEnabled}
                          onClick={onToggleSound}
                          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-700' : 'bg-stone-300'}`}
                        >
                          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <label className="flex items-center justify-between gap-4 border-t border-stone-100 pt-4 text-sm font-medium text-stone-700">
                        Background learning music
                        <input type="checkbox" checked={audioPreferences.musicEnabled} onChange={(event) => onAudioPreferencesChange({ musicEnabled: event.target.checked })} className="h-5 w-5 accent-emerald-700" />
                      </label>
                      <p className="-mt-4 text-xs text-stone-500">Music starts only after you turn it on. It pauses during narration and when the app is in the background.</p>
                      <div className="rounded-xl bg-stone-50 p-3">
                        <label className="sr-only" htmlFor="music-progress">Music playback position</label>
                        <input id="music-progress" type="range" min="0" max={Math.max(1, musicPlayback.duration)} step="0.1" value={Math.min(musicPlayback.currentTime, musicPlayback.duration || 1)} disabled={!musicPlayback.duration} onChange={(event) => AudioManager.seekMusic(Number(event.target.value))} className="w-full accent-emerald-700" />
                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span>{formatAudioTime(musicPlayback.currentTime)}</span>
                          <span>{musicPlayback.scene === 'story' ? 'Story music' : musicPlayback.scene === 'game' ? 'Game music' : musicPlayback.scene === 'world' ? 'World ambience' : 'Calm learning music'}</span>
                          <span>{formatAudioTime(musicPlayback.duration)}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button type="button" disabled={!audioPreferences.musicEnabled} onClick={() => musicPlayback.isPlaying ? AudioManager.pauseMusic() : AudioManager.resumeMusic()} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 disabled:opacity-40">{musicPlayback.isPlaying ? 'Pause music' : 'Resume music'}</button>
                          <button type="button" disabled={!audioPreferences.musicEnabled} onClick={() => AudioManager.replayMusic()} className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 disabled:opacity-40">Replay music</button>
                        </div>
                      </div>

                      {([
                        ['Music volume', 'musicVolume'],
                        ['Sound effects', 'effectsVolume'],
                        ['Voice narration', 'voiceVolume'],
                      ] as const).map(([label, key]) => (
                        <label key={key} className="block text-xs font-medium text-stone-700">
                          <span className="mb-1 flex justify-between"><span>{label}</span><span>{Math.round(audioPreferences[key] * 100)}%</span></span>
                          <input type="range" min="0" max="1" step="0.01" value={audioPreferences[key]} aria-label={label} onChange={(event) => onAudioPreferencesChange({ [key]: Number(event.target.value) })} className="w-full accent-emerald-700" />
                        </label>
                      ))}

                      <label className="block text-xs font-medium text-stone-700">
                        <span className="mb-1 flex justify-between"><span>Speaking pace</span><span>{audioPreferences.speechRate.toFixed(1)}×</span></span>
                        <input type="range" min="0.6" max="1.2" step="0.05" value={audioPreferences.speechRate} aria-label="Speaking pace" onChange={(event) => onAudioPreferencesChange({ speechRate: Number(event.target.value) })} className="w-full accent-emerald-700" />
                      </label>

                      <label className="block text-xs font-medium text-stone-700" htmlFor="audio-voice-choice">English voice</label>
                      <select id="audio-voice-choice" value={audioPreferences.voiceURI || ''} onChange={(event) => {
                        const voice = availableVoices.find((candidate) => candidate.voiceURI === event.target.value);
                        onAudioPreferencesChange({ voiceURI: voice?.voiceURI || null, voiceLocale: voice?.lang === 'en-GB' ? 'en-GB' : voice?.lang === 'en-US' ? 'en-US' : 'device' });
                      }} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800">
                        <option value="">Device default English voice</option>
                        {availableVoices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}{voice.localService ? ' · on device' : ''}</option>)}
                      </select>
                      <p className="m-0 text-xs leading-relaxed text-stone-500">Only English voices supplied by this device/browser are listed. Accent choices depend on installed voices; no voice is downloaded by LEARN.</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => SpeechService.speak('Hello! Let us learn a new word together.')} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Preview voice</button>
                        <button type="button" onClick={() => SpeechService.pause()} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700">Pause</button>
                        <button type="button" onClick={() => SpeechService.resume()} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700">Resume</button>
                        <button type="button" onClick={() => SpeechService.stop()} className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700">Stop</button>
                      </div>
                      {availableVoices.length === 0 && <p role="status" className="m-0 text-xs text-amber-800">No British or American English voices were reported by this browser. Its default speech voice may still be available.</p>}
                    </section>
                    <section aria-labelledby="privacy-settings-title" className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <h3 id="privacy-settings-title" className="m-0 text-sm font-semibold text-stone-800">A private learning space</h3>
                      <p className="mb-0 mt-2 text-xs leading-relaxed text-stone-600">This app currently uses an anonymous learner account. Other children's profiles are not shown on the practice board. Parent account linking and consent controls are not yet available.</p>
                    </section>
                    <p className="m-0 text-[11px] leading-relaxed text-stone-400">Motion follows your device’s Reduce Motion preference.</p>
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
