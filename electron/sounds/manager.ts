export interface SystemSound {
  event: string;
  category: 'windows' | 'notifications' | 'device' | 'alerts' | 'hardware';
  file: string | null;
  isDefault: boolean;
  volume: number;
  duration: string;
  description: string;
}

export interface SoundScheme {
  name: string;
  isDefault: boolean;
  isCurrent: boolean;
  sounds: SystemSound[];
}

export interface AudioDevice {
  name: string;
  type: 'speakers' | 'headphones' | 'headset' | 'monitor' | 'usb' | 'bluetooth' | 'hdmi';
  isDefault: boolean;
  status: 'active' | 'disabled' | 'unplugged';
  volume: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  manufacturer: string;
  driver: string;
}

function defaultSounds(): SystemSound[] {
  return [
    { event: 'Windows Logon', category: 'windows', file: 'C:\\Windows\\Media\\Windows Logon.wav', isDefault: true, volume: 80, duration: '1.5s', description: 'Played when a user logs on to Windows' },
    { event: 'Windows Logoff', category: 'windows', file: 'C:\\Windows\\Media\\Windows Logoff.wav', isDefault: true, volume: 80, duration: '1.2s', description: 'Played when a user logs off from Windows' },
    { event: 'Windows UAC', category: 'windows', file: 'C:\\Windows\\Media\\Windows UAC.wav', isDefault: true, volume: 100, duration: '0.8s', description: 'Played when User Account Control prompts for elevation' },
    { event: 'Windows Error', category: 'windows', file: 'C:\\Windows\\Media\\Windows Error.wav', isDefault: true, volume: 100, duration: '1.0s', description: 'Played when a critical error dialog appears' },
    { event: 'System Notification', category: 'notifications', file: 'C:\\Windows\\Media\\Windows Notify.wav', isDefault: true, volume: 80, duration: '0.5s', description: 'Default system notification sound' },
    { event: 'New Mail Notification', category: 'notifications', file: 'C:\\Windows\\Media\\Windows Notify.wav', isDefault: true, volume: 70, duration: '0.5s', description: 'Played when new email arrives in a mail client' },
    { event: 'Calendar Reminder', category: 'notifications', file: 'C:\\Windows\\Media\\Windows Notify.wav', isDefault: true, volume: 70, duration: '0.5s', description: 'Played for calendar appointment reminders' },
    { event: 'Instant Message', category: 'notifications', file: 'C:\\Windows\\Media\\Windows Notify.wav', isDefault: true, volume: 60, duration: '0.3s', description: 'Played when receiving an instant message' },
    { event: 'Device Connect', category: 'device', file: 'C:\\Windows\\Media\\Windows Hardware Insert.wav', isDefault: true, volume: 80, duration: '0.6s', description: 'Played when a USB or external device is connected' },
    { event: 'Device Disconnect', category: 'device', file: 'C:\\Windows\\Media\\Windows Hardware Remove.wav', isDefault: true, volume: 80, duration: '0.6s', description: 'Played when a USB or external device is disconnected' },
    { event: 'Device Failed to Connect', category: 'device', file: 'C:\\Windows\\Media\\Windows Hardware Fail.wav', isDefault: true, volume: 100, duration: '0.8s', description: 'Played when a device fails to connect' },
    { event: 'Print Complete', category: 'device', file: 'C:\\Windows\\Media\\Windows Print Complete.wav', isDefault: true, volume: 60, duration: '0.8s', description: 'Played when a print job completes' },
    { event: 'Critical Battery Alarm', category: 'alerts', file: 'C:\\Windows\\Media\\Windows Battery Critical.wav', isDefault: true, volume: 100, duration: '1.0s', description: 'Played when battery reaches critical level (below 5%)' },
    { event: 'Low Battery Alarm', category: 'alerts', file: 'C:\\Windows\\Media\\Windows Battery Low.wav', isDefault: true, volume: 100, duration: '0.8s', description: 'Played when battery drops below 10%' },
    { event: 'System Notification Error', category: 'alerts', file: 'C:\\Windows\\Media\\Windows Error.wav', isDefault: true, volume: 100, duration: '1.0s', description: 'Played for error notifications' },
    { event: 'Critical Stop', category: 'alerts', file: 'C:\\Windows\\Media\\Windows Critical Stop.wav', isDefault: true, volume: 100, duration: '1.2s', description: 'Played on critical system stop events' },
    { event: 'Exclamation', category: 'alerts', file: 'C:\\Windows\\Media\\Windows Exclamation.wav', isDefault: true, volume: 90, duration: '0.6s', description: 'Played for warning and exclamation dialogs' },
    { event: 'Menu Popup', category: 'windows', file: null, isDefault: true, volume: 0, duration: '0.1s', description: 'Played when a menu popup appears (set to None by default)' },
    { event: 'Menu Command', category: 'windows', file: null, isDefault: true, volume: 0, duration: '0.1s', description: 'Played when a menu command is selected (set to None by default)' },
    { event: 'Minimize', category: 'windows', file: null, isDefault: true, volume: 0, duration: '0.1s', description: 'Played when a window is minimized (set to None by default)' },
    { event: 'Maximize', category: 'windows', file: null, isDefault: true, volume: 0, duration: '0.1s', description: 'Played when a window is maximized (set to None by default)' },
  ];
}

