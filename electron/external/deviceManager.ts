export interface MonitorInfo {
  id: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  manufactureDate: string;
  screenSize: number;
  resolution: string;
  refreshRate: number;
  connectionType: 'HDMI' | 'DP' | 'DVI' | 'VGA' | 'USB-C' | 'built-in';
  isPrimary: boolean;
  colorDepth: number;
  aspectRatio: string;
  edidVersion: string;
  gpuOutput: string;
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  type: 'playback' | 'recording' | 'both';
  deviceFormat: string;
  isDefault: boolean;
  status: 'active' | 'disabled' | 'unplugged' | 'not_present';
  driver: string;
  jackInfo: string;
  volume: number;
}

export interface BluetoothDeviceEntry {
  name: string;
  mac: string;
  type: 'keyboard' | 'mouse' | 'headset' | 'speaker' | 'phone' | 'watch' | 'other';
  paired: string;
  isConnected: boolean;
  batteryLevel: number | null;
  driver: string;
  signalStrength: number;
}

export interface PrinterEntry {
  name: string;
  driver: string;
  status: 'ready' | 'offline' | 'error' | 'paper_jam' | 'low_ink' | 'busy';
  isDefault: boolean;
  isNetwork: boolean;
  port: string;
  inkLevels?: Array<{ color: string; level: number }>;
  pagesPrinted: number;
  lastUsed: string;
  location: string;
  supportsDuplex: boolean;
  supportsColor: boolean;
}

export interface GameControllerEntry {
  name: string;
  type: 'xbox' | 'playstation' | 'switch_pro' | 'generic' | 'joystick' | 'racing_wheel';
  connectionType: 'wired' | 'bluetooth' | 'wireless_dongle';
  isConnected: boolean;
  batteryLevel: number | null;
  buttons: number;
  axes: number;
  vendor: string;
  driver: string;
}

function monitors(): MonitorInfo[] {
  return [
    {
      id: 'mon-001',
      name: 'Dell S2721QS',
      manufacturer: 'Dell Inc.',
      serialNumber: 'DEL12345ABC',
      manufactureDate: '2023/42',
      screenSize: 27,
      resolution: '3840x2160',
      refreshRate: 60,
      connectionType: 'HDMI',
      isPrimary: true,
      colorDepth: 10,
      aspectRatio: '16:9',
      edidVersion: '1.4',
      gpuOutput: 'NVIDIA GeForce RTX 3060 - HDMI',
    },
    {
      id: 'mon-002',
      name: 'ASUS VG249Q',
      manufacturer: 'ASUStek Computer Inc.',
      serialNumber: 'ASU98765XYZ',
      manufactureDate: '2022/15',
      screenSize: 23.8,
      resolution: '1920x1080',
      refreshRate: 144,
      connectionType: 'DP',
      isPrimary: false,
      colorDepth: 8,
      aspectRatio: '16:9',
      edidVersion: '1.4',
      gpuOutput: 'NVIDIA GeForce RTX 3060 - DisplayPort',
    },
  ];
}

function audioDevices(): AudioDeviceInfo[] {
  return [
    {
      id: 'audio-001',
      name: '扬声器 (Realtek High Definition Audio)',
      type: 'playback',
      deviceFormat: '24bit, 48000Hz',
      isDefault: true,
      status: 'active',
      driver: 'RTKVHD64.sys v6.0.9373.1',
      jackInfo: '后置 3.5mm 插孔 (绿色)',
      volume: 68,
    },
    {
      id: 'audio-002',
      name: '耳机 (USB Audio Device)',
      type: 'playback',
      deviceFormat: '16bit, 44100Hz',
      isDefault: false,
      status: 'active',
      driver: 'USBAUDIO.sys v10.0.22621.1',
      jackInfo: 'USB 端口',
      volume: 45,
    },
    {
      id: 'audio-003',
      name: 'DELL S2721QS (NVIDIA High Definition Audio)',
      type: 'playback',
      deviceFormat: '24bit, 48000Hz',
      isDefault: false,
      status: 'active',
      driver: 'nvhda64v.sys v1.4.0.1',
      jackInfo: 'HDMI 音频',
      volume: 50,
    },
    {
      id: 'audio-004',
      name: 'Bluetooth 耳机 (WH-1000XM4)',
      type: 'playback',
      deviceFormat: '16bit, 44100Hz',
      isDefault: false,
      status: 'unplugged',
      driver: 'BthA2dp.sys v10.0.22621.1',
      jackInfo: '蓝牙',
      volume: 60,
    },
    {
      id: 'audio-005',
      name: '麦克风 (Realtek High Definition Audio)',
      type: 'recording',
      deviceFormat: '24bit, 48000Hz',
      isDefault: true,
      status: 'active',
      driver: 'RTKVHD64.sys v6.0.9373.1',
      jackInfo: '后置 3.5mm 插孔 (粉红色)',
      volume: 80,
    },
    {
      id: 'audio-006',
      name: '立体声混音 (Realtek High Definition Audio)',
      type: 'recording',
      deviceFormat: '24bit, 48000Hz',
      isDefault: false,
      status: 'disabled',
      driver: 'RTKVHD64.sys v6.0.9373.1',
      jackInfo: '虚拟设备',
      volume: 0,
    },
    {
      id: 'audio-007',
      name: '麦克风 (USB Audio Device)',
      type: 'recording',
      deviceFormat: '16bit, 44100Hz',
      isDefault: false,
      status: 'active',
      driver: 'USBAUDIO.sys v10.0.22621.1',
      jackInfo: 'USB 端口',
      volume: 72,
    },
    {
      id: 'audio-008',
      name: '线路输入 (Realtek High Definition Audio)',
      type: 'both',
      deviceFormat: '24bit, 192000Hz',
      isDefault: false,
      status: 'not_present',
      driver: 'RTKVHD64.sys v6.0.9373.1',
      jackInfo: '后置 3.5mm 插孔 (蓝色)',
      volume: 0,
    },
  ];
}

