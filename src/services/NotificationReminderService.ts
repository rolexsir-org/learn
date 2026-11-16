import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const PHONICS_REMINDER_ID = 1001;

class NotificationReminderService {
  private static instance: NotificationReminderService;

  private constructor() {}

  public static getInstance(): NotificationReminderService {
    if (!NotificationReminderService.instance) {
      NotificationReminderService.instance = new NotificationReminderService();
    }
    return NotificationReminderService.instance;
  }

  /**
   * Initializes local notifications, requests permissions if needed,
   * and schedules/reschedules the 24-hour daily phonics practice reminder.
   */
  public async scheduleDailyPhonicsReminder(): Promise<boolean> {
    try {
      const isNative = Capacitor.isNativePlatform();

      if (!isNative) {
        // Fallback for Web environments
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        return true;
      }

      // Check current local notification permissions
      let permStatus = await LocalNotifications.checkPermissions();

      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }

      if (permStatus.display !== 'granted') {
        console.warn('Local notifications permission not granted.');
        return false;
      }

      // Cancel previous pending reminder to reset the 24-hour countdown
      await LocalNotifications.cancel({
        notifications: [{ id: PHONICS_REMINDER_ID }],
      });

      // Schedule new reminder for exactly 24 hours from now
      const reminderTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: PHONICS_REMINDER_ID,
            title: '⭐ Time for Phonics Practice!',
            body: 'Your 5-minute daily phonics adventure awaits! Keep your learning streak alive 🌟',
            schedule: { at: reminderTime },
            sound: undefined,
            actionTypeId: 'OPEN_APP',
            extra: {
              type: 'phonics_daily_reminder',
            },
          },
        ],
      });

      console.log('Successfully scheduled 24h phonics reminder for:', reminderTime.toLocaleString());
      return true;
    } catch (error) {
      console.warn('NotificationReminderService error:', error);
      return false;
    }
  }
}

export const notificationReminderService = NotificationReminderService.getInstance();
