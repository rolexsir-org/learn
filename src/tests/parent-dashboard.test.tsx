import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ParentDashboard from '../components/ParentDashboard';
import { AudioManager } from '../services/AudioManager';

const testStats = {
  wordsLearned: 4,
  accuracy: 88,
  timeSpent: 120,
  streak: 2,
  coins: 15,
  unlockedCharacters: [],
  completedWords: [],
};

describe('Parent dashboard settings', () => {
  it('opens the settings tab after the parent check and exposes the sound switch', async () => {
    const onToggleSound = vi.fn();
    render(
      <ParentDashboard
        stats={testStats}
        soundEnabled
        onToggleSound={onToggleSound}
        onClose={vi.fn()}
        onUnlockCharacter={vi.fn()}
        audioPreferences={AudioManager.getPreferences()}
        onAudioPreferencesChange={vi.fn()}
      />,
    );

    const challenge = screen.getByText(/What is \d+ \+ \d+/).textContent ?? '';
    const numbers = challenge.match(/\d+/g)?.map(Number) ?? [];
    expect(numbers).toHaveLength(2);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Answer to the parent check' }), {
      target: { value: String(numbers[0] + numbers[1]) },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Dashboard' }));
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));

    const soundSwitch = await screen.findByRole('switch', { name: 'All learning audio' });
    expect(soundSwitch).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(soundSwitch);
    expect(onToggleSound).toHaveBeenCalledOnce();
  });
});
