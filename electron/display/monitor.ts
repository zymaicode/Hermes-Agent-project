export interface DisplayMonitor {
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  manufactureDate: string;
  connectionType: 'HDMI' | 'DisplayPort' | 'USB-C' | 'VGA' | 'DVI';
  resolution: { width: number; height: number };
  refreshRate: number;
  bitDepth: number;
  colorFormat: string;
  hdrSupported: boolean;
  hdrEnabled: boolean;
  dpi: number;
  scaling: number;
  primary: boolean;
  edidVersion: string;
  maxResolution: { width: number; height: number };
  supportedRefreshRates: number[];
  physicalSize: { width: number; height: number };
  pixelPitch: number;
  aspectRatio: string;
  sRGB: number;
  dciP3: number;
  hdrFormats: string[];
}

export interface AdapterInfo {
  name: string;
  vendor: string;
  driverVersion: string;
  driverDate: string;
  vram: number;
  directXSupport: string;
  vulkanSupport: boolean;
  openGLVersion: string;
  featureLevel: string;
  outputs: DisplayMonitor[];
}

export interface ColorProfile {
  name: string;
  path: string;
  isDefault: boolean;
  gamut: string;
  whitepoint: string;
  gamma: number;
}

export class DisplayInfoCollector {
  getDisplays(): DisplayMonitor[] {
    return [
      {
        name: 'Dell U2723QE',
        manufacturer: 'Dell',
        model: 'U2723QE',
        serialNumber: 'DEL-2723QE-ABC123',
        manufactureDate: '2024-03-15',
        connectionType: 'USB-C',
        resolution: { width: 3840, height: 2160 },
        refreshRate: 60,
        bitDepth: 10,
        colorFormat: 'RGB',
        hdrSupported: true,
        hdrEnabled: true,
        dpi: 163,
        scaling: 150,
        primary: true,
        edidVersion: '1.4',
        maxResolution: { width: 3840, height: 2160 },
        supportedRefreshRates: [24, 30, 50, 60],
        physicalSize: { width: 597, height: 336 },
        pixelPitch: 0.1554,
        aspectRatio: '16:9',
        sRGB: 100,
        dciP3: 98,
        hdrFormats: ['HDR10', 'DisplayHDR 400'],
      },
      {
        name: 'LG UltraGear',
        manufacturer: 'LG',
        model: '24GN600-B',
        serialNumber: 'LG-24GN600-XY789',
        manufactureDate: '2023-11-20',
        connectionType: 'HDMI',
        resolution: { width: 1920, height: 1080 },
        refreshRate: 144,
        bitDepth: 8,
        colorFormat: 'RGB',
        hdrSupported: false,
        hdrEnabled: false,
        dpi: 92,
        scaling: 100,
        primary: false,
        edidVersion: '1.3',
        maxResolution: { width: 1920, height: 1080 },
        supportedRefreshRates: [60, 100, 120, 144],
        physicalSize: { width: 527, height: 296 },
        pixelPitch: 0.2745,
        aspectRatio: '16:9',
        sRGB: 99,
        dciP3: 0,
        hdrFormats: [],
      },
    ];
  }

  getAdapterInfo(): AdapterInfo {
    return {
      name: 'NVIDIA GeForce RTX 4080',
      vendor: 'NVIDIA',
      driverVersion: '31.0.15.5184 (r551_84)',
      driverDate: '2024-02-20',
      vram: 16384,
      directXSupport: '12_2',
      vulkanSupport: true,
      openGLVersion: '4.6',
      featureLevel: '12_2',
      outputs: this.getDisplays(),
    };
  }

  getColorProfiles(): ColorProfile[] {
    return [
      {
        name: 'sRGB IEC61966-2.1',
        path: 'C:\\Windows\\System32\\spool\\drivers\\color\\sRGB Color Space Profile.icm',
        isDefault: true,
        gamut: 'sRGB',
        whitepoint: 'D65 (6500K)',
        gamma: 2.2,
      },
      {
        name: 'DCI-P3',
        path: 'C:\\Windows\\System32\\spool\\drivers\\color\\DCI-P3 Color Space Profile.icm',
        isDefault: false,
        gamut: 'DCI-P3',
        whitepoint: 'D65 (6300K)',
        gamma: 2.6,
      },
      {
        name: 'Adobe RGB (1998)',
        path: 'C:\\Windows\\System32\\spool\\drivers\\color\\AdobeRGB1998.icc',
        isDefault: false,
        gamut: 'Adobe RGB',
        whitepoint: 'D65 (6500K)',
        gamma: 2.2,
      },
    ];
  }
}
