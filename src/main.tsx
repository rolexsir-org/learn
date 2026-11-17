import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { storageService } from './services/StorageService.ts';
import { playIntegrityService } from './services/PlayIntegrityService.ts';
import { notificationReminderService } from './services/NotificationReminderService.ts';
import { AudioManager } from './services/AudioManager.ts';
import { SpeechService } from './services/SpeechService.ts';

// Production log suppression for Google Play compliance
if ((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD) {
  console.debug = () => {};
  console.info = () => {};
}

// Initialize Capacitor Native Platform & Background Production Services
if (Capacitor.isNativePlatform()) {
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      // Hide native splash screen
      await SplashScreen.hide();

      // Configure Android Status Bar
      if (Capacitor.getPlatform() === 'android') {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#FEF3C7' });
      }

      // Handle Android Hardware Back Button
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapacitorApp.minimizeApp();
        }
      });

      // Reschedule daily phonics reminder when app enters foreground
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) SpeechService.stop();
        AudioManager.setAppActive(isActive);
        if (isActive) {
          notificationReminderService.scheduleDailyPhonicsReminder().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('Capacitor native init warning:', err);
    }
  });
}

// Background initialization of storage, Play Integrity API & Notification Reminder
(async () => {
  try {
    await storageService.init();
    await playIntegrityService.verifyAppAuthenticity();
    await notificationReminderService.scheduleDailyPhonicsReminder();
  } catch (e) {
    console.warn('Background services init note:', e);
  }
})();

import { NotificationProvider } from './context/NotificationContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  </StrictMode>
);
