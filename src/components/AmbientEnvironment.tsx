import React from 'react';
import type { ThemedWorld } from '../constants';

interface AmbientEnvironmentProps {
  world: ThemedWorld;
  /** Kept for existing call sites; audio is managed centrally by AudioManager. */
  soundEnabled: boolean;
  children: React.ReactNode;
}

/** Visual shell only. Audio lifecycle and world music are owned by AudioManager. */
export default function AmbientEnvironment({ children }: AmbientEnvironmentProps) {
  return <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f6f8f7]">{children}</div>;
}
