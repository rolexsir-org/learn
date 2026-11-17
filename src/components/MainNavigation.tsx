import { useState } from 'react';
import {
  BookOpen,
  Compass,
  Globe2,
  MoreHorizontal,
  Palette,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LearningTab = 'adventure' | 'worlds' | 'story' | 'draw' | 'stickers' | 'quests' | 'friends' | 'leaderboard';

interface NavigationItem {
  id: LearningTab;
  label: string;
  icon: LucideIcon;
  description: string;
}

const items: NavigationItem[] = [
  { id: 'adventure', label: 'Learn', icon: Compass, description: 'Continue your learning adventure' },
  { id: 'worlds', label: 'Worlds', icon: Globe2, description: 'Choose a learning world' },
  { id: 'story', label: 'Stories', icon: BookOpen, description: 'Read and listen to stories' },
  { id: 'draw', label: 'Create', icon: Palette, description: 'Draw and color' },
  { id: 'quests', label: 'Quests', icon: Zap, description: 'See your daily quests' },
  { id: 'stickers', label: 'Stickers', icon: Sparkles, description: 'Visit your sticker album' },
  { id: 'leaderboard', label: 'Practice board', icon: Trophy, description: 'Celebrate your progress' },
  { id: 'friends', label: 'Characters', icon: Users, description: 'Meet your character friends' },
];

interface MainNavigationProps {
  activeTab: LearningTab;
  onNavigate: (tab: LearningTab) => void;
  onOpenParents: () => void;
}

export function MainNavigation({ activeTab, onNavigate, onOpenParents }: MainNavigationProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryMobileItems = items.slice(0, 5);
  const secondaryMobileItems = items.slice(5);
  const secondaryIsActive = secondaryMobileItems.some((item) => item.id === activeTab);

  const select = (tab: LearningTab) => {
    onNavigate(tab);
    setMoreOpen(false);
  };

  return (
    <>
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav aria-label="Learning activities" className="learn-side-nav sticky top-28">
          <p className="learn-nav-caption">Your space</p>
          <div className="space-y-1.5">
            {items.map(({ id, label, icon: Icon, description }) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={selected ? 'page' : undefined}
                  aria-label={description}
                  onClick={() => select(id)}
                  className={`learn-nav-item ${selected ? 'is-active' : ''}`}
                >
                  <Icon aria-hidden="true" size={19} strokeWidth={selected ? 2.2 : 1.8} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div className="learn-nav-divider" />
          <button type="button" className="learn-nav-item learn-parent-link" onClick={onOpenParents}>
            <ShieldCheck aria-hidden="true" size={19} strokeWidth={1.8} />
            <span>For grown-ups</span>
          </button>
          <p className="learn-nav-footnote">A little learning, a lot of wonder.</p>
        </nav>
      </aside>

      <nav aria-label="Learning activities" className="learn-mobile-nav lg:hidden">
        <div className="learn-mobile-nav-row">
          {primaryMobileItems.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={selected ? 'page' : undefined}
                onClick={() => select(id)}
                className={`learn-mobile-nav-item ${selected ? 'is-active' : ''}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={selected ? 2.3 : 1.8} />
                <span>{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="learn-more-menu"
            onClick={() => setMoreOpen((open) => !open)}
            className={`learn-mobile-nav-item ${moreOpen || secondaryIsActive ? 'is-active' : ''}`}
          >
            <MoreHorizontal aria-hidden="true" size={20} />
            <span>More</span>
          </button>
        </div>
        {moreOpen && (
          <div id="learn-more-menu" className="learn-more-menu">
            {secondaryMobileItems.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                type="button"
                aria-current={activeTab === id ? 'page' : undefined}
                aria-label={description}
                onClick={() => select(id)}
                className={`learn-more-item ${activeTab === id ? 'is-active' : ''}`}
              >
                <Icon aria-hidden="true" size={18} />
                <span>{label}</span>
              </button>
            ))}
            <button type="button" className="learn-more-item" onClick={() => { setMoreOpen(false); onOpenParents(); }}>
              <ShieldCheck aria-hidden="true" size={18} />
              <span>For grown-ups</span>
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
