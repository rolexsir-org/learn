import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Award, Info } from 'lucide-react';

interface CompletedWord {
  word: string;
  timestamp: string;
  accuracy: number;
}

interface PhonicsRadarChartProps {
  completedWords: CompletedWord[];
}

interface CategoryData {
  category: string;
  Progress: number; // Volume / Count based (0-100)
  Mastery: number;  // Accuracy based (0-100)
  count: number;
}

// Dynamic helper to categorize words into phonics skill domains
function getPhoneticCategories(wordText: string): string[] {
  const categories: string[] = [];
  const lower = wordText.toLowerCase();

  // 1. Digraphs (sh, ch, th, ck, ph, wh, ng)
  if (/sh|ch|th|ck|ph|wh|ng/.test(lower)) {
    categories.push("Digraphs");
  }

  // 2. Blends (bl, cl, fl, gl, pl, sl, br, cr, dr, fr, gr, pr, tr, sc, sk, sm, sn, sp, st, sw, mp, nt, nd, ld, ft, lf, pt)
  if (/bl|cl|fl|gl|pl|sl|br|cr|dr|fr|gr|pr|tr|sc|sk|sm|sn|sp|st|sw|mp|nt|nd|ld|ft|lf|pt/.test(lower)) {
    categories.push("Blends");
  }

  // 3. Short Vowels (CVC patterns like cat, dog, run, sun)
  if (lower.length === 3 && /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/.test(lower)) {
    categories.push("Short Vowels");
  } else if (/[aeiou]/.test(lower)) {
    categories.push("Vowels");
  }

  // 4. Long Vowels (silent e or vowel teams: ee, ea, oo, ai, ay, ie, oa, ui, ue, etc.)
  if (/[aeiou]e$/.test(lower) || /ee|ea|oo|ai|ay|ie|oa|ui|ue/.test(lower)) {
    categories.push("Long Vowels");
  }

  // 5. Word Endings / Suffixes (y, ing, ed, er, est)
  if (lower.endsWith('y') || lower.endsWith('ing') || lower.endsWith('ed') || lower.endsWith('er')) {
    categories.push("Word Endings");
  }

  // Fallback to Vowels if no other category matches
  if (categories.length === 0) {
    categories.push("Vowels");
  }

  return categories;
}

export default function PhonicsRadarChart({ completedWords = [] }: PhonicsRadarChartProps) {
  // Define standard phonetic domains
  const categoriesList = [
    "Short Vowels",
    "Blends",
    "Digraphs",
    "Long Vowels",
    "Word Endings"
  ];

  // Map words into counts & accuracies for each domain
  const statsMap = categoriesList.reduce((acc, cat) => {
    acc[cat] = { totalAccuracy: 0, count: 0 };
    return acc;
  }, {} as Record<string, { totalAccuracy: number; count: 0 }>);

  completedWords.forEach((item) => {
    const cats = getPhoneticCategories(item.word);
    cats.forEach((cat) => {
      if (statsMap[cat] !== undefined) {
        statsMap[cat].count += 1;
        statsMap[cat].totalAccuracy += (item.accuracy ?? 100);
      }
    });
  });

  const chartData: CategoryData[] = categoriesList.map((cat) => {
    const stat = statsMap[cat];
    const count = stat.count;
    // 1 completed word = 25% progress, up to 100% (4 words)
    const progress = Math.min(100, count * 25);
    const mastery = count > 0 ? Math.round(stat.totalAccuracy / count) : 0;

    return {
      category: cat,
      Progress: progress,
      Mastery: mastery,
      count
    };
  });

  // Custom tooltips to present details professionally
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData;
      return (
        <div className="bg-white p-3.5 border-2 border-stone-200 shadow-xl rounded-2xl text-xs">
          <p className="font-black text-stone-800 uppercase tracking-tight mb-1.5">{data.category}</p>
          <div className="space-y-1 font-bold text-stone-500 uppercase tracking-wide text-[10px]">
            <p className="flex items-center justify-between gap-4">
              <span>Words Learned:</span>
              <span className="text-stone-800 font-black">{data.count}</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span>Domain Progress:</span>
              <span className="text-blue-600 font-black">{data.Progress}%</span>
            </p>
            <p className="flex items-center justify-between gap-4">
              <span>Skill Mastery:</span>
              <span className="text-green-600 font-black">{data.Mastery}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const hasLearnedWords = completedWords.length > 0;

  return (
    <div className="w-full bg-stone-50 rounded-[32px] p-6 border-2 border-stone-100 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-black text-stone-800 text-sm uppercase tracking-tight">Phonetic Skills Analysis</h3>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Category-based mastery and coverage</p>
        </div>
        <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100">
          <Award className="w-4 h-4" />
        </div>
      </div>

      <div className="h-[250px] w-full flex items-center justify-center relative">
        {hasLearnedWords ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#E7E5E4" strokeWidth={1.5} />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fill: '#78716C', fontSize: 10, fontWeight: 900, letterSpacing: '0.05em' }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#A8A29E', fontSize: 8 }}
                axisLine={false}
              />
              <Radar
                name="Mastery"
                dataKey="Mastery"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
              <Radar
                name="Progress"
                dataKey="Progress"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.15}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200 mb-3">
              <Info className="w-5 h-5 text-stone-400" />
            </div>
            <p className="text-xs font-black text-stone-500 uppercase tracking-wider">Awaiting More Data</p>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest max-w-[200px] mt-1">
              Phonics metrics will appear once word challenges are completed!
            </p>
          </div>
        )}
      </div>

      {hasLearnedWords && (
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500" />
            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Domain Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
            <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Skill Mastery</span>
          </div>
        </div>
      )}
    </div>
  );
}
