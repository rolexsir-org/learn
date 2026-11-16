export interface WordItem {
  id: string;
  text: string;
  phonics: string[];
  difficulty: number;
  category: 'animals' | 'nature' | 'actions' | 'colors' | 'everyday' | 'space' | 'ocean' | 'fantasy' | 'fruits' | 'vegetables' | 'shapes' | 'numbers' | 'vehicles' | 'body_parts' | 'food';
  emoji: string;
  worldId: string;
  hintSentence?: string;
}

export interface ThemedWorld {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requiredXp: number;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  particleEmojis: string[];
  bannerImage: string;
}

export interface StickerItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAtXp: number;
  category: 'achievement' | 'word' | 'streak' | 'mascot';
  color: string;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewardCoins: number;
  rewardXp: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
}

export const THEMED_WORLDS: ThemedWorld[] = [
  {
    id: 'meadow',
    name: 'Sunny Meadow',
    description: 'A cheerful grassy valley filled with friendly animals and bright sunshine!',
    emoji: '🌻',
    requiredXp: 0,
    bgGradient: 'from-amber-50 via-sky-50 to-emerald-50',
    cardBg: 'bg-gradient-to-b from-sky-100/80 to-emerald-50/90',
    accentColor: 'emerald',
    particleEmojis: ['☁️', '☀️', '🦋', '🌸', '🐝', '🎈'],
    bannerImage: '🌼🌿'
  },
  {
    id: 'ocean',
    name: 'Coral Ocean',
    description: 'Dive deep into bubbly waters with colorful fish and hidden ocean treasures!',
    emoji: '🐠',
    requiredXp: 60,
    bgGradient: 'from-cyan-50 via-blue-50 to-indigo-100',
    cardBg: 'bg-gradient-to-b from-cyan-100/80 to-blue-50/90',
    accentColor: 'cyan',
    particleEmojis: ['🫧', '🐚', '🦀', '🐬', '🐙', '🌊'],
    bannerImage: '🐬🐚'
  },
  {
    id: 'space',
    name: 'Cosmic Space',
    description: 'Blast off to twinkling stars, friendly aliens, and glowing rocket ships!',
    emoji: '🚀',
    requiredXp: 150,
    bgGradient: 'from-purple-950 via-indigo-900 to-slate-900 text-white',
    cardBg: 'bg-gradient-to-b from-indigo-900/90 to-purple-900/90',
    accentColor: 'purple',
    particleEmojis: ['⭐', '✨', '🪐', '🛸', '🌙', '☄️'],
    bannerImage: '🚀🪐'
  },
  {
    id: 'jungle',
    name: 'Magic Jungle',
    description: 'Explore tropical trees, playful monkeys, and glowing jungle fireflies!',
    emoji: '🌴',
    requiredXp: 280,
    bgGradient: 'from-emerald-900 via-teal-900 to-stone-900 text-white',
    cardBg: 'bg-gradient-to-b from-teal-900/90 to-emerald-800/90',
    accentColor: 'teal',
    particleEmojis: ['🍃', '🦜', '🐒', '🌺', '✨', '🌴'],
    bannerImage: '🐒🌴'
  },
  {
    id: 'castle',
    name: 'Royal Castle',
    description: 'Step into a magical kingdom of brave dragons, shiny crowns, and wizards!',
    emoji: '🏰',
    requiredXp: 450,
    bgGradient: 'from-amber-900 via-purple-950 to-stone-900 text-white',
    cardBg: 'bg-gradient-to-b from-purple-900/90 to-amber-900/90',
    accentColor: 'amber',
    particleEmojis: ['👑', '🐉', '🪄', '💎', '🏰', '✨'],
    bannerImage: '👑🏰'
  }
];

