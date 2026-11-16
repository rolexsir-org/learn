import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../lib/firebase';

export type LearningEvent =
  | 'spelling_mastered'
  | 'coin_earned'
  | 'character_unlocked'
  | 'quest_completed'
  | 'sync_error'
  | 'world_changed'
  | 'app_launch';

class AnalyticsService {
  public static logLearningEvent(event: LearningEvent, params?: Record<string, any>) {
    if (!analytics) return;
    try {
      logEvent(analytics, event, params);
    } catch (e) {
      console.warn('Analytics log failure:', e);
    }
  }

  public static trackUser(uid: string, properties?: Record<string, any>) {
    if (!analytics) return;
    try {
      setUserId(analytics, uid);
      if (properties) {
        setUserProperties(analytics, properties);
      }
    } catch (e) {
      console.warn('Analytics user track failure:', e);
    }
  }

  public static logError(errorType: string, message: string, context?: string) {
    this.logLearningEvent('sync_error', {
      error_type: errorType,
      message,
      context
    });
  }
}

export { AnalyticsService };
