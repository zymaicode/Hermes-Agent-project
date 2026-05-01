export interface SecurityStatus {
  overall: 'protected' | 'warning' | 'critical';

  antivirus: {
    name: string;
    enabled: boolean;
    definitions: string;
    lastScan: string;
    realTimeProtection: boolean;
  };

  firewall: {
    enabled: boolean;
    activeRules: number;
    publicNetwork: 'blocked' | 'allowed';
  };

  account: {
    passwordProtected: boolean;
    lastPasswordChange: string;
    hasPin: boolean;
    hasFingerprint: boolean;
    hasFace: boolean;
    isAdmin: boolean;
    uacEnabled: boolean;
  };

  encryption: {
    bitlockerEnabled: boolean;
    encryptedDrives: string[];
    deviceEncryption: boolean;
  };

  updates: {
    windowsUpdate: 'upToDate' | 'pending' | 'unsupported';
    lastUpdateCheck: string;
    pendingUpdates: number;
  };

  browser: {
    defaultBrowser: string;
    safeBrowsingEnabled: boolean;
    adBlockPresent: boolean;
  };

  recommendations: string[];
}

const STATUS: SecurityStatus = {
  overall: 'protected',

  antivirus: {
    name: 'Microsoft Defender Antivirus',
    enabled: true,
    definitions: 'Up to date (v1.421.1500.0)',
    lastScan: '2026-04-30 02:00:00',
    realTimeProtection: true,
  },

  firewall: {
    enabled: true,
    activeRules: 27,
    publicNetwork: 'blocked',
  },

  account: {
    passwordProtected: true,
    lastPasswordChange: '2026-03-15 09:30:00',
    hasPin: true,
    hasFingerprint: false,
    hasFace: false,
    isAdmin: true,
    uacEnabled: true,
  },

  encryption: {
    bitlockerEnabled: true,
    encryptedDrives: ['C:', 'D:'],
    deviceEncryption: true,
  },

  updates: {
    windowsUpdate: 'upToDate',
    lastUpdateCheck: '2026-04-30 10:00:00',
    pendingUpdates: 0,
  },

  browser: {
    defaultBrowser: 'Google Chrome',
    safeBrowsingEnabled: true,
    adBlockPresent: true,
  },

  recommendations: [
    'Your password was last changed over 45 days ago. Consider updating it for better security.',
    'Windows Hello fingerprint is not configured. Add biometric authentication for faster and more secure sign-in.',
  ],
};

export class SecurityCenter {
  getStatus(): SecurityStatus {
    return JSON.parse(JSON.stringify(STATUS));
  }

  runQuickScan(): { threats: number; scanned: number; duration: string; status: 'clean' | 'threats_found' } {
    return {
      threats: 0,
      scanned: 48750,
      duration: '2m 34s',
      status: 'clean',
    };
  }
}
