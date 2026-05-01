import { BrowserWindow, screen } from 'electron';
import path from 'path';
import type { OverlayMetrics } from './dataCollector';

export interface OverlayWinConfig {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  opacity: number;
  metrics: {
    showCpu: boolean;
    showMemory: boolean;
    showGpu: boolean;
    showFps: boolean;
    showNetwork: boolean;
  };
  fontSize: number;
  refreshInterval: number;
  clickThrough: boolean;
  autoHide: boolean;
  accentColor: string;
}

const DEFAULT_CONFIG: OverlayWinConfig = {
  enabled: false,
  position: 'top-right',
  opacity: 0.7,
  metrics: {
    showCpu: true,
    showMemory: true,
    showGpu: true,
    showFps: true,
    showNetwork: true,
  },
  fontSize: 12,
  refreshInterval: 1000,
  clickThrough: true,
  autoHide: false,
  accentColor: '#4fc3f7',
};

export class OverlayManager {
  private overlayWindow: BrowserWindow | null = null;
  private config: OverlayWinConfig = { ...DEFAULT_CONFIG };
  private currentMetrics: OverlayMetrics | null = null;

  getConfig(): OverlayWinConfig {
    return { ...this.config };
  }

  getMetrics(): OverlayMetrics | null {
    return this.currentMetrics;
  }

  get isActive(): boolean {
    return this.overlayWindow !== null && !this.overlayWindow.isDestroyed();
  }

  toggle(enabled: boolean): void {
    if (enabled) {
      this.createOverlay();
    } else {
      this.destroy();
    }
  }

  updateConfig(partial: Partial<OverlayWinConfig>): void {
    Object.assign(this.config, partial);
    if (this.isActive) {
      this.applyConfigToWindow();
      this.pushConfig();
    }
  }

  sendMetrics(data: OverlayMetrics): void {
    this.currentMetrics = data;
    if (this.isActive) {
      this.pushMetrics(data);
    }
  }

  destroy(): void {
    if (this.overlayWindow) {
      this.overlayWindow.close();
      this.overlayWindow = null;
    }
  }

  private createOverlay(): void {
    if (this.isActive) return;

    const { width, height, x, y } = this.getWindowBounds();

    this.overlayWindow = new BrowserWindow({
      width,
      height,
      x,
      y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      skipTaskbar: true,
      focusable: false,
      hasShadow: false,
      thickFrame: false,
      opacity: this.config.opacity,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.applyClickThrough();
    this.overlayWindow.setIgnoreMouseEvents(this.config.clickThrough, { forward: true });

    const htmlPath = path.join(__dirname, 'overlay', 'overlay.html');
    this.overlayWindow.loadFile(htmlPath);

    this.overlayWindow.once('ready-to-show', () => {
      if (this.overlayWindow) {
        this.overlayWindow.showInactive();
        this.pushConfig();
        if (this.currentMetrics) {
          this.pushMetrics(this.currentMetrics);
        }
      }
    });

    this.overlayWindow.on('closed', () => {
      this.overlayWindow = null;
    });
  }

  private getWindowBounds() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const screenBounds = primaryDisplay.workArea;
    const width = 280;
    const height = 145;
    const margin = 16;
    const taskbarHeight = screenBounds.y > 0 ? 0 : 40;

    let x: number;
    let y: number;

    switch (this.config.position) {
      case 'top-left':
        x = screenBounds.x + margin;
        y = screenBounds.y + margin + taskbarHeight;
        break;
      case 'bottom-right':
        x = screenBounds.x + screenBounds.width - width - margin;
        y = screenBounds.y + screenBounds.height - height - margin;
        break;
      case 'bottom-left':
        x = screenBounds.x + margin;
        y = screenBounds.y + screenBounds.height - height - margin;
        break;
      case 'top-right':
      default:
        x = screenBounds.x + screenBounds.width - width - margin;
        y = screenBounds.y + margin + taskbarHeight;
        break;
    }

    return { width, height, x, y };
  }

  private applyConfigToWindow(): void {
    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;

    const { x, y } = this.getWindowBounds();
    this.overlayWindow.setBounds({ x, y, width: 280, height: 145 });
    this.overlayWindow.setOpacity(this.config.opacity);
    this.applyClickThrough();
  }

  private applyClickThrough(): void {
    if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
      this.overlayWindow.setIgnoreMouseEvents(this.config.clickThrough, { forward: true });
    }
  }

  private pushMetrics(data: OverlayMetrics): void {
    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;
    const payload = {
      metrics: data,
      config: {
        metrics: this.config.metrics,
        accentColor: this.config.accentColor,
        fontSize: this.config.fontSize < 11 ? 'small' : this.config.fontSize > 13 ? 'large' : 'medium',
      },
    };
    this.overlayWindow.webContents.executeJavaScript(
      `window.updateOverlay(${JSON.stringify(payload)});`
    ).catch(() => {});
  }

  private pushConfig(): void {
    if (!this.overlayWindow || this.overlayWindow.isDestroyed()) return;
    const payload = {
      config: {
        metrics: this.config.metrics,
        accentColor: this.config.accentColor,
        fontSize: this.config.fontSize < 11 ? 'small' : this.config.fontSize > 13 ? 'large' : 'medium',
      },
    };
    this.overlayWindow.webContents.executeJavaScript(
      `window.updateOverlay(${JSON.stringify(payload)});`
    ).catch(() => {});
  }
}