export const INITIAL_WORDS: WordItem[] = [
  // Meadow Words
  // Animals
  { id: 'cat', text: 'CAT', phonics: ['C', 'A', 'T'], difficulty: 1, category: 'animals', emoji: '🐱', worldId: 'meadow', hintSentence: 'A furry pet that purrs softly.' },
  { id: 'dog', text: 'DOG', phonics: ['D', 'O', 'G'], difficulty: 1, category: 'animals', emoji: '🐶', worldId: 'meadow', hintSentence: 'A loyal pet that barks and wags its tail.' },
  { id: 'frog', text: 'FROG', phonics: ['F', 'R', 'O', 'G'], difficulty: 2, category: 'animals', emoji: '🐸', worldId: 'meadow', hintSentence: 'A green animal that hops in the pond.' },
  { id: 'duck', text: 'DUCK', phonics: ['D', 'U', 'C', 'K'], difficulty: 1, category: 'animals', emoji: '🦆', worldId: 'meadow', hintSentence: 'A friendly bird that quacks and swims.' },
  { id: 'bear', text: 'BEAR', phonics: ['B', 'E', 'A', 'R'], difficulty: 1, category: 'animals', emoji: '🐻', worldId: 'meadow', hintSentence: 'A big fluffy animal that loves sweet honey.' },
  { id: 'rabbit', text: 'RABBIT', phonics: ['R', 'A', 'B', 'B', 'I', 'T'], difficulty: 2, category: 'animals', emoji: '🐰', worldId: 'meadow', hintSentence: 'A fluffy bunny with long ears that hops around.' },
  { id: 'cow', text: 'COW', phonics: ['C', 'O', 'W'], difficulty: 1, category: 'animals', emoji: '🐮', worldId: 'meadow', hintSentence: 'A gentle farm animal that says moo!' },
  { id: 'pig', text: 'PIG', phonics: ['P', 'I', 'G'], difficulty: 1, category: 'animals', emoji: '🐷', worldId: 'meadow', hintSentence: 'A cute pink animal that oinks playfully.' },

  // Fruits
  { id: 'apple', text: 'APPLE', phonics: ['A', 'P', 'P', 'L', 'E'], difficulty: 2, category: 'fruits', emoji: '🍎', worldId: 'meadow', hintSentence: 'A sweet, crunchy red fruit.' },
  { id: 'grape', text: 'GRAPE', phonics: ['G', 'R', 'A', 'P', 'E'], difficulty: 2, category: 'fruits', emoji: '🍇', worldId: 'meadow', hintSentence: 'Small sweet juicy berries on a vine.' },
  { id: 'orange_fruit', text: 'ORANGE', phonics: ['O', 'R', 'A', 'N', 'G', 'E'], difficulty: 2, category: 'fruits', emoji: '🍊', worldId: 'meadow', hintSentence: 'A bright citrus fruit packed with vitamin C.' },
  { id: 'peach', text: 'PEACH', phonics: ['P', 'E', 'A', 'C', 'H'], difficulty: 2, category: 'fruits', emoji: '🍑', worldId: 'meadow', hintSentence: 'A fuzzy, sweet summer fruit with a pit.' },
  { id: 'lemon', text: 'LEMON', phonics: ['L', 'E', 'M', 'O', 'N'], difficulty: 2, category: 'fruits', emoji: '🍋', worldId: 'meadow', hintSentence: 'A bright yellow fruit that tastes sour and zesty.' },
  { id: 'berry', text: 'BERRY', phonics: ['B', 'E', 'R', 'R', 'Y'], difficulty: 2, category: 'fruits', emoji: '🍓', worldId: 'meadow', hintSentence: 'A juicy red strawberry bursting with sweetness.' },
  { id: 'melon', text: 'MELON', phonics: ['M', 'E', 'L', 'O', 'N'], difficulty: 2, category: 'fruits', emoji: '🍉', worldId: 'meadow', hintSentence: 'A big juicy watermelon perfect for sunny summer days.' },

  // Vegetables
  { id: 'carrot', text: 'CARROT', phonics: ['C', 'A', 'R', 'R', 'O', 'T'], difficulty: 2, category: 'vegetables', emoji: '🥕', worldId: 'meadow', hintSentence: 'A crunchy orange veggie that rabbits love.' },
  { id: 'corn', text: 'CORN', phonics: ['C', 'O', 'R', 'N'], difficulty: 1, category: 'vegetables', emoji: '🌽', worldId: 'meadow', hintSentence: 'Sweet yellow kernels grown on tall stalks.' },
  { id: 'pea', text: 'PEA', phonics: ['P', 'E', 'A'], difficulty: 1, category: 'vegetables', emoji: '🫛', worldId: 'meadow', hintSentence: 'Little round green veggies snug in a pod.' },
  { id: 'potato', text: 'POTATO', phonics: ['P', 'O', 'T', 'A', 'T', 'O'], difficulty: 2, category: 'vegetables', emoji: '🥔', worldId: 'meadow', hintSentence: 'A hearty root vegetable used to make delicious treats.' },
  { id: 'tomato', text: 'TOMATO', phonics: ['T', 'O', 'M', 'A', 'T', 'O'], difficulty: 2, category: 'vegetables', emoji: '🍅', worldId: 'meadow', hintSentence: 'A round red juicy veggie great for salad and sauce.' },
  { id: 'onion', text: 'ONION', phonics: ['O', 'N', 'I', 'O', 'N'], difficulty: 2, category: 'vegetables', emoji: '🧅', worldId: 'meadow', hintSentence: 'A round bulb vegetable with thin papery layers.' },
  { id: 'broccoli', text: 'BROCCOLI', phonics: ['B', 'R', 'O', 'C', 'C', 'O', 'L', 'I'], difficulty: 3, category: 'vegetables', emoji: '🥦', worldId: 'meadow', hintSentence: 'Looks like tiny green trees packed with vitamins!' },

  // Colors
  { id: 'red', text: 'RED', phonics: ['R', 'E', 'D'], difficulty: 1, category: 'colors', emoji: '❤️', worldId: 'meadow', hintSentence: 'The bright color of ripe apples and roses.' },
  { id: 'pink', text: 'PINK', phonics: ['P', 'I', 'N', 'K'], difficulty: 1, category: 'colors', emoji: '🩷', worldId: 'meadow', hintSentence: 'A soft color like flamingos and cotton candy.' },
  { id: 'green', text: 'GREEN', phonics: ['G', 'R', 'E', 'E', 'N'], difficulty: 1, category: 'colors', emoji: '🟢', worldId: 'meadow', hintSentence: 'The color of fresh grass and leafy trees.' },
  { id: 'yellow', text: 'YELLOW', phonics: ['Y', 'E', 'L', 'L', 'O', 'W'], difficulty: 2, category: 'colors', emoji: '🟡', worldId: 'meadow', hintSentence: 'The bright color of sunshine and lemons.' },

  // Shapes
  { id: 'circle', text: 'CIRCLE', phonics: ['C', 'I', 'R', 'C', 'L', 'E'], difficulty: 2, category: 'shapes', emoji: '⭕', worldId: 'meadow', hintSentence: 'A completely round shape with no sharp corners.' },
  { id: 'square', text: 'SQUARE', phonics: ['S', 'Q', 'U', 'A', 'R', 'E'], difficulty: 2, category: 'shapes', emoji: '⏹️', worldId: 'meadow', hintSentence: 'A shape with four equal sides and four corners.' },
  { id: 'heart', text: 'HEART', phonics: ['H', 'E', 'A', 'R', 'T'], difficulty: 2, category: 'shapes', emoji: '🩷', worldId: 'meadow', hintSentence: 'A lovely shape used to express love and care.' },

  // Numbers
  { id: 'one', text: 'ONE', phonics: ['O', 'N', 'E'], difficulty: 1, category: 'numbers', emoji: '1️⃣', worldId: 'meadow', hintSentence: 'The very first counting number (1).' },
  { id: 'two', text: 'TWO', phonics: ['T', 'W', 'O'], difficulty: 1, category: 'numbers', emoji: '2️⃣', worldId: 'meadow', hintSentence: 'A pair of eyes or shoes (2).' },
  { id: 'three', text: 'THREE', phonics: ['T', 'H', 'R', 'E', 'E'], difficulty: 2, category: 'numbers', emoji: '3️⃣', worldId: 'meadow', hintSentence: 'One more than two (3).' },
  { id: 'four', text: 'FOUR', phonics: ['F', 'O', 'U', 'R'], difficulty: 1, category: 'numbers', emoji: '4️⃣', worldId: 'meadow', hintSentence: 'The number of legs on a puppy (4).' },
  { id: 'five', text: 'FIVE', phonics: ['F', 'I', 'V', 'E'], difficulty: 1, category: 'numbers', emoji: '5️⃣', worldId: 'meadow', hintSentence: 'The number of fingers on one hand (5).' },
  { id: 'ten', text: 'TEN', phonics: ['T', 'E', 'N'], difficulty: 1, category: 'numbers', emoji: '🔟', worldId: 'meadow', hintSentence: 'Count all ten fingers together (10)!' },

  // Vehicles
  { id: 'car', text: 'CAR', phonics: ['C', 'A', 'R'], difficulty: 1, category: 'vehicles', emoji: '🚗', worldId: 'meadow', hintSentence: 'A motor vehicle with four wheels on the road.' },
  { id: 'bus', text: 'BUS', phonics: ['B', 'U', 'S'], difficulty: 1, category: 'vehicles', emoji: '🚌', worldId: 'meadow', hintSentence: 'A large vehicle that carries passengers and students.' },
  { id: 'train', text: 'TRAIN', phonics: ['T', 'R', 'A', 'I', 'N'], difficulty: 2, category: 'vehicles', emoji: '🚂', worldId: 'meadow', hintSentence: 'Rides along tracks with a choo-choo whistle!' },
  { id: 'bike', text: 'BIKE', phonics: ['B', 'I', 'K', 'E'], difficulty: 1, category: 'vehicles', emoji: '🚲', worldId: 'meadow', hintSentence: 'A two-wheeled ride powered by your feet.' },

  // Body Parts
  { id: 'hand', text: 'HAND', phonics: ['H', 'A', 'N', 'D'], difficulty: 1, category: 'body_parts', emoji: '✋', worldId: 'meadow', hintSentence: 'Has five fingers used for waving and clapping.' },
  { id: 'foot', text: 'FOOT', phonics: ['F', 'O', 'O', 'T'], difficulty: 1, category: 'body_parts', emoji: '🦶', worldId: 'meadow', hintSentence: 'Used for standing, walking, running, and hopping.' },
  { id: 'eye', text: 'EYE', phonics: ['E', 'Y', 'E'], difficulty: 1, category: 'body_parts', emoji: '👁️', worldId: 'meadow', hintSentence: 'Helps you see bright colors and word games.' },
  { id: 'ear', text: 'EAR', phonics: ['E', 'A', 'R'], difficulty: 1, category: 'body_parts', emoji: '👂', worldId: 'meadow', hintSentence: 'Helps you listen to phonics sounds and music.' },
  { id: 'nose', text: 'NOSE', phonics: ['N', 'O', 'S', 'E'], difficulty: 1, category: 'body_parts', emoji: '👃', worldId: 'meadow', hintSentence: 'Used for smelling flowers and breathing deeply.' },
  { id: 'head', text: 'HEAD', phonics: ['H', 'E', 'A', 'D'], difficulty: 1, category: 'body_parts', emoji: '🗣️', worldId: 'meadow', hintSentence: 'Holds your brain where clever thinking happens!' },

  // Food
  { id: 'bread', text: 'BREAD', phonics: ['B', 'R', 'E', 'A', 'D'], difficulty: 2, category: 'food', emoji: '🍞', worldId: 'meadow', hintSentence: 'A soft baked food used to make yummy sandwiches.' },
  { id: 'milk', text: 'MILK', phonics: ['M', 'I', 'L', 'K'], difficulty: 1, category: 'food', emoji: '🥛', worldId: 'meadow', hintSentence: 'A wholesome white drink rich in calcium.' },
  { id: 'cheese', text: 'CHEESE', phonics: ['C', 'H', 'E', 'E', 'S', 'E'], difficulty: 2, category: 'food', emoji: '🧀', worldId: 'food', hintSentence: 'A tasty yellow dairy treat that mice adore.' },
  { id: 'pizza', text: 'PIZZA', phonics: ['P', 'I', 'Z', 'Z', 'A'], difficulty: 2, category: 'food', emoji: '🍕', worldId: 'meadow', hintSentence: 'A oven-baked slice topped with cheese and sauce.' },
  { id: 'rice', text: 'RICE', phonics: ['R', 'I', 'C', 'E'], difficulty: 1, category: 'food', emoji: '🍚', worldId: 'meadow', hintSentence: 'Small white wholesome grains enjoyed around the world.' },

  // Nature & Actions
  { id: 'sun', text: 'SUN', phonics: ['S', 'U', 'N'], difficulty: 1, category: 'nature', emoji: '☀️', worldId: 'meadow', hintSentence: 'It shines brightly in the daytime sky.' },
  { id: 'run', text: 'RUN', phonics: ['R', 'U', 'N'], difficulty: 1, category: 'actions', emoji: '🏃', worldId: 'meadow', hintSentence: 'To move fast with your feet!' },

  // Ocean Words
  { id: 'fish', text: 'FISH', phonics: ['F', 'I', 'S', 'H'], difficulty: 2, category: 'ocean', emoji: '🐟', worldId: 'ocean', hintSentence: 'It swims gracefully under water.' },
  { id: 'blue', text: 'BLUE', phonics: ['B', 'L', 'U', 'E'], difficulty: 2, category: 'colors', emoji: '💙', worldId: 'ocean', hintSentence: 'The color of the deep ocean and clear sky.' },
  { id: 'crab', text: 'CRAB', phonics: ['C', 'R', 'A', 'B'], difficulty: 2, category: 'ocean', emoji: '🦀', worldId: 'ocean', hintSentence: 'It walks sideways on sandy ocean shores.' },
  { id: 'wave', text: 'WAVE', phonics: ['W', 'A', 'V', 'E'], difficulty: 2, category: 'ocean', emoji: '🌊', worldId: 'ocean', hintSentence: 'Water rolling onto the sandy beach.' },
  { id: 'shark', text: 'SHARK', phonics: ['S', 'H', 'A', 'R', 'K'], difficulty: 3, category: 'ocean', emoji: '🦈', worldId: 'ocean', hintSentence: 'A fast swimmer with a fin on top.' },
  { id: 'dolphin', text: 'DOLPHIN', phonics: ['D', 'O', 'L', 'P', 'H', 'I', 'N'], difficulty: 3, category: 'animals', emoji: '🐬', worldId: 'ocean', hintSentence: 'A smart, playful ocean swimmer that leaps out of water.' },
  { id: 'whale', text: 'WHALE', phonics: ['W', 'H', 'A', 'L', 'E'], difficulty: 2, category: 'animals', emoji: '🐳', worldId: 'ocean', hintSentence: 'A giant gentle sea creature that breathes through a blowhole.' },
  { id: 'turtle', text: 'TURTLE', phonics: ['T', 'U', 'R', 'T', 'L', 'E'], difficulty: 2, category: 'animals', emoji: '🐢', worldId: 'ocean', hintSentence: 'A calm swimmer protected by a strong shell.' },
  { id: 'boat', text: 'BOAT', phonics: ['B', 'O', 'A', 'T'], difficulty: 1, category: 'vehicles', emoji: '⛵', worldId: 'ocean', hintSentence: 'Floats smoothly across water and sea waves.' },

  // Space Words
  { id: 'star', text: 'STAR', phonics: ['S', 'T', 'A', 'R'], difficulty: 2, category: 'shapes', emoji: '⭐', worldId: 'space', hintSentence: 'Twinkles brightly in the night sky.' },
  { id: 'moon', text: 'MOON', phonics: ['M', 'O', 'O', 'N'], difficulty: 2, category: 'space', emoji: '🌙', worldId: 'space', hintSentence: 'Glows brightly in the dark night sky.' },
  { id: 'ship', text: 'SHIP', phonics: ['S', 'H', 'I', 'P'], difficulty: 2, category: 'vehicles', emoji: '🚀', worldId: 'space', hintSentence: 'A rocket ship zooming into outer space!' },
  { id: 'alien', text: 'ALIEN', phonics: ['A', 'L', 'I', 'E', 'N'], difficulty: 3, category: 'space', emoji: '👾', worldId: 'space', hintSentence: 'A friendly cosmic visitor from another galaxy.' },
  { id: 'purple', text: 'PURPLE', phonics: ['P', 'U', 'R', 'P', 'L', 'E'], difficulty: 2, category: 'colors', emoji: '💜', worldId: 'space', hintSentence: 'A cosmic royal color made by mixing blue and red.' },
  { id: 'white', text: 'WHITE', phonics: ['W', 'H', 'I', 'T', 'E'], difficulty: 2, category: 'colors', emoji: '🤍', worldId: 'space', hintSentence: 'The bright light color of starry starlight and snow.' },
  { id: 'cube', text: 'CUBE', phonics: ['C', 'U', 'B', 'E'], difficulty: 2, category: 'shapes', emoji: '🧊', worldId: 'space', hintSentence: 'A 3D box shape like a building block.' },
  { id: 'plane', text: 'PLANE', phonics: ['P', 'L', 'A', 'N', 'E'], difficulty: 2, category: 'vehicles', emoji: '✈️', worldId: 'space', hintSentence: 'Flies high above clouds through the blue sky.' },

  // Jungle Words
  { id: 'tree', text: 'TREE', phonics: ['T', 'R', 'E', 'E'], difficulty: 2, category: 'nature', emoji: '🌴', worldId: 'jungle', hintSentence: 'A tall green plant with branches and leaves.' },
  { id: 'lion', text: 'LION', phonics: ['L', 'I', 'O', 'N'], difficulty: 2, category: 'animals', emoji: '🦁', worldId: 'jungle', hintSentence: 'The brave lion king of the jungle.' },
  { id: 'monkey', text: 'MONKEY', phonics: ['M', 'O', 'N', 'K', 'E', 'Y'], difficulty: 2, category: 'animals', emoji: '🐒', worldId: 'jungle', hintSentence: 'A playful monkey swinging through leafy vines.' },
  { id: 'tiger', text: 'TIGER', phonics: ['T', 'I', 'G', 'E', 'R'], difficulty: 2, category: 'animals', emoji: '🐯', worldId: 'jungle', hintSentence: 'A fierce jungle cat with bold black stripes.' },
  { id: 'parrot', text: 'PARROT', phonics: ['P', 'A', 'R', 'R', 'O', 'T'], difficulty: 2, category: 'animals', emoji: '🦜', worldId: 'jungle', hintSentence: 'A colorful jungle bird that copies sounds.' },
  { id: 'banana', text: 'BANANA', phonics: ['B', 'A', 'N', 'A', 'N', 'A'], difficulty: 2, category: 'fruits', emoji: '🍌', worldId: 'jungle', hintSentence: 'A sweet yellow tropical fruit that monkeys love.' },
  { id: 'mango', text: 'MANGO', phonics: ['M', 'A', 'N', 'G', 'O'], difficulty: 2, category: 'fruits', emoji: '🥭', worldId: 'jungle', hintSentence: 'A delicious tropical fruit with sweet juicy orange pulp.' },
  { id: 'jump', text: 'JUMP', phonics: ['J', 'U', 'M', 'P'], difficulty: 2, category: 'actions', emoji: '🦘', worldId: 'jungle', hintSentence: 'Leap high into the air!' },

  // Castle Words
  { id: 'king', text: 'KING', phonics: ['K', 'I', 'N', 'G'], difficulty: 2, category: 'fantasy', emoji: '👑', worldId: 'castle', hintSentence: 'Wears a golden crown in the royal palace.' },
  { id: 'magic', text: 'MAGIC', phonics: ['M', 'A', 'G', 'I', 'C'], difficulty: 3, category: 'fantasy', emoji: '🪄', worldId: 'castle', hintSentence: 'Sparks of wonder, mystery, and magic spells!' },
  { id: 'dragon', text: 'DRAGON', phonics: ['D', 'R', 'A', 'G', 'O', 'N'], difficulty: 3, category: 'fantasy', emoji: '🐉', worldId: 'castle', hintSentence: 'A friendly mythical dragon with giant wings.' },
  { id: 'owl', text: 'OWL', phonics: ['O', 'W', 'L'], difficulty: 1, category: 'animals', emoji: '🦉', worldId: 'castle', hintSentence: 'A wise nocturnal bird perched on the castle tower.' },
  { id: 'gold', text: 'GOLD', phonics: ['G', 'O', 'L', 'D'], difficulty: 1, category: 'colors', emoji: '🪙', worldId: 'castle', hintSentence: 'A shiny golden treasure fit for a royal king.' },
  { id: 'ring', text: 'RING', phonics: ['R', 'I', 'N', 'G'], difficulty: 1, category: 'shapes', emoji: '💍', worldId: 'castle', hintSentence: 'A shiny circle jewel worn on a royal finger.' },
  { id: 'cake', text: 'CAKE', phonics: ['C', 'A', 'K', 'E'], difficulty: 1, category: 'food', emoji: '🎂', worldId: 'castle', hintSentence: 'A sweet celebration treat topped with candles!' },
  { id: 'soup', text: 'SOUP', phonics: ['S', 'O', 'U', 'P'], difficulty: 1, category: 'food', emoji: '🥣', worldId: 'castle', hintSentence: 'A warm cozy bowl of delicious soup in the castle hall.' }
];

