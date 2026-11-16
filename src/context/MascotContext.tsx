import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MascotEmotion = 'happy' | 'thinking' | 'excited' | 'proud' | 'cheering';

interface MascotContextType {
  currentMessage: string | null;
  emotion: MascotEmotion;
  mascotName: string;
  mascotEmoji: string;
  isMinimized: boolean;
  showThoughtBubble: (message: string, emotion?: MascotEmotion, durationMs?: number) => void;
  hideThoughtBubble: () => void;
  setMascotCharacter: (name: string, emoji: string) => void;
  toggleMinimize: () => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const MascotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMessage, setCurrentMessage] = useState<string | null>(
    "Hi Explorer! I'm floating here to cheer you on! Tap me anytime for fun facts!"
  );
  const [emotion, setEmotion] = useState<MascotEmotion>('happy');
  const [mascotName, setMascotName] = useState<string>('Barnaby Bear');
  const [mascotEmoji, setMascotEmoji] = useState<string>('🐻');
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Auto-hide thought bubble after duration if set
  useEffect(() => {
    if (currentMessage) {
      const timer = setTimeout(() => {
        // Keep a default subtle tip or clear message after 8 seconds
        setCurrentMessage(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  const showThoughtBubble = (message: string, newEmotion: MascotEmotion = 'happy', durationMs: number = 7000) => {
    setCurrentMessage(message);
    setEmotion(newEmotion);
    setIsMinimized(false);
  };

  const hideThoughtBubble = () => {
    setCurrentMessage(null);
  };

  const setMascotCharacter = (name: string, emoji: string) => {
    setMascotName(name);
    setMascotEmoji(emoji);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <MascotContext.Provider
      value={{
        currentMessage,
        emotion,
        mascotName,
        mascotEmoji,
        isMinimized,
        showThoughtBubble,
        hideThoughtBubble,
        setMascotCharacter,
        toggleMinimize
      }}
    >
      {children}
    </MascotContext.Provider>
  );
};

export const useMascot = (): MascotContextType => {
  const context = useContext(MascotContext);
  if (!context) {
    throw new Error('useMascot must be used within a MascotProvider');
  }
  return context;
};
