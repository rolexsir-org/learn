import { ArrowDown, ArrowUpRight, Flame, Star } from 'lucide-react';
import type { ThemedWorld } from '../constants';

interface LearningHomeProps {
  world: ThemedWorld;
  stars: number;
  wordsLearned: number;
  streak: number;
  onExploreWorlds: () => void;
}

function scrollToPractice() {
  const practice = document.getElementById('word-game');
  if (!practice) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  practice.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
}

export function LearningHome({ world, stars, wordsLearned, streak, onExploreWorlds }: LearningHomeProps) {
  return (
    <section id="learn-home" className="learn-home" aria-labelledby="home-title">
      <div className="learn-home-hero">
        <div className="learn-home-copy">
          <p className="learn-eyebrow">YOUR LEARNING SPACE</p>
          <h1 id="home-title">Ready for a little adventure?</h1>
          <p className="learn-home-description">
            Small steps make bright discoveries. Pick up where you left off, or find a new world to explore.
          </p>
          <div className="learn-home-actions">
            <button type="button" className="learn-primary-action" onClick={scrollToPractice}>
              Continue learning <ArrowDown aria-hidden="true" size={17} />
            </button>
            <button type="button" className="learn-secondary-action" onClick={onExploreWorlds}>
              Explore worlds <ArrowUpRight aria-hidden="true" size={17} />
            </button>
          </div>
        </div>
        <div className="learn-world-art" aria-label={`Current world: ${world.name}`} role="img">
          <div className="learn-art-orbit learn-art-orbit-one" />
          <div className="learn-art-orbit learn-art-orbit-two" />
          <span className="learn-world-emoji" aria-hidden="true">{world.emoji}</span>
          <div className="learn-world-tag">
            <span className="learn-world-dot" />
            <span>{world.name}</span>
          </div>
        </div>
      </div>

      <div className="learn-home-summary">
        <div className="learn-summary-heading">
          <div>
            <p className="learn-eyebrow">A LOOK AT YOUR JOURNEY</p>
            <h2>Your progress, at a glance</h2>
          </div>
          <span className="learn-summary-note">Every little win counts.</span>
        </div>
        <div className="learn-stat-grid" aria-label="Learning progress">
          <article className="learn-stat-card">
            <span className="learn-stat-icon learn-stat-icon-star"><Star aria-hidden="true" size={19} fill="currentColor" /></span>
            <div><p className="learn-stat-label">Stars collected</p><p className="learn-stat-value">{stars.toLocaleString()}</p></div>
          </article>
          <article className="learn-stat-card">
            <span className="learn-stat-icon learn-stat-icon-words" aria-hidden="true">Aa</span>
            <div><p className="learn-stat-label">Words explored</p><p className="learn-stat-value">{wordsLearned.toLocaleString()}</p></div>
          </article>
          <article className="learn-stat-card">
            <span className="learn-stat-icon learn-stat-icon-streak"><Flame aria-hidden="true" size={19} /></span>
            <div><p className="learn-stat-label">Day streak</p><p className="learn-stat-value">{streak.toLocaleString()} <span className="learn-stat-unit">days</span></p></div>
          </article>
        </div>
      </div>
    </section>
  );
}
