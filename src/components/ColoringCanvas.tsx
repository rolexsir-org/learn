import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Eraser, Trash2, Download, Sparkles, RefreshCw, Undo, Redo, Paintbrush, Heart, Star, Smile, Circle, Shapes, Cat, Type, PaintBucket, Wand2, ChevronLeft, ChevronRight, CheckCircle2, ListOrdered, ArrowRight, Trophy, Play, Check, FastForward } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { fireWordCompleteConfetti } from '../utils/confetti';
import { ALL_TEMPLATES, DRAW_CATEGORIES, TemplateCategory, ColoringTemplate } from './ColoringTemplates';
import { DeviceService } from '../services/DeviceService';
import { StorageService } from '../services/StorageService';
import { ExplorerButton, ExplorerCard, IconBadge, ProgressPill } from './UiCore';
import { cn } from '../lib/utils';

interface ColoringCanvasProps {
  currentWord?: string;
  soundEnabled: boolean;
  onRewardStars?: (stars: number) => void;
}

const PALETTE_COLORS = [
  { name: 'Cherry Red', hex: '#EF4444', border: 'border-red-600' },
  { name: 'Sunny Orange', hex: '#F97316', border: 'border-orange-600' },
  { name: 'Vibrant Yellow', hex: '#FACC15', border: 'border-yellow-600' },
  { name: 'Meadow Green', hex: '#22C55E', border: 'border-green-600' },
  { name: 'Sky Cyan', hex: '#06B6D4', border: 'border-cyan-600' },
  { name: 'Ocean Blue', hex: '#3B82F6', border: 'border-blue-600' },
  { name: 'Royal Purple', hex: '#A855F7', border: 'border-purple-600' },
  { name: 'Bubblegum Pink', hex: '#EC4899', border: 'border-pink-600' },
  { name: 'Lavender Soft', hex: '#C084FC', border: 'border-purple-300' },
  { name: 'Mint Fresh', hex: '#34D399', border: 'border-emerald-400' },
  { name: 'Chocolate Brown', hex: '#78350F', border: 'border-amber-900' },
  { name: 'Midnight Black', hex: '#1E293B', border: 'border-slate-900' },
  { name: 'Rainbow Magic ✨', hex: 'RAINBOW', border: 'border-purple-400' }
];

const BRUSH_SIZES = [
  { name: 'Fine', size: 6, label: '•' },
  { name: 'Medium', size: 14, label: '••' },
  { name: 'Thick', size: 28, label: '•••' },
  { name: 'Super Stamp', size: 48, label: '●' }
];

const STAMPS = ['⭐', '💖', '🌟', '🎨', '🦁', '🚀', '👑', '🌈', '🐾', '🌸', '🎈', '⚡'];

