import React from 'react';

export type TemplateCategory =
  | 'animals'
  | 'birds'
  | 'sea'
  | 'dinosaurs'
  | 'fruits'
  | 'vegetables'
  | 'vehicles'
  | 'shapes'
  | 'numbers'
  | 'letters'
  | 'nature'
  | 'flowers'
  | 'food'
  | 'everyday';

export interface ColoringTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  icon: string;
  sections: string[];
  renderSvg: (
    sectionFills: Record<string, string>,
    onSectionClick: (sectionId: string) => void,
    strokeColor?: string,
    strokeDash?: string
  ) => React.ReactNode;
}

export const DRAW_CATEGORIES: { id: TemplateCategory; name: string; icon: string }[] = [
  { id: 'animals', name: 'Animals', icon: '🐾' },
  { id: 'birds', name: 'Birds', icon: '🦜' },
  { id: 'sea', name: 'Sea Life', icon: '🐬' },
  { id: 'dinosaurs', name: 'Dinosaurs', icon: '🦖' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'vegetables', name: 'Veggies', icon: '🥕' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'shapes', name: 'Shapes', icon: '📐' },
  { id: 'numbers', name: 'Numbers', icon: '🔢' },
  { id: 'letters', name: 'Letters', icon: '🔤' },
  { id: 'nature', name: 'Nature', icon: '☀️' },
  { id: 'flowers', name: 'Flowers', icon: '🌸' },
  { id: 'food', name: 'Yummy Food', icon: '🍕' },
  { id: 'everyday', name: 'Everyday', icon: '🎈' },
];

const getFill = (sectionFills: Record<string, string>, sectionId: string, defaultColor = '#FFFFFF') => {
  return sectionFills[sectionId] || defaultColor;
};

