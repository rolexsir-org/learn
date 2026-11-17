import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MainNavigation } from '../components/MainNavigation';
import { LearningHome } from '../components/LearningHome';
import { THEMED_WORLDS } from '../constants';

describe('LEARN navigation', () => {
  it('navigates to a selected learning area', () => {
    const onNavigate = vi.fn();
    render(<MainNavigation activeTab="adventure" onNavigate={onNavigate} onOpenParents={vi.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Choose a learning world' })[0]);
    expect(onNavigate).toHaveBeenCalledWith('worlds');
  });

  it('reveals secondary activities from the mobile More menu', () => {
    const onNavigate = vi.fn();
    render(<MainNavigation activeTab="adventure" onNavigate={onNavigate} onOpenParents={vi.fn()} />);

    const moreButton = screen.getByRole('button', { name: 'More' });
    fireEvent.click(moreButton);
    expect(moreButton).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getAllByRole('button', { name: 'Visit your sticker album' }).at(-1)!);
    expect(onNavigate).toHaveBeenCalledWith('stickers');
    expect(moreButton).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('LearningHome', () => {
  it('summarizes the learner journey and opens the world picker', () => {
    const onExploreWorlds = vi.fn();
    render(
      <LearningHome
        world={THEMED_WORLDS[0]}
        stars={24}
        wordsLearned={8}
        streak={3}
        onExploreWorlds={onExploreWorlds}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ready for a little adventure?' })).toBeInTheDocument();
    expect(screen.getByText('Stars collected')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Explore worlds/ }));
    expect(onExploreWorlds).toHaveBeenCalledOnce();
  });
});
