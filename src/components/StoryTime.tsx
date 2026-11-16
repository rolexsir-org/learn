import { useMascot } from '../context/MascotContext';
import { soundFx } from '../utils/audio';
import { fireWordCompleteConfetti, fireTreasureChestConfetti } from '../utils/confetti';
import { SpeechService } from '../services/SpeechService';
import { ExplorerButton, ExplorerCard, IconBadge } from './UiCore';

interface StoryTimeProps {
  completedWords: { word: string; timestamp: string; accuracy: number }[];
  soundEnabled: boolean;
  onRewardStars?: (stars: number) => void;
}

export const StoryTime: React.FC<StoryTimeProps> = ({
  completedWords,
  onRewardStars
}) => {
  const { mascotName, mascotEmoji, showThoughtBubble } = useMascot();

  const masteredWordStrings = (completedWords || []).map((w) => w.word.toUpperCase());

  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  // Auto-generate story on load
  useEffect(() => {
    handleGenerateStory();
    return () => {
      SpeechService.stop();
    };
  }, []);

  const handleGenerateStory = async () => {
    SpeechService.stop();
    setIsNarrating(false);
    setIsGenerating(true);
    setCurrentPage(0);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setQuestionAnswered(false);

    soundFx.playPop();
    showThoughtBubble(`I'm writing a brand new story using your mastered words! 🧙‍♂️✨`, 'excited');

    try {
      const newStory = await generateStoryFromWords(masteredWordStrings);
      setStory(newStory);
      showThoughtBubble(`Here is your special story: ${newStory.title}! Tap "Narrate Story" to listen! 📖`, 'happy');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const speakText = (text: string, onEndCallback?: () => void) => {
    SpeechService.speak(text, {
      rate: 0.82,
      pitch: 1.1,
      onStart: () => setIsNarrating(true),
      onEnd: () => {
        setIsNarrating(false);
        if (onEndCallback) onEndCallback();
      },
      onError: () => setIsNarrating(false)
    });
  };

  const handleNarrateCurrentPage = () => {
    if (!story) return;
    if (isNarrating) {
      SpeechService.stop();
      setIsNarrating(false);
      return;
    }

    const pageText = story.pages[currentPage]?.text || '';
    speakText(pageText);
  };

  const handleNextPage = () => {
    if (!story) return;
    SpeechService.stop();
    setIsNarrating(false);

    if (currentPage < story.pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
      soundFx.playCorrect();
    }
  };

  const handlePrevPage = () => {
    if (!story) return;
    SpeechService.stop();
    setIsNarrating(false);

    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      soundFx.playPop();
    }
  };

  const handleAnswerQuestion = (index: number) => {
    if (!story || questionAnswered) return;

    setSelectedOption(index);
    const correctIndex = story.interactiveQuestion?.correctIndex ?? 0;
    const correct = index === correctIndex;
    setIsAnswerCorrect(correct);
    setQuestionAnswered(true);

    if (correct) {
      fireTreasureChestConfetti();
      soundFx.playSuccessFanfare();
      showThoughtBubble(`Hooray! You answered correctly! You earned +10 Stars! 🌟`, 'proud');
      if (onRewardStars) onRewardStars(10);
    } else {
      soundFx.playIncorrect();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-15 pointer-events-none select-none">
          📖
        </div>

        <div className="space-y-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-200 border border-white/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" /> Story Time Theater
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Magic Stories with Mastered Words
          </h2>
          <p className="text-xs md:text-sm text-purple-100 font-medium max-w-lg">
            Listen as {mascotName} weaves your child's mastered vocabulary into personalized interactive tales!
          </p>
        </div>

        {/* Generate Story CTA */}
        <button
          onClick={handleGenerateStory}
          disabled={isGenerating}
          className="z-10 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs md:text-sm uppercase tracking-wider rounded-2xl border-b-4 border-amber-600 shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Wand2 className={`w-5 h-5 text-amber-950 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Creating Story...' : 'Generate New Story'}</span>
        </button>
      </div>

      {/* Mastered Words Ribbon */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Mastered Words Featured ({masteredWordStrings.length})</span>
          </p>
          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Personalized with AI
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {masteredWordStrings.length > 0 ? (
            masteredWordStrings.map((word, idx) => (
              <span
                key={idx}
                onClick={() => speakText(word)}
                className="px-3 py-1.5 bg-gradient-to-b from-amber-100 to-yellow-200 text-amber-950 text-xs font-black rounded-xl border border-amber-300/80 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                title="Tap to pronounce"
              >
                <span>{word}</span>
                <Volume2 className="w-3 h-3 text-amber-700" />
              </span>
            ))
          ) : (
            <p className="text-xs text-stone-400 italic">
              Spell words in Adventure mode to add them to your story collection!
            </p>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="bg-white rounded-[36px] p-12 border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-7xl"
          >
            {mascotEmoji}
          </motion.div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-stone-800">
              {mascotName} is crafting your story...
            </h3>
            <p className="text-xs font-bold text-stone-400">
              Weaving together your mastered vocabulary into an adventure!
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-150" />
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping delay-300" />
          </div>
        </div>
      )}

      {/* Story Book Card */}
      {!isGenerating && story && (
        <div className="bg-white rounded-[36px] border-4 border-amber-300 shadow-2xl overflow-hidden relative">
          {/* Story Title & Mascot Header */}
          <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-100 px-6 py-4 border-b-2 border-amber-300 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl drop-shadow-xs">{story.themeEmoji}</span>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-amber-950 uppercase tracking-tight">
                  {story.title}
                </h3>
                <p className="text-xs font-bold text-amber-800">
                  Read by {mascotName} {mascotEmoji}
                </p>
              </div>
            </div>

            {/* Narrate Button */}
            <button
              onClick={handleNarrateCurrentPage}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2 shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                isNarrating
                  ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                  : 'bg-white text-stone-800 border-amber-400 hover:bg-amber-50'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isNarrating ? 'text-white' : 'text-amber-600'}`} />
              <span>{isNarrating ? 'Pause Reading' : 'Narrate Page'}</span>
            </button>
          </div>

          {/* Story Page Body */}
          <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-[280px] text-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 max-w-xl mx-auto"
              >
                {/* Page Emoji / Illustration Badge */}
                <motion.div
                  animate={isNarrating ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-24 h-24 md:w-32 md:h-32 bg-amber-50 rounded-full border-4 border-amber-300 shadow-inner flex items-center justify-center text-6xl md:text-7xl mx-auto"
                >
                  {story.pages[currentPage]?.emoji || '📖'}
                </motion.div>

                {/* Page Text with Highlighted Mastered Words */}
                <div className="text-xl md:text-2xl font-black text-stone-800 leading-relaxed md:leading-loose">
                  {(story.pages[currentPage]?.text || '').split(' ').map((word, wIdx) => {
                    const cleanWord = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
                    const isMastered = masteredWordStrings.includes(cleanWord);

                    if (isMastered) {
                      return (
                        <span
                          key={wIdx}
                          onClick={() => {
                            soundFx.playChime(soundEnabled);
                            speakText(cleanWord);
                            fireWordCompleteConfetti();
                          }}
                          className="inline-block mx-1 px-3 py-1 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 font-black rounded-xl border-b-3 border-amber-600 shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          title={`Mastered Word: ${cleanWord} - Tap to hear!`}
                        >
                          {word}{' '}
                        </span>
                      );
                    }
                    return <span key={wIdx}>{word} </span>;
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page Navigation Controls */}
          <div className="bg-stone-50 px-6 py-4 border-t-2 border-stone-200 flex items-center justify-between">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="px-4 py-2.5 bg-white hover:bg-stone-100 disabled:opacity-30 text-stone-700 font-black text-xs uppercase tracking-wider rounded-xl border-2 border-stone-300 shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {/* Page Dots Indicator */}
            <div className="flex items-center gap-2">
              {(story?.pages || []).map((_, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => {
                    setCurrentPage(pIdx);
                    window.speechSynthesis?.cancel();
                    setIsNarrating(false);
                  }}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    pIdx === currentPage
                      ? 'bg-amber-500 scale-125'
                      : 'bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= (story?.pages?.length || 1) - 1}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-amber-950 font-black text-xs uppercase tracking-wider rounded-xl border-b-3 border-amber-600 shadow-xs flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Comprehension Quiz Section (Final Page Reward) */}
          {currentPage === story.pages.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 bg-gradient-to-b from-purple-50 to-indigo-50 border-t-4 border-indigo-200 text-center space-y-4"
            >
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200">
                <HelpCircle className="w-4 h-4 text-indigo-600" /> Interactive Story Challenge
              </div>

              <h4 className="text-lg md:text-xl font-black text-stone-800">
                {story.interactiveQuestion?.question || 'What happened in the story?'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-xl mx-auto">
                {(story.interactiveQuestion?.options || []).map((option, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === (story.interactiveQuestion?.correctIndex ?? 0);

                  let styleClass = 'bg-white hover:bg-indigo-50 border-2 border-stone-200 text-stone-800';
                  if (questionAnswered) {
                    if (isCorrect) {
                      styleClass = 'bg-emerald-500 text-white border-emerald-700 shadow-md scale-105';
                    } else if (isSelected) {
                      styleClass = 'bg-rose-400 text-white border-rose-600 opacity-60';
                    } else {
                      styleClass = 'bg-stone-100 text-stone-400 border-stone-200 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={questionAnswered}
                      onClick={() => handleAnswerQuestion(oIdx)}
                      className={`p-3.5 rounded-2xl font-black text-xs md:text-sm transition-all shadow-xs cursor-pointer active:scale-95 flex items-center justify-center text-center ${styleClass}`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {questionAnswered && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl text-xs md:text-sm font-black border max-w-md mx-auto flex items-center justify-center gap-2 ${
                    isAnswerCorrect
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border-amber-300'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{story.interactiveQuestion.explanation}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryTime;
