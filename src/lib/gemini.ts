export interface StoryPage {
  text: string;
  emoji: string;
  targetWord?: string;
}

export interface GeneratedStory {
  title: string;
  themeEmoji: string;
  pages: StoryPage[];
  usedWords: string[];
  interactiveQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const DICTIONARY_MAP: Record<string, string> = {
  CAT: "A friendly furry pet that loves to play and purr!",
  DOG: "A loyal pet that wags its tail and barks happily!",
  SUN: "The bright warm star in the sky that lights up our day!",
  STAR: "A shiny twinkling light in the night sky!",
  MOON: "The glowing white circle that shines high in the night sky!",
  FISH: "A colorful animal that swims gracefully in water!",
  BIRD: "A cheerful feathered friend that sings songs and flies high!",
  TREE: "A tall green plant with thick branches and leafy shade!",
  BOOK: "A fun collection of pages filled with exciting stories!",
  MILK: "A healthy white drink that gives you strong bones!",
  PARK: "A fun grassy place with swings, slides, and trees!",
  PLAY: "Having fun with games, toys, and friends!",
  RUN: "Moving your feet quickly on a fun outdoor adventure!",
  DUCK: "A cute bird that swims in pones and says quack quack!",
  FROG: "A green jumper that leaps high on lily pads!",
  LION: "A brave king of the jungle with a big fluffy mane!",
  BEAR: "A big cozy woodland animal that loves sweet honey!",
  RAIN: "Fresh cool water droplets falling softly from clouds!",
  WIND: "A gentle breeze blowing through leaves and fields!"
};

export async function getWordRecommendation(masteredWords: string[], _accuracy: number): Promise<string[]> {
  const allCandidates = ['CAT', 'DOG', 'SUN', 'STAR', 'MOON', 'FISH', 'BIRD', 'TREE', 'BOOK', 'PARK', 'PLAY', 'RUN'];
  const masteredSet = new Set((masteredWords || []).map(w => w.toUpperCase()));
  const unmastered = allCandidates.filter(w => !masteredSet.has(w));
  
  if (unmastered.length >= 3) {
    return unmastered.slice(0, 3);
  }
  return ['STAR', 'MOON', 'PARK'];
}

export async function getWordMeaningSimple(word: string): Promise<string> {
  const upper = (word || '').toUpperCase().trim();
  if (DICTIONARY_MAP[upper]) {
    return DICTIONARY_MAP[upper];
  }
  return `"${word.toUpperCase()}" is a wonderful word to speak, spell, and learn!`;
}

export async function generateStoryFromWords(masteredWords: string[]): Promise<GeneratedStory> {
  const wordsToUse = masteredWords.length > 0 
    ? masteredWords.slice(-6).map(w => w.toUpperCase())
    : ['CAT', 'SUN', 'RUN', 'PLAY', 'STAR', 'FISH'];

  const primaryWord = wordsToUse[0] || 'CAT';
  const secondaryWord = wordsToUse[1] || 'SUN';
  const tertiaryWord = wordsToUse[2] || 'STAR';

  return {
    title: `The Great ${primaryWord} & ${secondaryWord} Adventure`,
    themeEmoji: "📖",
    pages: [
      {
        text: `Once upon a sunny morning, a brave little explorer discovered a happy ${primaryWord}.`,
        emoji: "🐱",
        targetWord: primaryWord
      },
      {
        text: `Together under the warm bright ${secondaryWord}, they started to PLAY and RUN across the green meadow!`,
        emoji: "☀️",
        targetWord: secondaryWord
      },
      {
        text: `As evening fell, a glowing ${tertiaryWord} guided them safely back home with big smiles.`,
        emoji: "⭐",
        targetWord: tertiaryWord
      }
    ],
    usedWords: wordsToUse,
    interactiveQuestion: {
      question: `Who went on the fun morning adventure?`,
      options: [`The happy ${primaryWord}`, `A sleepy OWL`, `A big RED BUS`],
      correctIndex: 0,
      explanation: `Hooray! You remembered the story about the happy ${primaryWord}!`
    }
  };
}