const schemes: SoundScheme[] = [
  { name: 'Windows Default', isDefault: true, isCurrent: true, sounds: defaultSounds() },
  { name: 'No Sounds', isDefault: false, isCurrent: false, sounds: defaultSounds().map(s => ({ ...s, file: null, isDefault: false })) },
];

export class SoundManager {
  getCurrentScheme(): SoundScheme {
    return schemes.find(s => s.isCurrent) || schemes[0];
  }

  getSchemes(): SoundScheme[] {
    return schemes;
  }

  getAudioDevices(): AudioDevice[] {
    return [
      { name: 'Speakers (Realtek High Definition Audio)', type: 'speakers', isDefault: true, status: 'active', volume: 68, sampleRate: 48000, bitDepth: 24, channels: 2, manufacturer: 'Realtek Semiconductor Corp.', driver: 'RTKVHD64.sys v6.0.9373.1' },
      { name: 'Headphones (USB Audio Device)', type: 'headphones', isDefault: false, status: 'active', volume: 45, sampleRate: 44100, bitDepth: 16, channels: 2, manufacturer: 'Logitech', driver: 'USBAUDIO.sys v10.0.22621.1' },
      { name: 'DELL S2721QS (NVIDIA High Definition Audio)', type: 'hdmi', isDefault: false, status: 'active', volume: 50, sampleRate: 48000, bitDepth: 24, channels: 2, manufacturer: 'NVIDIA', driver: 'nvhda64v.sys v1.4.0.1' },
      { name: 'Bluetooth Headset (WH-1000XM4)', type: 'bluetooth', isDefault: false, status: 'unplugged', volume: 60, sampleRate: 44100, bitDepth: 16, channels: 2, manufacturer: 'Sony', driver: 'BthA2dp.sys v10.0.22621.1' },
    ];
  }

  setScheme(name: string): { success: boolean } {
    const scheme = schemes.find(s => s.name === name);
    if (!scheme) return { success: false };
    schemes.forEach(s => { s.isCurrent = s.name === name; });
    return { success: true };
  }

  setSoundEvent(eventName: string, file: string | null): { success: boolean } {
    for (const s of schemes.find(s => s.isCurrent)?.sounds || []) {
      if (s.event === eventName) {
        s.file = file;
        s.isDefault = false;
        return { success: true };
      }
    }
    return { success: false };
  }

  resetToDefaults(): { success: boolean } {
    const current = schemes.find(s => s.isCurrent);
    if (current) {
      current.sounds = defaultSounds();
    }
    return { success: true };
  }

  testSound(eventName: string): { success: boolean } {
    const scheme = schemes.find(s => s.isCurrent);
    const sound = scheme?.sounds.find(s => s.event === eventName);
    return { success: !!(sound?.file) };
  }

  playFile(path: string): { success: boolean } {
    return { success: !!path };
  }
}
