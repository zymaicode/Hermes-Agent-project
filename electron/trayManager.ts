import { Tray, Menu, app, BrowserWindow, Notification } from 'electron';
import path from 'path';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let currentCPU = 0;
let currentMem = 0;

const iconDir = path.join(__dirname, '../assets');

// Rate limiting for notifications
let lastNotificationTime = 0;
const MIN_NOTIFICATION_INTERVAL = 30000;

export function initTray(window: BrowserWindow): void {
  mainWindow = window;
  const iconPath = path.join(iconDir, 'icon.png');
  tray = new Tray(iconPath);

  updateTrayMenu();
  tray.setToolTip('PCHelper - 电脑工具箱');

  // Double-click to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function updateTrayMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `CPU: ${currentCPU.toFixed(1)}% | Mem: ${currentMem.toFixed(0)}%`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '打开主窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: '最小化到托盘',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function updateTrayStats(cpu: number, mem: number): void {
  currentCPU = cpu;
  currentMem = mem;
  updateTrayMenu();
}

export function showTrayNotification(title: string, body: string): void {
  const now = Date.now();
  if (now - lastNotificationTime < MIN_NOTIFICATION_INTERVAL) return;
  lastNotificationTime = now;

  if (!mainWindow) return;
  const notification = new Notification({
    title,
    body,
    icon: path.join(iconDir, 'icon.png'),
  });
  notification.show();
  notification.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

export function isTrayInitialized(): boolean {
  return tray !== null;
}
