import { Capacitor } from '@capacitor/core';

export type PermissionType = 'camera' | 'microphone' | 'notifications';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

export interface PermissionResult {
  permission: PermissionType;
  state: PermissionState;
  canRequest: boolean;
}

class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Checks the current status of a permission.
   */
  public async checkPermission(type: PermissionType): Promise<PermissionResult> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      // Web environment permission check via navigator.permissions if available
      try {
        if (navigator.permissions && (type === 'camera' || type === 'microphone')) {
          const name = type === 'camera' ? ('camera' as PermissionName) : ('microphone' as PermissionName);
          const status = await navigator.permissions.query({ name });
          return {
            permission: type,
            state: status.state as PermissionState,
            canRequest: status.state !== 'denied',
          };
        }
      } catch {
        // Ignored if query name not supported on current browser
      }

      return {
        permission: type,
        state: 'granted',
        canRequest: true,
      };
    }

    // Native Capacitor Platform Permission Checks
    try {
      if (type === 'notifications') {
        const { Notification } = window;
        if (Notification) {
          const state = Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'prompt';
          return {
            permission: type,
            state,
            canRequest: state !== 'denied',
          };
        }
      }
    } catch (err) {
      console.warn(`PermissionService check error [${type}]:`, err);
    }

    return {
      permission: type,
      state: 'prompt',
      canRequest: true,
    };
  }

  /**
   * Requests a specific runtime permission with handling for granted, denied, and prompt states.
   */
  public async requestPermission(type: PermissionType): Promise<PermissionResult> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      if (type === 'notifications' && 'Notification' in window) {
        const res = await Notification.requestPermission();
        return {
          permission: type,
          state: res === 'granted' ? 'granted' : res === 'denied' ? 'denied' : 'prompt',
          canRequest: res !== 'denied',
        };
      }

      if ((type === 'camera' || type === 'microphone') && navigator.mediaDevices?.getUserMedia) {
        try {
          const constraints = type === 'camera' ? { video: true } : { audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          // Stop track immediately after checking
          stream.getTracks().forEach(track => track.stop());
          return {
            permission: type,
            state: 'granted',
            canRequest: true,
          };
        } catch {
          return {
            permission: type,
            state: 'denied',
            canRequest: false,
          };
        }
      }

      return {
        permission: type,
        state: 'granted',
        canRequest: true,
      };
    }

    // Native environment request
    if (type === 'notifications' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        return {
          permission: type,
          state: res === 'granted' ? 'granted' : res === 'denied' ? 'denied' : 'prompt',
          canRequest: res !== 'denied',
        };
      } catch (err) {
        console.warn('Native notification request error:', err);
      }
    }

    return {
      permission: type,
      state: 'granted',
      canRequest: true,
    };
  }

  /**
   * Reusable helper for camera permission.
   */
  public async requestCameraPermission(): Promise<boolean> {
    const res = await this.requestPermission('camera');
    return res.state === 'granted';
  }

  /**
   * Reusable helper for microphone permission.
   */
  public async requestMicrophonePermission(): Promise<boolean> {
    const res = await this.requestPermission('microphone');
    return res.state === 'granted';
  }

  /**
   * Reusable helper for notification permission (Android 13+ POST_NOTIFICATIONS).
   */
  public async requestNotificationPermission(): Promise<boolean> {
    const res = await this.requestPermission('notifications');
    return res.state === 'granted';
  }
}

export const permissionService = PermissionService.getInstance();
