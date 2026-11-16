/**
 * DeviceService - Native Mobile Device & Environment Abstraction
 * 
 * Replaces window.innerWidth, window.innerHeight, window resize events,
 * document visibility listeners, navigator.vibrate, navigator.share,
 * and window.alert with platform abstractions for Android & iOS.
 */

export interface Dimensions {
  width: number;
  height: number;
}

export type AppLifecycleState = 'active' | 'background' | 'inactive';
export type ScreenOrientationType = 'landscape' | 'portrait';

class MobileDeviceService {
  private dimensionListeners: Set<(dims: Dimensions) => void> = new Set();
  private stateListeners: Set<(state: AppLifecycleState) => void> = new Set();
  private orientationListeners: Set<(orientation: ScreenOrientationType) => void> = new Set();
  private currentDimensions: Dimensions = { width: 375, height: 667 };
  private currentState: AppLifecycleState = 'active';
  private currentOrientation: ScreenOrientationType = 'landscape';

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (typeof window === 'undefined') return;

    this.currentDimensions = {
      width: window.innerWidth || 375,
      height: window.innerHeight || 667,
    };

    this.currentOrientation = this.currentDimensions.width >= this.currentDimensions.height ? 'landscape' : 'portrait';

    // Resize and orientation listener abstraction
    const handleResize = () => {
      this.currentDimensions = {
        width: window.innerWidth || 375,
        height: window.innerHeight || 667,
      };
      const newOrientation: ScreenOrientationType = this.currentDimensions.width >= this.currentDimensions.height ? 'landscape' : 'portrait';
      
      this.dimensionListeners.forEach((listener) => listener(this.currentDimensions));

      if (newOrientation !== this.currentOrientation) {
        this.currentOrientation = newOrientation;
        this.orientationListeners.forEach((listener) => listener(this.currentOrientation));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Attempt automatic landscape orientation lock on boot
    this.lockLandscapeOrientation();

    // App state lifecycle listener abstraction (Android/iOS background/foreground)
    const handleVisibilityChange = () => {
      this.currentState = document.hidden ? 'background' : 'active';
      this.stateListeners.forEach((listener) => listener(this.currentState));
      if (this.currentState === 'active') {
        this.lockLandscapeOrientation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * Attempts native Screen Orientation API landscape locking for tablet and phone game scenes.
   */
  public async lockLandscapeOrientation(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
        await (window.screen.orientation as any).lock('landscape');
        return true;
      } else if ((window.screen as any)?.lockOrientation) {
        (window.screen as any).lockOrientation('landscape');
        return true;
      } else if ((window.screen as any)?.webkitLockOrientation) {
        (window.screen as any).webkitLockOrientation('landscape');
        return true;
      } else if ((window.screen as any)?.mozLockOrientation) {
        (window.screen as any).mozLockOrientation('landscape');
        return true;
      }
    } catch (e) {
      // Screen orientation lock may require user interaction or standalone/PWA container
      console.warn('DeviceService: Screen orientation lock API message:', e);
    }
    return false;
  }

  /**
   * Get current orientation (landscape vs portrait).
   */
  public getOrientation(): ScreenOrientationType {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
    }
    return this.currentOrientation;
  }

  /**
   * Subscribe to orientation changes.
   */
  public subscribeOrientation(callback: (orientation: ScreenOrientationType) => void): () => void {
    this.orientationListeners.add(callback);
    callback(this.getOrientation());
    return () => {
      this.orientationListeners.delete(callback);
    };
  }

  /**
   * Get current device screen dimensions.
   */
  public getDimensions(): Dimensions {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth || 375,
        height: window.innerHeight || 667,
      };
    }
    return this.currentDimensions;
  }

  /**
   * Subscribe to screen dimension changes.
   */
  public subscribeDimensions(callback: (dims: Dimensions) => void): () => void {
    this.dimensionListeners.add(callback);
    callback(this.getDimensions());
    return () => {
      this.dimensionListeners.delete(callback);
    };
  }

  /**
   * Subscribe to mobile app lifecycle state (active / background / inactive).
   */
  public subscribeAppState(callback: (state: AppLifecycleState) => void): () => void {
    this.stateListeners.add(callback);
    callback(this.currentState);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  /**
   * Haptic vibration feedback for mobile devices.
   */
  public vibrate(pattern: number | number[] = 50): void {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  /**
   * Copy text to device clipboard.
   */
  public async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    return false;
  }

  /**
   * Share content via native mobile share sheet.
   */
  public async share(options: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share(options);
        return true;
      } catch (e) {}
    }
    return false;
  }

  /**
   * Show non-blocking alert / toast message safely.
   */
  public showAlert(message: string): void {
    console.log(`[DeviceService Alert]: ${message}`);
  }

  /**
   * Safe element finder for canvas/SVG exports without global DOM dependency leakage.
   */
  public getElementById(id: string): HTMLElement | null {
    if (typeof document !== 'undefined') {
      return document.getElementById(id);
    }
    return null;
  }
}

export const DeviceService = new MobileDeviceService();