function bluetoothDevices(): BluetoothDeviceEntry[] {
  return [
    {
      name: 'WH-1000XM4',
      mac: 'B0:38:29:6A:1F:3D',
      type: 'headset',
      paired: '2025-11-15',
      isConnected: false,
      batteryLevel: 80,
      driver: 'BthA2dp.sys v10.0.22621.1',
      signalStrength: 0,
    },
    {
      name: 'Logitech MX Master 3S',
      mac: 'D4:8A:FC:7E:2B:19',
      type: 'mouse',
      paired: '2025-10-22',
      isConnected: true,
      batteryLevel: 65,
      driver: 'BthLEEnum.sys v10.0.22621.1',
      signalStrength: 85,
    },
    {
      name: 'Keychron K8 Pro',
      mac: 'AC:7B:A1:2C:5E:88',
      type: 'keyboard',
      paired: '2025-10-20',
      isConnected: true,
      batteryLevel: 90,
      driver: 'BthLEEnum.sys v10.0.22621.1',
      signalStrength: 92,
    },
    {
      name: 'iPhone 15 Pro',
      mac: 'E0:51:63:D4:A8:F2',
      type: 'phone',
      paired: '2025-09-10',
      isConnected: false,
      batteryLevel: null,
      driver: 'BthEnum.sys v10.0.22621.1',
      signalStrength: 0,
    },
    {
      name: 'Apple Watch Series 9',
      mac: 'F8:FF:C2:04:B8:6C',
      type: 'watch',
      paired: '2025-09-05',
      isConnected: false,
      batteryLevel: null,
      driver: 'BthEnum.sys v10.0.22621.1',
      signalStrength: 0,
    },
    {
      name: 'JBL Flip 6',
      mac: 'C4:3A:BE:7D:1E:55',
      type: 'speaker',
      paired: '2025-08-14',
      isConnected: false,
      batteryLevel: 100,
      driver: 'BthA2dp.sys v10.0.22621.1',
      signalStrength: 0,
    },
  ];
}

function printers(): PrinterEntry[] {
  return [
    {
      name: 'HP LaserJet Pro M404dn',
      driver: 'HP Universal Printing PCL 6 v7.0.0.1',
      status: 'ready',
      isDefault: true,
      isNetwork: true,
      port: '192.168.1.50 (TCP/IP)',
      pagesPrinted: 15420,
      lastUsed: '2026-04-28',
      location: '办公室 - 2楼',
      supportsDuplex: true,
      supportsColor: false,
    },
    {
      name: 'Canon PIXMA G5020',
      driver: 'Canon PIXMA G5000 series Driver v3.2.1',
      status: 'ready',
      isDefault: false,
      isNetwork: false,
      port: 'USB001 (虚拟打印机端口)',
      inkLevels: [
        { color: '黑色', level: 72 },
        { color: '青色', level: 45 },
        { color: '品红色', level: 38 },
        { color: '黄色', level: 60 },
      ],
      pagesPrinted: 3820,
      lastUsed: '2026-04-30',
      location: '家庭办公室',
      supportsDuplex: false,
      supportsColor: true,
    },
    {
      name: 'Microsoft Print to PDF',
      driver: 'Microsoft Print to PDF v10.0.22621.1',
      status: 'ready',
      isDefault: false,
      isNetwork: false,
      port: 'PORTPROMPT:',
      pagesPrinted: 0,
      lastUsed: '2026-03-15',
      location: '虚拟打印机',
      supportsDuplex: false,
      supportsColor: true,
    },
  ];
}

function gameControllers(): GameControllerEntry[] {
  return [
    {
      name: 'Xbox Series X Controller',
      type: 'xbox',
      connectionType: 'bluetooth',
      isConnected: true,
      batteryLevel: 72,
      buttons: 16,
      axes: 6,
      vendor: 'Microsoft Corporation',
      driver: 'xinputhid.sys v10.0.22621.1',
    },
    {
      name: 'Logitech G923 Racing Wheel',
      type: 'racing_wheel',
      connectionType: 'wired',
      isConnected: false,
      batteryLevel: null,
      buttons: 24,
      axes: 3,
      vendor: 'Logitech Inc.',
      driver: 'Wdf01000.sys v10.0.22621.1',
    },
  ];
}

export class DeviceManager {
  getMonitors(): MonitorInfo[] {
    return monitors();
  }

  getAudioDevices(): AudioDeviceInfo[] {
    return audioDevices();
  }

  getBluetoothDevices(): BluetoothDeviceEntry[] {
    return bluetoothDevices();
  }

  getPrinters(): PrinterEntry[] {
    return printers();
  }

  getGameControllers(): GameControllerEntry[] {
    return gameControllers();
  }

  refresh(): void {}
}