// --- 1. ANIMALS ---
export const ANIMAL_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'lion',
    name: 'Friendly Lion',
    category: 'animals',
    icon: '🦁',
    sections: ['bg', 'mane', 'head', 'ear-left', 'ear-right', 'snout', 'nose', 'body', 'paws'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <circle cx="200" cy="175" r="125" fill={getFill(sectionFills, 'mane', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('mane')} />
        <circle cx="135" cy="115" r="28" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <circle cx="265" cy="115" r="28" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <circle cx="200" cy="175" r="80" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <ellipse cx="200" cy="198" rx="36" ry="24" fill={getFill(sectionFills, 'snout', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('snout')} />
        <polygon points="185,188 215,188 200,204" fill={getFill(sectionFills, 'nose', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('nose')} />
        <path d="M200,204 L200,214 M188,218 Q200,228 200,214 Q200,228 212,218" fill="none" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <circle cx="168" cy="162" r="9" fill={strokeColor} />
        <circle cx="232" cy="162" r="9" fill={strokeColor} />
        <circle cx="170" cy="160" r="3" fill="#FFFFFF" />
        <circle cx="234" cy="160" r="3" fill="#FFFFFF" />
        <path d="M145,250 Q130,345 150,360 L250,360 Q270,345 255,250 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M140,360 Q180,370 200,360 Q220,370 260,360" fill={getFill(sectionFills, 'paws', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('paws')} />
      </svg>
    )
  },
  {
    id: 'puppy',
    name: 'Happy Puppy',
    category: 'animals',
    icon: '🐶',
    sections: ['bg', 'head', 'ear-left', 'ear-right', 'snout', 'nose', 'tongue', 'collar', 'body'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M130,135 Q55,140 70,230 Q110,225 125,185 Z" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <path d="M270,135 Q345,140 330,230 Q290,225 275,185 Z" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <ellipse cx="200" cy="175" rx="85" ry="72" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <ellipse cx="200" cy="195" rx="34" ry="22" fill={getFill(sectionFills, 'snout', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('snout')} />
        <ellipse cx="200" cy="186" rx="15" ry="10" fill={getFill(sectionFills, 'nose', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('nose')} />
        <path d="M192,210 Q200,232 208,210 Z" fill={getFill(sectionFills, 'tongue', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tongue')} />
        <circle cx="165" cy="160" r="10" fill={strokeColor} />
        <circle cx="235" cy="160" r="10" fill={strokeColor} />
        <circle cx="167" cy="158" r="3" fill="#FFFFFF" />
        <circle cx="237" cy="158" r="3" fill="#FFFFFF" />
        <rect x="155" y="240" width="90" height="20" rx="10" fill={getFill(sectionFills, 'collar', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('collar')} />
        <path d="M155,260 L135,355 Q200,370 265,355 L245,260 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
      </svg>
    )
  },
  {
    id: 'cat',
    name: 'Kitty Cat',
    category: 'animals',
    icon: '🐱',
    sections: ['bg', 'head', 'ear-left', 'ear-inner-l', 'ear-right', 'ear-inner-r', 'nose', 'body', 'tail'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="130,135 105,55 170,110" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <polygon points="135,125 120,75 162,110" fill={getFill(sectionFills, 'ear-inner-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-inner-l')} />
        <polygon points="270,135 295,55 230,110" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <polygon points="265,125 280,75 238,110" fill={getFill(sectionFills, 'ear-inner-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-inner-r')} />
        <ellipse cx="200" cy="175" rx="88" ry="72" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <polygon points="192,185 208,185 200,195" fill={getFill(sectionFills, 'nose', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('nose')} />
        <line x1="105" y1="175" x2="145" y2="182" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="190" x2="145" y2="192" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="295" y1="175" x2="255" y2="182" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="300" y1="190" x2="255" y2="192" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="160" cy="165" rx="10" ry="14" fill={strokeColor} />
        <ellipse cx="240" cy="165" rx="10" ry="14" fill={strokeColor} />
        <circle cx="162" cy="160" r="3" fill="#FFFFFF" />
        <circle cx="242" cy="160" r="3" fill="#FFFFFF" />
        <path d="M260,310 Q340,300 320,220 Q300,160 345,175 Q320,230 280,330 Z" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <path d="M150,242 L135,355 Q200,370 265,355 L250,242 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
      </svg>
    )
  },
  {
    id: 'bear',
    name: 'Teddy Bear',
    category: 'animals',
    icon: '🐻',
    sections: ['bg', 'head', 'ear-left', 'ear-right', 'snout', 'nose', 'body', 'belly', 'paws-hands', 'paws-feet'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <circle cx="140" cy="100" r="28" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <circle cx="260" cy="100" r="28" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <circle cx="200" cy="155" r="72" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <ellipse cx="200" cy="170" rx="28" ry="20" fill={getFill(sectionFills, 'snout', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('snout')} />
        <ellipse cx="200" cy="162" rx="12" ry="8" fill={getFill(sectionFills, 'nose', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('nose')} />
        <circle cx="170" cy="140" r="8" fill={strokeColor} />
        <circle cx="230" cy="140" r="8" fill={strokeColor} />
        <circle cx="200" cy="275" r="78" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="200" cy="275" r="46" fill={getFill(sectionFills, 'belly', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('belly')} />
        <circle cx="115" cy="250" r="22" fill={getFill(sectionFills, 'paws-hands', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('paws-hands')} />
        <circle cx="285" cy="250" r="22" fill={getFill(sectionFills, 'paws-hands', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('paws-hands')} />
        <circle cx="140" cy="340" r="26" fill={getFill(sectionFills, 'paws-feet', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('paws-feet')} />
        <circle cx="260" cy="340" r="26" fill={getFill(sectionFills, 'paws-feet', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('paws-feet')} />
      </svg>
    )
  },
  {
    id: 'bunny',
    name: 'Playful Bunny',
    category: 'animals',
    icon: '🐰',
    sections: ['bg', 'head', 'ear-left', 'ear-inner-l', 'ear-right', 'ear-inner-r', 'nose', 'body', 'belly', 'tail'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M165,130 C125,20 145,10 175,10 C195,10 185,80 175,130 Z" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinecap="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <path d="M167,110 C145,35 158,25 172,25 C185,25 180,75 173,110 Z" fill={getFill(sectionFills, 'ear-inner-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-inner-l')} />
        <path d="M235,130 C275,20 255,10 225,10 C205,10 215,80 225,130 Z" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinecap="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <path d="M233,110 C255,35 242,25 228,25 C215,25 220,75 227,110 Z" fill={getFill(sectionFills, 'ear-inner-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-inner-r')} />
        <ellipse cx="200" cy="180" rx="70" ry="60" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <polygon points="193,188 207,188 200,195" fill={getFill(sectionFills, 'nose', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('nose')} />
        <circle cx="165" cy="170" r="8" fill={strokeColor} />
        <circle cx="235" cy="170" r="8" fill={strokeColor} />
        <circle cx="268" cy="310" r="22" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <ellipse cx="200" cy="285" rx="60" ry="65" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <ellipse cx="200" cy="290" rx="35" ry="40" fill={getFill(sectionFills, 'belly', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('belly')} />
      </svg>
    )
  },
  {
    id: 'elephant',
    name: 'Friendly Elephant',
    category: 'animals',
    icon: '🐘',
    sections: ['bg', 'body', 'head', 'ear-left', 'ear-right', 'trunk', 'tusk-l', 'tusk-r'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <circle cx="110" cy="160" r="60" fill={getFill(sectionFills, 'ear-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-left')} />
        <circle cx="290" cy="160" r="60" fill={getFill(sectionFills, 'ear-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ear-right')} />
        <circle cx="200" cy="275" r="85" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="200" cy="165" r="75" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <path d="M185,185 Q165,240 210,240 Q235,240 230,215 Q220,200 205,200 Z" fill={getFill(sectionFills, 'trunk', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('trunk')} />
        <path d="M165,190 Q150,210 160,220 Z" fill={getFill(sectionFills, 'tusk-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer" onClick={() => onSectionClick('tusk-l')} />
        <path d="M235,190 Q250,210 240,220 Z" fill={getFill(sectionFills, 'tusk-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer" onClick={() => onSectionClick('tusk-r')} />
        <circle cx="165" cy="145" r="8" fill={strokeColor} />
        <circle cx="235" cy="145" r="8" fill={strokeColor} />
      </svg>
    )
  }
];

// --- 2. BIRDS ---
export const BIRD_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'parrot',
    name: 'Rainbow Parrot',
    category: 'birds',
    icon: '🦜',
    sections: ['bg', 'head', 'beak', 'wing', 'body', 'tail', 'perch'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <line x1="60" y1="280" x2="340" y2="280" stroke={strokeColor} strokeWidth="12" strokeLinecap="round" className="cursor-pointer" onClick={() => onSectionClick('perch')} />
        <path d="M230,240 Q250,340 220,360 Q210,320 215,250 Z" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <path d="M160,180 Q140,270 200,280 Q250,270 230,180 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="200" cy="130" r="50" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <path d="M150,125 Q100,135 145,160 Z" fill={getFill(sectionFills, 'beak', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('beak')} />
        <path d="M180,185 Q240,190 220,260 Q170,250 180,185 Z" fill={getFill(sectionFills, 'wing', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('wing')} />
        <circle cx="180" cy="120" r="7" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'owl',
    name: 'Wise Owl',
    category: 'birds',
    icon: '🦉',
    sections: ['bg', 'body', 'belly', 'eye-l', 'eye-r', 'beak', 'wings'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M130,80 L160,110 L240,110 L270,80 L280,220 Q280,340 200,340 Q120,340 120,220 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <ellipse cx="200" cy="245" rx="50" ry="65" fill={getFill(sectionFills, 'belly', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('belly')} />
        <circle cx="160" cy="160" r="32" fill={getFill(sectionFills, 'eye-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('eye-l')} />
        <circle cx="240" cy="160" r="32" fill={getFill(sectionFills, 'eye-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('eye-r')} />
        <circle cx="160" cy="160" r="12" fill={strokeColor} />
        <circle cx="240" cy="160" r="12" fill={strokeColor} />
        <polygon points="190,185 210,185 200,205" fill={getFill(sectionFills, 'beak', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('beak')} />
      </svg>
    )
  },
  {
    id: 'duck',
    name: 'Cute Duckling',
    category: 'birds',
    icon: '🦆',
    sections: ['bg', 'head', 'beak', 'body', 'wing', 'water'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M40,310 Q120,290 200,310 Q280,330 360,310 Q360,360 200,360 Q40,360 40,310 Z" fill={getFill(sectionFills, 'water', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('water')} />
        <path d="M140,180 Q100,220 120,300 Q260,320 280,240 Q290,190 220,200 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="200" cy="130" r="50" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <path d="M150,125 Q100,135 150,150 Z" fill={getFill(sectionFills, 'beak', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('beak')} />
        <ellipse cx="200" cy="245" rx="35" ry="25" fill={getFill(sectionFills, 'wing', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('wing')} />
        <circle cx="180" cy="120" r="6" fill={strokeColor} />
      </svg>
    )
  }
];

// --- 3. SEA ANIMALS ---
export const SEA_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'fish',
    name: 'Ocean Fish',
    category: 'sea',
    icon: '🐟',
    sections: ['bg', 'body', 'tail', 'fin-top', 'fin-bottom', 'bubble-1', 'bubble-2'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="270,200 365,130 340,200 365,270" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <path d="M150,126 Q190,55 230,130 Z" fill={getFill(sectionFills, 'fin-top', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('fin-top')} />
        <path d="M160,274 Q190,345 220,272 Z" fill={getFill(sectionFills, 'fin-bottom', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('fin-bottom')} />
        <ellipse cx="180" cy="200" rx="102" ry="76" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="118" cy="180" r="15" fill="#FFFFFF" stroke={strokeColor} strokeWidth="4" />
        <circle cx="116" cy="178" r="6" fill={strokeColor} />
        <circle cx="55" cy="120" r="14" fill={getFill(sectionFills, 'bubble-1', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('bubble-1')} />
        <circle cx="75" cy="75" r="10" fill={getFill(sectionFills, 'bubble-2', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('bubble-2')} />
      </svg>
    )
  },
  {
    id: 'dolphin',
    name: 'Playful Dolphin',
    category: 'sea',
    icon: '🐬',
    sections: ['bg', 'body', 'belly', 'fin-top', 'tail', 'waves'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M30,330 Q100,290 200,330 Q300,370 370,330" fill="none" stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('waves')} />
        <path d="M300,250 Q360,220 350,280 Q320,290 280,265 Z" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <path d="M190,110 Q220,50 250,115 Z" fill={getFill(sectionFills, 'fin-top', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('fin-top')} />
        <path d="M80,220 Q120,80 260,120 Q320,180 290,260 Q180,260 80,220 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M90,215 Q150,160 250,220 Q200,255 110,230 Z" fill={getFill(sectionFills, 'belly', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('belly')} />
        <circle cx="115" cy="155" r="6" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'turtle',
    name: 'Little Sea Turtle',
    category: 'sea',
    icon: '🐢',
    sections: ['bg', 'shell', 'shell-spots', 'head', 'flipper-fl', 'flipper-fr', 'flipper-bl', 'flipper-br'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M110,120 Q60,60 130,100 Z" fill={getFill(sectionFills, 'flipper-fl', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('flipper-fl')} />
        <path d="M290,120 Q340,60 270,100 Z" fill={getFill(sectionFills, 'flipper-fr', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('flipper-fr')} />
        <path d="M120,280 Q70,340 140,300 Z" fill={getFill(sectionFills, 'flipper-bl', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('flipper-bl')} />
        <path d="M280,280 Q330,340 260,300 Z" fill={getFill(sectionFills, 'flipper-br', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('flipper-br')} />
        <circle cx="200" cy="80" r="35" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <circle cx="188" cy="75" r="5" fill={strokeColor} />
        <circle cx="212" cy="75" r="5" fill={strokeColor} />
        <ellipse cx="200" cy="200" rx="90" ry="85" fill={getFill(sectionFills, 'shell', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('shell')} />
        <polygon points="200,140 230,175 218,215 182,215 170,175" fill={getFill(sectionFills, 'shell-spots', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('shell-spots')} />
      </svg>
    )
  }
];

// --- 4. DINOSAURS ---
export const DINOSAUR_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'trex',
    name: 'Friendly T-Rex',
    category: 'dinosaurs',
    icon: '🦖',
    sections: ['bg', 'body', 'head', 'belly', 'teeth', 'tail'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M220,280 Q320,320 350,240 Q310,230 250,250 Z" fill={getFill(sectionFills, 'tail', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tail')} />
        <path d="M120,180 Q100,320 180,340 Q260,330 240,220 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M110,60 Q220,40 220,130 Q160,170 110,150 Z" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('head')} />
        <polygon points="120,140 130,155 140,140 150,155 160,140" fill={getFill(sectionFills, 'teeth', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer" onClick={() => onSectionClick('teeth')} />
        <path d="M140,200 Q180,210 180,310 Q140,300 130,220 Z" fill={getFill(sectionFills, 'belly', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('belly')} />
        <circle cx="170" cy="85" r="7" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'stego',
    name: 'Spike Stegosaurus',
    category: 'dinosaurs',
    icon: '🦕',
    sections: ['bg', 'body', 'head', 'plates', 'legs', 'tail'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="130,150 150,90 170,150 200,80 230,150 260,90 280,150" fill={getFill(sectionFills, 'plates', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('plates')} />
        <path d="M100,230 Q150,130 300,180 Q340,260 280,280 Q140,300 100,230 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="80" cy="230" r="30" fill={getFill(sectionFills, 'head', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('head')} />
        <circle cx="72" cy="225" r="5" fill={strokeColor} />
        <rect x="140" y="270" width="30" height="60" rx="15" fill={getFill(sectionFills, 'legs', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('legs')} />
        <rect x="230" y="270" width="30" height="60" rx="15" fill={getFill(sectionFills, 'legs', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('legs')} />
      </svg>
    )
  }
];

// --- 5. FRUITS ---
export const FRUIT_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'apple',
    name: 'Sweet Apple',
    category: 'fruits',
    icon: '🍎',
    sections: ['bg', 'apple-body', 'leaf', 'stem', 'shine'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M205,100 C195,60 210,40 215,30" fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round" className="cursor-pointer" onClick={() => onSectionClick('stem')} />
        <path d="M210,65 C250,40 270,70 215,80 Z" fill={getFill(sectionFills, 'leaf', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('leaf')} />
        <path d="M200,115 C150,90 50,130 50,230 C50,330 150,360 200,330 C250,360 350,330 350,230 C350,130 250,90 200,115 Z" fill={getFill(sectionFills, 'apple-body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('apple-body')} />
        <ellipse cx="120" cy="180" rx="20" ry="40" fill={getFill(sectionFills, 'shine', '#FFFFFF')} opacity="0.6" className="cursor-pointer" onClick={() => onSectionClick('shine')} />
      </svg>
    )
  },
  {
    id: 'strawberry',
    name: 'Red Strawberry',
    category: 'fruits',
    icon: '🍓',
    sections: ['bg', 'body', 'leaves', 'seeds'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,100 C110,100 70,200 120,310 C160,370 240,370 280,310 C330,200 290,100 200,100 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M120,110 L150,70 L180,105 L200,60 L220,105 L250,70 L280,110 Z" fill={getFill(sectionFills, 'leaves', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('leaves')} />
        <circle cx="150" cy="180" r="6" fill={strokeColor} />
        <circle cx="210" cy="170" r="6" fill={strokeColor} />
        <circle cx="260" cy="190" r="6" fill={strokeColor} />
        <circle cx="170" cy="240" r="6" fill={strokeColor} />
        <circle cx="230" cy="240" r="6" fill={strokeColor} />
        <circle cx="200" cy="290" r="6" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'banana',
    name: 'Yummy Banana',
    category: 'fruits',
    icon: '🍌',
    sections: ['bg', 'peel-main', 'stem', 'tip'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M80,80 Q100,50 120,70 Z" fill={getFill(sectionFills, 'stem', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('stem')} />
        <path d="M100,70 Q350,100 280,320 Q200,340 70,200 Q120,140 100,70 Z" fill={getFill(sectionFills, 'peel-main', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('peel-main')} />
        <path d="M280,320 Q290,340 270,335 Z" fill={getFill(sectionFills, 'tip', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer" onClick={() => onSectionClick('tip')} />
      </svg>
    )
  }
];

// --- 6. VEGETABLES ---
export const VEGETABLE_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'carrot',
    name: 'Crunchy Carrot',
    category: 'vegetables',
    icon: '🥕',
    sections: ['bg', 'body', 'greens'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,120 Q140,30 110,60 Q170,110 190,120 M200,120 Q200,20 230,40 Q210,100 200,120 M200,120 Q260,30 290,60 Q230,110 210,120" fill={getFill(sectionFills, 'greens', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('greens')} />
        <path d="M140,120 Q260,120 210,350 Q200,370 190,350 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M160,170 Q180,175 170,180 M200,220 Q220,225 210,230 M170,270 Q190,275 180,280" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'broccoli',
    name: 'Tree Broccoli',
    category: 'vegetables',
    icon: '🥦',
    sections: ['bg', 'stem', 'crown-top', 'crown-l', 'crown-r'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M160,220 L150,350 Q200,370 250,350 L240,220 Z" fill={getFill(sectionFills, 'stem', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('stem')} />
        <circle cx="120" cy="180" r="60" fill={getFill(sectionFills, 'crown-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('crown-l')} />
        <circle cx="280" cy="180" r="60" fill={getFill(sectionFills, 'crown-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('crown-r')} />
        <circle cx="200" cy="130" r="75" fill={getFill(sectionFills, 'crown-top', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('crown-top')} />
      </svg>
    )
  }
];

// --- 7. VEHICLES ---
export const VEHICLE_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'car',
    name: 'Little Car',
    category: 'vehicles',
    icon: '🚗',
    sections: ['bg', 'body', 'roof', 'windows', 'wheel-f', 'wheel-r', 'headlight'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M120,160 L160,100 L260,100 L300,160 Z" fill={getFill(sectionFills, 'roof', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('roof')} />
        <polygon points="170,110 205,110 205,150 140,150" fill={getFill(sectionFills, 'windows', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('windows')} />
        <polygon points="215,110 250,110 280,150 215,150" fill={getFill(sectionFills, 'windows', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('windows')} />
        <path d="M50,220 Q50,160 110,160 L310,160 Q370,160 370,220 L370,270 L50,270 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <circle cx="60" cy="210" r="12" fill={getFill(sectionFills, 'headlight', '#FFFFFF')} stroke={strokeColor} strokeWidth="3" className="cursor-pointer" onClick={() => onSectionClick('headlight')} />
        <circle cx="120" cy="270" r="35" fill={getFill(sectionFills, 'wheel-f', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('wheel-f')} />
        <circle cx="120" cy="270" r="15" fill={strokeColor} />
        <circle cx="300" cy="270" r="35" fill={getFill(sectionFills, 'wheel-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('wheel-r')} />
        <circle cx="300" cy="270" r="15" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'rocket',
    name: 'Space Rocket',
    category: 'vehicles',
    icon: '🚀',
    sections: ['bg', 'body', 'tip', 'window', 'fin-l', 'fin-r', 'fire'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="170,280 200,360 230,280" fill={getFill(sectionFills, 'fire', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('fire')} />
        <polygon points="140,200 90,280 150,280" fill={getFill(sectionFills, 'fin-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('fin-l')} />
        <polygon points="260,200 310,280 250,280" fill={getFill(sectionFills, 'fin-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('fin-r')} />
        <path d="M150,120 L150,280 L250,280 L250,120 Z" fill={getFill(sectionFills, 'body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('body')} />
        <path d="M150,120 Q200,30 250,120 Z" fill={getFill(sectionFills, 'tip', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('tip')} />
        <circle cx="200" cy="180" r="28" fill={getFill(sectionFills, 'window', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('window')} />
      </svg>
    )
  }
];

// --- 8. SHAPES ---
export const SHAPE_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'circle',
    name: 'Magic Target',
    category: 'shapes',
    icon: '⭕',
    sections: ['bg', 'ring-outer', 'ring-middle', 'ring-inner', 'center-star'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <circle cx="200" cy="200" r="160" fill={getFill(sectionFills, 'ring-outer', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ring-outer')} />
        <circle cx="200" cy="200" r="115" fill={getFill(sectionFills, 'ring-middle', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ring-middle')} />
        <circle cx="200" cy="200" r="70" fill={getFill(sectionFills, 'ring-inner', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('ring-inner')} />
        <polygon points="200,165 208,188 232,188 213,202 220,225 200,210 180,225 187,202 168,188 192,188" fill={getFill(sectionFills, 'center-star', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('center-star')} />
      </svg>
    )
  },
  {
    id: 'star',
    name: 'Super Star',
    category: 'shapes',
    icon: '⭐',
    sections: ['bg', 'point-top', 'point-right', 'point-bottom-right', 'point-bottom-left', 'point-left', 'star-center'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="200,25 245,135 200,200 155,135" fill={getFill(sectionFills, 'point-top', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('point-top')} />
        <polygon points="245,135 365,140 270,215 200,200" fill={getFill(sectionFills, 'point-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('point-right')} />
        <polygon points="270,215 305,335 200,260 200,200" fill={getFill(sectionFills, 'point-bottom-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('point-bottom-right')} />
        <polygon points="200,260 95,335 130,215 200,200" fill={getFill(sectionFills, 'point-bottom-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('point-bottom-left')} />
        <polygon points="130,215 35,140 155,135 200,200" fill={getFill(sectionFills, 'point-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('point-left')} />
        <polygon points="200,150 225,175 215,210 185,210 175,175" fill={getFill(sectionFills, 'star-center', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('star-center')} />
      </svg>
    )
  },
  {
    id: 'heart',
    name: 'Sweet Heart',
    category: 'shapes',
    icon: '💖',
    sections: ['bg', 'heart-left', 'heart-right', 'inner-heart'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,345 C100,265 35,190 35,120 C35,60 80,30 135,30 C175,30 195,55 200,85 L200,345 Z" fill={getFill(sectionFills, 'heart-left', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('heart-left')} />
        <path d="M200,345 L200,85 C205,55 225,30 265,30 C320,30 365,60 365,120 C365,190 300,265 200,345 Z" fill={getFill(sectionFills, 'heart-right', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('heart-right')} />
        <path d="M200,270 C140,210 90,155 90,110 C90,75 115,55 145,55 C170,55 185,70 200,90 C215,70 230,55 255,55 C285,55 310,75 310,110 C310,155 260,210 200,270 Z" fill={getFill(sectionFills, 'inner-heart', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('inner-heart')} />
      </svg>
    )
  }
];

// --- 9. NUMBERS ---
export const NUMBER_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'num_1',
    name: 'Number One (1)',
    category: 'numbers',
    icon: '1️⃣',
    sections: ['bg', 'number-body', 'decor-1'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M140,110 L210,60 L210,320 M160,320 L260,320" fill="none" stroke={strokeColor} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('number-body')} />
        <circle cx="300" cy="100" r="25" fill={getFill(sectionFills, 'decor-1', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('decor-1')} />
      </svg>
    )
  },
  {
    id: 'num_2',
    name: 'Number Two (2)',
    category: 'numbers',
    icon: '2️⃣',
    sections: ['bg', 'number-body', 'decor-1', 'decor-2'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M130,120 Q130,60 200,60 Q270,60 270,130 Q270,200 130,320 L270,320" fill="none" stroke={strokeColor} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('number-body')} />
        <circle cx="90" cy="90" r="20" fill={getFill(sectionFills, 'decor-1', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('decor-1')} />
        <circle cx="310" cy="90" r="20" fill={getFill(sectionFills, 'decor-2', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('decor-2')} />
      </svg>
    )
  }
];

// --- 10. LETTERS ---
export const LETTER_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'letter_a',
    name: 'Letter A (Apple)',
    category: 'letters',
    icon: '🅰️',
    sections: ['bg', 'letter-body', 'mini-apple'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M110,320 L200,60 L290,320 M145,210 L255,210" fill="none" stroke={strokeColor} strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('letter-body')} />
        <circle cx="320" cy="90" r="25" fill={getFill(sectionFills, 'mini-apple', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('mini-apple')} />
      </svg>
    )
  },
  {
    id: 'letter_b',
    name: 'Letter B (Ball)',
    category: 'letters',
    icon: '🅱️',
    sections: ['bg', 'letter-body', 'mini-ball'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M140,60 L140,320 M140,60 C250,60 250,180 140,180 C260,180 260,320 140,320" fill="none" stroke={strokeColor} strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('letter-body')} />
        <circle cx="320" cy="90" r="25" fill={getFill(sectionFills, 'mini-ball', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('mini-ball')} />
      </svg>
    )
  }
];

// --- 11. NATURE ---
export const NATURE_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'sun',
    name: 'Happy Sun',
    category: 'nature',
    icon: '☀️',
    sections: ['bg', 'center-sun', 'rays'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,40 L200,70 M200,330 L200,360 M40,200 L70,200 M330,200 L360,200 M85,85 L108,108 M292,292 L315,315 M315,85 L292,108 M108,292 L85,315" fill="none" stroke={strokeColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={strokeDash} className="cursor-pointer" onClick={() => onSectionClick('rays')} />
        <circle cx="200" cy="200" r="90" fill={getFill(sectionFills, 'center-sun', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('center-sun')} />
        <circle cx="170" cy="180" r="8" fill={strokeColor} />
        <circle cx="230" cy="180" r="8" fill={strokeColor} />
        <path d="M175,220 Q200,245 225,220" fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'rainbow',
    name: 'Rainbow Arc',
    category: 'nature',
    icon: '🌈',
    sections: ['bg', 'arc-1', 'arc-2', 'arc-3', 'cloud-l', 'cloud-r'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M70,280 A130,130 0 0,1 330,280" fill="none" stroke={getFill(sectionFills, 'arc-1', '#FFFFFF')} strokeWidth="24" className="cursor-pointer" onClick={() => onSectionClick('arc-1')} />
        <path d="M70,280 A130,130 0 0,1 330,280" fill="none" stroke={strokeColor} strokeWidth="24" strokeDasharray={strokeDash} pointerEvents="none" />
        <path d="M95,280 A105,105 0 0,1 305,280" fill="none" stroke={getFill(sectionFills, 'arc-2', '#FFFFFF')} strokeWidth="24" className="cursor-pointer" onClick={() => onSectionClick('arc-2')} />
        <path d="M95,280 A105,105 0 0,1 305,280" fill="none" stroke={strokeColor} strokeWidth="24" strokeDasharray={strokeDash} pointerEvents="none" />
        <path d="M120,280 A80,80 0 0,1 280,280" fill="none" stroke={getFill(sectionFills, 'arc-3', '#FFFFFF')} strokeWidth="24" className="cursor-pointer" onClick={() => onSectionClick('arc-3')} />
        <path d="M120,280 A80,80 0 0,1 280,280" fill="none" stroke={strokeColor} strokeWidth="24" strokeDasharray={strokeDash} pointerEvents="none" />
        <circle cx="70" cy="280" r="35" fill={getFill(sectionFills, 'cloud-l', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('cloud-l')} />
        <circle cx="330" cy="280" r="35" fill={getFill(sectionFills, 'cloud-r', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('cloud-r')} />
      </svg>
    )
  }
];

// --- 12. FLOWERS ---
export const FLOWER_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'daisy',
    name: 'Pretty Daisy',
    category: 'flowers',
    icon: '🌼',
    sections: ['bg', 'center', 'petals', 'stem', 'leaf'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,240 L200,370" fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="round" className="cursor-pointer" onClick={() => onSectionClick('stem')} />
        <path d="M200,310 Q250,280 260,320 Z" fill={getFill(sectionFills, 'leaf', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('leaf')} />
        <g className="cursor-pointer" onClick={() => onSectionClick('petals')}>
          <ellipse cx="200" cy="100" rx="20" ry="40" fill={getFill(sectionFills, 'petals', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} />
          <ellipse cx="200" cy="240" rx="20" ry="40" fill={getFill(sectionFills, 'petals', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} />
          <ellipse cx="130" cy="170" rx="40" ry="20" fill={getFill(sectionFills, 'petals', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} />
          <ellipse cx="270" cy="170" rx="40" ry="20" fill={getFill(sectionFills, 'petals', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" strokeDasharray={strokeDash} />
        </g>
        <circle cx="200" cy="170" r="45" fill={getFill(sectionFills, 'center', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('center')} />
      </svg>
    )
  }
];

// --- 13. FOOD ---
export const FOOD_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'pizza',
    name: 'Cheesy Pizza',
    category: 'food',
    icon: '🍕',
    sections: ['bg', 'crust', 'cheese', 'pepperoni-1', 'pepperoni-2', 'pepperoni-3'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M60,110 Q200,30 340,110 L200,360 Z" fill={getFill(sectionFills, 'crust', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('crust')} />
        <path d="M80,120 Q200,60 320,120 L200,330 Z" fill={getFill(sectionFills, 'cheese', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('cheese')} />
        <circle cx="200" cy="140" r="22" fill={getFill(sectionFills, 'pepperoni-1', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('pepperoni-1')} />
        <circle cx="150" cy="210" r="20" fill={getFill(sectionFills, 'pepperoni-2', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('pepperoni-2')} />
        <circle cx="240" cy="220" r="20" fill={getFill(sectionFills, 'pepperoni-3', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('pepperoni-3')} />
      </svg>
    )
  },
  {
    id: 'cupcake',
    name: 'Birthday Cupcake',
    category: 'food',
    icon: '🧁',
    sections: ['bg', 'wrapper', 'frosting', 'cherry'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="120,220 280,220 250,360 150,360" fill={getFill(sectionFills, 'wrapper', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('wrapper')} />
        <path d="M110,220 Q100,140 200,120 Q300,140 290,220 Z" fill={getFill(sectionFills, 'frosting', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('frosting')} />
        <circle cx="200" cy="100" r="22" fill={getFill(sectionFills, 'cherry', '#FFFFFF')} stroke={strokeColor} strokeWidth="5" className="cursor-pointer" onClick={() => onSectionClick('cherry')} />
      </svg>
    )
  }
];

// --- 14. EVERYDAY OBJECTS ---
export const EVERYDAY_TEMPLATES: ColoringTemplate[] = [
  {
    id: 'balloon',
    name: 'Party Balloon',
    category: 'everyday',
    icon: '🎈',
    sections: ['bg', 'balloon-body', 'string'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <path d="M200,270 Q180,320 220,370" fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round" className="cursor-pointer" onClick={() => onSectionClick('string')} />
        <ellipse cx="200" cy="150" rx="100" ry="120" fill={getFill(sectionFills, 'balloon-body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('balloon-body')} />
        <polygon points="190,265 210,265 200,280" fill={strokeColor} />
      </svg>
    )
  },
  {
    id: 'crown',
    name: 'Golden Crown',
    category: 'everyday',
    icon: '👑',
    sections: ['bg', 'crown-body', 'jewel-1', 'jewel-2', 'jewel-3'],
    renderSvg: (sectionFills, onSectionClick, strokeColor = '#0F172A', strokeDash = '0') => (
      <svg viewBox="0 0 400 400" className="w-full h-full aspect-square select-none">
        <rect x="10" y="10" width="380" height="380" rx="32" fill={getFill(sectionFills, 'bg', '#F8FAFC')} stroke={strokeColor} strokeWidth="5" strokeDasharray={strokeDash} className="cursor-pointer hover:opacity-95 transition-colors" onClick={() => onSectionClick('bg')} />
        <polygon points="60,290 80,120 150,220 200,90 250,220 320,120 340,290" fill={getFill(sectionFills, 'crown-body', '#FFFFFF')} stroke={strokeColor} strokeWidth="6" strokeDasharray={strokeDash} strokeLinejoin="round" className="cursor-pointer hover:opacity-90 transition-colors" onClick={() => onSectionClick('crown-body')} />
        <circle cx="80" cy="120" r="14" fill={getFill(sectionFills, 'jewel-1', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('jewel-1')} />
        <circle cx="200" cy="90" r="16" fill={getFill(sectionFills, 'jewel-2', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('jewel-2')} />
        <circle cx="320" cy="120" r="14" fill={getFill(sectionFills, 'jewel-3', '#FFFFFF')} stroke={strokeColor} strokeWidth="4" className="cursor-pointer" onClick={() => onSectionClick('jewel-3')} />
      </svg>
    )
  }
];

// Unified catalog containing all templates across 14 categories
export const ALL_TEMPLATES: ColoringTemplate[] = [
  ...ANIMAL_TEMPLATES,
  ...BIRD_TEMPLATES,
  ...SEA_TEMPLATES,
  ...DINOSAUR_TEMPLATES,
  ...FRUIT_TEMPLATES,
  ...VEGETABLE_TEMPLATES,
  ...VEHICLE_TEMPLATES,
  ...SHAPE_TEMPLATES,
  ...NUMBER_TEMPLATES,
  ...LETTER_TEMPLATES,
  ...NATURE_TEMPLATES,
  ...FLOWER_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...EVERYDAY_TEMPLATES,
];