export const CHARACTERS = [
  { id: 'bear', name: 'Barnaby Bear', emoji: '🐻', cost: 10, quote: 'Big bear hugs and high fives!', color: 'bg-amber-100 border-amber-300 text-amber-800' },
  { id: 'cat', name: 'Cleo Cat', emoji: '🐱', cost: 20, quote: 'Purr-fect speller alert!', color: 'bg-orange-100 border-orange-300 text-orange-800' },
  { id: 'dog', name: 'Doodle Dog', emoji: '🐶', cost: 30, quote: 'Barking with joy for you!', color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { id: 'rabbit', name: 'Rosie Rabbit', emoji: '🐰', cost: 40, quote: 'Hopping into new words!', color: 'bg-pink-100 border-pink-300 text-pink-800' },
  { id: 'panda', name: 'Pip Panda', emoji: '🐼', cost: 50, quote: 'Bamboo-tiful work!', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
  { id: 'unicorn', name: 'Sparkle Unicorn', emoji: '🦄', cost: 75, quote: 'Magic shines in every word!', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  { id: 'dino', name: 'Dino Dave', emoji: '🦖', cost: 90, quote: 'Dino-mite spelling power!', color: 'bg-lime-100 border-lime-300 text-lime-800' },
  { id: 'lion', name: 'Leo Lion', emoji: '🦁', cost: 100, quote: 'Roar! You are a word champion!', color: 'bg-amber-100 border-amber-400 text-amber-900' },
];

export const STICKERS: StickerItem[] = [
  { id: 'first_word', title: 'First Word!', description: 'Completed your very first word challenge.', emoji: '🌟', unlockedAtXp: 10, category: 'achievement', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'meadow_scout', title: 'Meadow Scout', description: 'Mastered 3 words in Sunny Meadow.', emoji: '🌻', unlockedAtXp: 30, category: 'word', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'ocean_diver', title: 'Ocean Diver', description: 'Explored the Coral Ocean world.', emoji: '🐠', unlockedAtXp: 60, category: 'word', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'space_cadet', title: 'Space Cadet', description: 'Unlocked Cosmic Space world.', emoji: '🚀', unlockedAtXp: 120, category: 'achievement', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'phonics_wizard', title: 'Phonics Wizard', description: 'Scored 100% accuracy on 5 words.', emoji: '🪄', unlockedAtXp: 200, category: 'achievement', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'super_streak', title: 'Streak Hero', description: 'Kept a daily learning streak going!', emoji: '🔥', unlockedAtXp: 250, category: 'streak', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { id: 'jungle_king', title: 'Jungle Explorer', description: 'Mastered words in the Magic Jungle.', emoji: '🌴', unlockedAtXp: 320, category: 'word', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'royal_scholar', title: 'Royal Scholar', description: 'Reached the Royal Castle world!', emoji: '👑', unlockedAtXp: 450, category: 'achievement', color: 'bg-yellow-100 text-yellow-900 border-yellow-400' }
];

export const MOTIVATIONAL_QUOTES = [
  "You're a Super Speller! 🌟",
  "High Five! You Did It! ✋",
  "Sensational Job! 🎉",
  "You are so smart! 🧠✨",
  "Keep Shining Bright! ⭐",
  "Word Wizard Alert! 🪄",
  "Hooray! Perfect Spelling! 🎈",
  "Fantastic focus, my friend! 🐾",
  "You're moving mountains! ⛰️✨"
];

export const LEVEL_TITLES = [
  { level: 1, name: 'Word Explorer 🔍', minXp: 0 },
  { level: 2, name: 'Phonics Trainee 🚀', minXp: 50 },
  { level: 3, name: 'Super Speller 🌟', minXp: 120 },
  { level: 4, name: 'Alphabet Hero 🦸‍♂️', minXp: 220 },
  { level: 5, name: 'Word Wizard 🪄', minXp: 350 },
  { level: 6, name: 'Language Legend 👑', minXp: 500 }
];