export const ColoringCanvas: React.FC<ColoringCanvasProps> = ({
  currentWord = 'FUN',
  soundEnabled,
  onRewardStars
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [selectedSize, setSelectedSize] = useState<number>(14);
  const [toolMode, setToolMode] = useState<'pen' | 'bucket' | 'eraser' | 'stamp'>('pen');
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [showTracingOverlay, setShowTracingOverlay] = useState(true);

  // Template State
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory | 'words'>('animals');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('lion');
  const [useDashedOutline, setUseDashedOutline] = useState<boolean>(false);
  const [templateFills, setTemplateFills] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = StorageService.getItemSync('coloring_template_fills_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load coloring template fills:', e);
    }
    return {};
  });

  // Auto-save template fills on change
  useEffect(() => {
    try {
      StorageService.setItem('coloring_template_fills_v1', JSON.stringify(templateFills));
      StorageService.saveUserProgressSync({ templateFills });
    } catch (e) {
      console.warn('Failed to save coloring template fills:', e);
    }
  }, [templateFills]);

  // Sequence Guided Drawing State
  const [isSequenceMode, setIsSequenceMode] = useState<boolean>(true);
  const [currentSequenceStep, setCurrentSequenceStep] = useState<number>(0);
  const [isSequenceComplete, setIsSequenceComplete] = useState<boolean>(false);

  // History for undo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Active template
  const activeTemplate = ALL_TEMPLATES.find(t => t.id === selectedTemplateId);
  const categoryTemplates = ALL_TEMPLATES.filter(t => t.category === templateCategory);
  const currentTemplateIdx = categoryTemplates.findIndex(t => t.id === selectedTemplateId);

  // Reset sequence step on template change
  useEffect(() => {
    setCurrentSequenceStep(0);
    setIsSequenceComplete(false);
  }, [selectedTemplateId]);

  // Format friendly label for section names
  const formatSectionLabel = (secId?: string) => {
    if (!secId) return 'Section';
    return secId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Handle Sectional Tap-to-Fill with Sequence Step Progress
  const handleSectionClick = (sectionId: string) => {
    let fillColor = selectedColor;
    if (selectedColor === 'RAINBOW') {
      const rainbowColors = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#06B6D4', '#3B82F6', '#A855F7', '#EC4899'];
      fillColor = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    }

    setTemplateFills(prev => ({
      ...prev,
      [selectedTemplateId]: {
        ...(prev[selectedTemplateId] || {}),
        [sectionId]: fillColor
      }
    }));

    soundFx.playChime(soundEnabled);

    // Sequence step auto-advancement
    if (isSequenceMode && activeTemplate && activeTemplate.sections.length > 0) {
      const currentTarget = activeTemplate.sections[currentSequenceStep];
      if (sectionId === currentTarget || currentSequenceStep < activeTemplate.sections.length) {
        const nextStep = currentSequenceStep + 1;
        if (nextStep >= activeTemplate.sections.length) {
          setIsSequenceComplete(true);
          fireWordCompleteConfetti();
          soundFx.playSuccessFanfare(soundEnabled);
          onRewardStars?.(10);
        } else {
          setCurrentSequenceStep(nextStep);
        }
      }
    }
  };

  const handleNextStepInSequence = () => {
    if (!activeTemplate) return;
    if (currentSequenceStep < activeTemplate.sections.length - 1) {
      setCurrentSequenceStep(prev => prev + 1);
      soundFx.playPop(soundEnabled);
    } else {
      setIsSequenceComplete(true);
      fireWordCompleteConfetti();
      soundFx.playSuccessFanfare(soundEnabled);
      onRewardStars?.(10);
    }
  };

  const handlePrevStepInSequence = () => {
    if (currentSequenceStep > 0) {
      setCurrentSequenceStep(prev => prev - 1);
      soundFx.playPop(soundEnabled);
    }
  };

  const handleFillCurrentSequenceStep = () => {
    if (!activeTemplate) return;
    const targetSection = activeTemplate.sections[currentSequenceStep];
    if (targetSection) {
      handleSectionClick(targetSection);
    }
  };

  const handleNextTemplateInSequence = () => {
    if (categoryTemplates.length === 0) return;
    const nextIdx = (currentTemplateIdx + 1) % categoryTemplates.length;
    setSelectedTemplateId(categoryTemplates[nextIdx].id);
    soundFx.playPop(soundEnabled);
  };

  const handlePrevTemplateInSequence = () => {
    if (categoryTemplates.length === 0) return;
    const prevIdx = (currentTemplateIdx - 1 + categoryTemplates.length) % categoryTemplates.length;
    setSelectedTemplateId(categoryTemplates[prevIdx].id);
    soundFx.playPop(soundEnabled);
  };

  // Setup canvas resolution and default background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Initial white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Save initial blank state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryStep(0);
  }, []);

  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStep = historyStep - 1;
    if (history[newStep]) {
      ctx.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
      soundFx.playPop(soundEnabled);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (!e.touches || e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0]?.clientX || 0;
      clientY = e.touches[0]?.clientY || 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Perform Flood Fill Bucket Tool
  const performFloodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const rect = canvas.getBoundingClientRect();
    const px = Math.floor((startX / rect.width) * width);
    const py = Math.floor((startY / rect.height) * height);

    if (px < 0 || px >= width || py < 0 || py >= height) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let r = 59, g = 130, b = 246; // default blue
    if (selectedColor === 'RAINBOW') {
      const rainbowList = [[239, 68, 68], [249, 115, 22], [250, 204, 21], [34, 197, 94], [59, 130, 246], [168, 85, 247], [236, 72, 153]];
      const pick = rainbowList[Math.floor(Math.random() * rainbowList.length)];
      r = pick[0]; g = pick[1]; b = pick[2];
    } else {
      const hex = selectedColor.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16) || 0;
      g = parseInt(hex.substring(2, 4), 16) || 0;
      b = parseInt(hex.substring(4, 6), 16) || 0;
    }

    const startPos = (py * width + px) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Don't fill if same color or dark line
    if (Math.abs(startR - r) < 15 && Math.abs(startG - g) < 15 && Math.abs(startB - b) < 15) return;

    const queue: [number, number][] = [[px, py]];
    const visited = new Uint8Array(width * height);
    visited[py * width + px] = 1;

    const matchTarget = (index: number) => {
      return Math.abs(data[index] - startR) < 35 &&
             Math.abs(data[index + 1] - startG) < 35 &&
             Math.abs(data[index + 2] - startB) < 35 &&
             Math.abs(data[index + 3] - startA) < 35;
    };

    let pixelsFilled = 0;
    const maxPixels = width * height;

    while (queue.length > 0 && pixelsFilled < maxPixels) {
      const [cx, cy] = queue.pop()!;
      const idx = (cy * width + cx) * 4;

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
      pixelsFilled++;

      const neighbors: [number, number][] = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];

      for (let i = 0; i < 4; i++) {
        const nx = neighbors[i][0];
        const ny = neighbors[i][1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const npos = ny * width + nx;
          if (!visited[npos]) {
            visited[npos] = 1;
            if (matchTarget(npos * 4)) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    saveStateToHistory();
    soundFx.playChime(soundEnabled);
  };

  const handleMagicAutoColor = () => {
    if (activeTemplate) {
      const samplePalette = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#06B6D4', '#3B82F6', '#A855F7', '#EC4899', '#C084FC', '#34D399'];
      const newFills: Record<string, string> = {};
      activeTemplate.sections.forEach((secId, idx) => {
        newFills[secId] = samplePalette[idx % samplePalette.length];
      });

      setTemplateFills(prev => ({
        ...prev,
        [selectedTemplateId]: newFills
      }));
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scatter fun stamp sparkles around the animal
        const autoStamps = ['⭐', '💖', '✨', '🌸', '🎈', '🌟'];
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < 8; i++) {
          const rx = Math.random() * (rect.width - 60) + 30;
          const ry = Math.random() * (rect.height - 60) + 30;
          const stamp = autoStamps[Math.floor(Math.random() * autoStamps.length)];
          ctx.fillText(stamp, rx, ry);
        }
        saveStateToHistory();
      }
    }

    fireWordCompleteConfetti();
    soundFx.playSuccessFanfare(soundEnabled);
    if (onRewardStars) onRewardStars(3);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (toolMode === 'bucket') {
      performFloodFill(x, y);
      return;
    }

    if (toolMode === 'stamp') {
      ctx.font = `${selectedSize * 2}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      saveStateToHistory();
      soundFx.playChime(soundEnabled);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (selectedColor === 'RAINBOW' && toolMode === 'pen') {
      const rainbowColors = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'];
      ctx.strokeStyle = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    } else {
      ctx.strokeStyle = toolMode === 'eraser' ? '#FFFFFF' : selectedColor;
    }

    ctx.lineWidth = selectedSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || toolMode === 'stamp' || toolMode === 'bucket') return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (selectedColor === 'RAINBOW' && toolMode === 'pen') {
      const rainbowColors = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#3B82F6', '#A855F7'];
      ctx.strokeStyle = rainbowColors[Math.floor(Math.random() * rainbowColors.length)];
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveStateToHistory();
    }
  };

  const clearCanvas = () => {
    setTemplateFills(prev => ({
      ...prev,
      [selectedTemplateId]: {}
    }));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveStateToHistory();
    soundFx.playPop(soundEnabled);
  };

  const triggerDownload = (sourceCanvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `my-coloring-${selectedTemplateId || currentWord.toLowerCase()}.png`;
    link.href = sourceCanvas.toDataURL('image/png');
    link.click();

    fireWordCompleteConfetti();
    soundFx.playSuccessFanfare(soundEnabled);
    if (onRewardStars) onRewardStars(5);
  };

  const handleDownloadArt = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw user painted artwork
    tempCtx.drawImage(canvas, 0, 0);

    // If tracing outline is enabled, render SVG on top before exporting
    if (showTracingOverlay) {
      if (templateCategory === 'words') {
        tempCtx.save();
        tempCtx.font = '900 120px sans-serif';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.strokeStyle = '#0F172A';
        tempCtx.lineWidth = 8;
        if (useDashedOutline) tempCtx.setLineDash([12, 8]);
        tempCtx.strokeText(currentWord.toUpperCase(), tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.restore();
        triggerDownload(tempCanvas);
      } else {
        const svgContainer = DeviceService.getElementById('coloring-outline-svg-container');
        if (svgContainer) {
          const svgEl = svgContainer.querySelector('svg');
          if (svgEl) {
            const xml = new XMLSerializer().serializeToString(svgEl);
            const svg64 = btoa(unescape(encodeURIComponent(xml)));
            const image = new Image();
            image.onload = () => {
              tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
              triggerDownload(tempCanvas);
            };
            image.src = 'data:image/svg+xml;base64,' + svg64;
            return;
          }
        }
        triggerDownload(tempCanvas);
      }
    } else {
      triggerDownload(tempCanvas);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 rounded-[32px] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-100 border border-white/30">
            <Palette className="w-4 h-4 text-amber-200" /> Pre-Drawn Magic Studio
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Pick an Animal or Shape & Add Colors! 🎨
          </h2>
          <p className="text-xs md:text-sm text-pink-100 font-medium">
            Lines are pre-drawn for you! Use brushes, magic fill bucket, and colorful stamps!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 z-10">
          <ExplorerButton
            variant={showTracingOverlay ? "primary" : "glass"}
            size="sm"
            onClick={() => {
              setShowTracingOverlay(!showTracingOverlay);
              soundFx.playPop();
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>{showTracingOverlay ? 'Outline ON' : 'Outline OFF'}</span>
          </ExplorerButton>

          <ExplorerButton
            variant="glass"
            size="sm"
            onClick={handleDownloadArt}
            className="text-rose-600"
          >
            <Download className="w-4 h-4" />
            <span>Save Art</span>
          </ExplorerButton>
        </div>
      </div>

      {/* Main Drawing Layout */}
      <ExplorerCard className="p-4 md:p-8 space-y-6">
        
        {/* Tool Selector Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-4 rounded-3xl border-2 border-stone-100 shadow-inner-soft">
          {/* Pen / Bucket / Eraser / Stamp Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <ExplorerButton
              variant={toolMode === 'pen' ? 'primary' : 'glass'}
              size="sm"
              onClick={() => { setToolMode('pen'); soundFx.playPop(); }}
            >
              <Paintbrush className="w-4 h-4" />
              <span>Brush</span>
            </ExplorerButton>

            <ExplorerButton
              variant={toolMode === 'bucket' ? 'primary' : 'glass'}
              size="sm"
              onClick={() => { setToolMode('bucket'); soundFx.playPop(); }}
            >
              <PaintBucket className="w-4 h-4" />
              <span>Magic Fill</span>
            </ExplorerButton>

            <ExplorerButton
              variant={toolMode === 'eraser' ? 'danger' : 'glass'}
              size="sm"
              onClick={() => { setToolMode('eraser'); soundFx.playPop(); }}
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </ExplorerButton>

            <ExplorerButton
              variant={toolMode === 'stamp' ? 'secondary' : 'glass'}
              size="sm"
              onClick={() => { setToolMode('stamp'); soundFx.playPop(); }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Stamps</span>
            </ExplorerButton>
          </div>

          {/* Brush Sizes */}
          {toolMode !== 'stamp' && toolMode !== 'bucket' && (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mr-1">Size:</span>
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.size}
                  onClick={() => {
                    setSelectedSize(b.size);
                    soundFx.playPop(soundEnabled);
                  }}
                  className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                    selectedSize === b.size
                      ? 'bg-amber-400 text-amber-950 font-black scale-110 shadow-xs'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons: Magic Auto Color, Undo & Clear */}
          <div className="flex items-center gap-2">
            <ExplorerButton
              variant="secondary"
              size="sm"
              onClick={handleMagicAutoColor}
              className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 border-none shadow-md text-white"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline">Magic Color</span>
            </ExplorerButton>

            <ExplorerButton
              variant="glass"
              size="sm"
              onClick={handleUndo}
              disabled={historyStep <= 0}
            >
              <Undo className="w-4 h-4" />
            </ExplorerButton>

            <ExplorerButton
              variant="danger"
              size="sm"
              onClick={clearCanvas}
              className="bg-rose-50 text-rose-600 border-rose-100"
            >
              <Trash2 className="w-4 h-4" />
            </ExplorerButton>
          </div>
        </div>

        {/* Color Palette Selector */}
        {(toolMode === 'pen' || toolMode === 'bucket') && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
            {PALETTE_COLORS.map((c) => {
              const isSelected = selectedColor === c.hex;
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedColor(c.hex);
                    soundFx.playPop(soundEnabled);
                  }}
                  className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-4 ${c.border} transition-all cursor-pointer shadow-sm relative flex items-center justify-center ${
                    isSelected ? 'scale-125 ring-4 ring-amber-400/60 z-10' : 'hover:scale-110'
                  }`}
                  style={{
                    background: c.hex === 'RAINBOW'
                      ? 'linear-gradient(135deg, #EF4444, #F97316, #FACC15, #22C55E, #3B82F6, #A855F7)'
                      : c.hex
                  }}
                  title={c.name}
                >
                  {c.hex === 'RAINBOW' && <Sparkles className="w-4 h-4 text-white drop-shadow-md" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Stamp Selector */}
        {toolMode === 'stamp' && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-amber-50 rounded-2xl border border-amber-200">
            {STAMPS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedStamp(s);
                  soundFx.playPop(soundEnabled);
                }}
                className={`w-10 h-10 text-2xl rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                  selectedStamp === s
                    ? 'bg-amber-300 border-amber-500 scale-125 shadow-md'
                    : 'bg-white border-stone-200 hover:scale-110'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Canvas Surface with Pre-Drawn Line Art Overlay */}
        <div className="relative w-full aspect-square max-w-[460px] mx-auto rounded-3xl border-4 border-stone-200 overflow-hidden bg-white shadow-inner touch-none">
          {/* Pre-drawn Sectional Vector Artwork Overlay (z-20) */}
          {showTracingOverlay && (
            <div
              id="coloring-outline-svg-container"
              className="absolute inset-0 flex items-center justify-center select-none z-20 p-2 sm:p-4 pointer-events-none"
            >
              {templateCategory === 'words' ? (
                <div className="flex items-center justify-center w-full h-full opacity-90">
                  <span className="text-7xl md:text-9xl font-black text-slate-800 tracking-widest border-4 border-dashed border-slate-600 p-8 rounded-[40px]">
                    {currentWord.toUpperCase()}
                  </span>
                </div>
              ) : activeTemplate ? (
                <div className="w-full h-full flex items-center justify-center text-slate-900 opacity-98 pointer-events-auto">
                  {activeTemplate.renderSvg(
                    templateFills[selectedTemplateId] || {},
                    handleSectionClick,
                    '#0F172A',
                    useDashedOutline ? '8,6' : '0'
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Interactive HTML5 Canvas (z-10 for painting colors directly underneath the pre-drawn outlines) */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full relative z-10 cursor-crosshair touch-none gpu-accelerated"
          />
        </div>

        {/* Template Category & Outline Selector (Moved to Bottom) */}
        <div className="bg-amber-50 p-3.5 rounded-3xl border-2 border-amber-200 space-y-3">
          {/* Simplified 6 Kid Themes Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar bg-white p-2 rounded-2xl border border-amber-200/80 shadow-xs">
            {[
              { id: 'animals', name: 'Animals', icon: '🐾', cats: ['animals', 'birds', 'sea', 'dinosaurs'] },
              { id: 'food', name: 'Food', icon: '🍎', cats: ['fruits', 'vegetables', 'food'] },
              { id: 'vehicles', name: 'Vehicles', icon: '🚗', cats: ['vehicles'] },
              { id: 'shapes', name: 'Shapes & ABCs', icon: '📐', cats: ['shapes', 'numbers', 'letters'] },
              { id: 'nature', name: 'Nature', icon: '☀️', cats: ['nature', 'flowers', 'everyday'] },
              { id: 'words', name: 'Word Trace', icon: '🔤', cats: ['words'] },
            ].map((theme) => {
              const isSelected =
                theme.id === 'words'
                  ? templateCategory === 'words'
                  : theme.cats.includes(templateCategory as string);

              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    if (theme.id === 'words') {
                      setTemplateCategory('words');
                      setSelectedTemplateId('words');
                    } else {
                      const firstCat = theme.cats[0] as TemplateCategory;
                      setTemplateCategory(firstCat);
                      const firstTemplate = ALL_TEMPLATES.find((t) => t.category === firstCat);
                      if (firstTemplate) {
                        setSelectedTemplateId(firstTemplate.id);
                      }
                    }
                    soundFx.playPop(soundEnabled);
                  }}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-amber-950 shadow-md scale-102'
                      : 'text-stone-600 hover:bg-amber-100/50'
                  }`}
                >
                  <span className="text-base">{theme.icon}</span>
                  <span>{theme.name}</span>
                </button>
              );
            })}
          </div>

          {/* Template Selection Cards Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {templateCategory === 'words' ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-amber-200 text-xs font-black text-amber-900">
                <span>Current Word to Trace:</span>
                <span className="bg-amber-200 px-3 py-1 rounded-xl text-amber-950 tracking-widest text-sm uppercase">
                  {currentWord}
                </span>
              </div>
            ) : (
              ALL_TEMPLATES.filter((t) => {
                if (['animals', 'birds', 'sea', 'dinosaurs'].includes(templateCategory)) {
                  return ['animals', 'birds', 'sea', 'dinosaurs'].includes(t.category);
                }
                if (['fruits', 'vegetables', 'food'].includes(templateCategory)) {
                  return ['fruits', 'vegetables', 'food'].includes(t.category);
                }
                if (['shapes', 'numbers', 'letters'].includes(templateCategory)) {
                  return ['shapes', 'numbers', 'letters'].includes(t.category);
                }
                if (['nature', 'flowers', 'everyday'].includes(templateCategory)) {
                  return ['nature', 'flowers', 'everyday'].includes(t.category);
                }
                return t.category === templateCategory;
              }).map((t) => {
                const isSelected = selectedTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      soundFx.playPop(soundEnabled);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 font-black text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105 shadow-md'
                        : 'bg-white border-amber-200/80 text-stone-700 hover:bg-amber-100/40'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span>{t.name}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Simple Guided Step Banner for Kids */}
          {templateCategory !== 'words' && activeTemplate && (
            <div className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-300 p-3 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-2 mt-1">
              <div className="flex items-center gap-2">
                <span className="bg-white text-amber-950 px-3 py-1 rounded-xl text-xs font-black shadow-xs flex items-center gap-1">
                  🎯 Step {Math.min(currentSequenceStep + 1, activeTemplate.sections.length)} / {activeTemplate.sections.length}
                </span>
                <span className="text-xs md:text-sm font-black text-amber-950">
                  Tap to color the <span className="underline decoration-amber-600">{formatSectionLabel(activeTemplate.sections[currentSequenceStep])}</span>!
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFillCurrentSequenceStep}
                  className="px-3.5 py-2 bg-white text-amber-950 hover:bg-amber-50 rounded-xl font-black text-xs border border-amber-400 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Magic Color ✨</span>
                </button>

                <button
                  onClick={handleNextTemplateInSequence}
                  className="px-3 py-2 bg-amber-950 text-amber-100 hover:bg-black rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  title="Next picture"
                >
                  <span>Next Picture ➡️</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sequence Completion Banner */}
        <AnimatePresence>
          {isSequenceComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 p-4 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0 backdrop-blur-md">
                  🏆
                </div>
                <div>
                  <h4 className="font-black text-lg leading-tight">Sequence Mastered! 🎉</h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    You completed all steps in order and earned <strong className="text-amber-200">+10 Reward Stars ⭐</strong>!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSequenceComplete(false);
                  handleNextTemplateInSequence();
                }}
                className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <span>Next Template in Sequence</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </ExplorerCard>
    </div>
  );
};

export default ColoringCanvas;

