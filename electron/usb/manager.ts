export interface UsbDevice {
  name: string;
  type: 'storage' | 'input' | 'audio' | 'network' | 'imaging' | 'other';
  vendor: string;
  product: string;
  serialNumber: string;
  connected: boolean;
  firstConnected: string;
  lastConnected: string;
  driver: string;
  powerRequired: number;
  busType: 'USB 2.0' | 'USB 3.0' | 'USB-C' | 'Thunderbolt';
  vid: string;
  pid: string;
  description: string;
  isRemovable: boolean;
}

export interface UsbHistoryEntry {
  name: string;
  type: string;
  serialNumber: string;
  firstSeen: string;
  lastSeen: string;
  timesConnected: number;
}

const CONNECTED: UsbDevice[] = [
  { name: 'Samsung T7 Portable SSD', type: 'storage', vendor: 'Samsung Electronics', product: 'T7 Touch', serialNumber: 'S4TNX0R123456', connected: true, firstConnected: '2026-03-15 14:30:00', lastConnected: '2026-05-01 08:15:00', driver: 'USBSTOR.SYS (Microsoft 6.3)', powerRequired: 500, busType: 'USB 3.0', vid: '04E8', pid: '4001', description: 'Samsung T7 Portable SSD - 1TB External Solid State Drive', isRemovable: true },
  { name: 'SanDisk Ultra USB 3.0 Flash Drive', type: 'storage', vendor: 'SanDisk Corporation', product: 'Ultra USB 3.0', serialNumber: '4C530001230415109372', connected: true, firstConnected: '2026-04-20 09:00:00', lastConnected: '2026-05-01 08:15:00', driver: 'USBSTOR.SYS (Microsoft 6.3)', powerRequired: 200, busType: 'USB 3.0', vid: '0781', pid: '5581', description: 'SanDisk Ultra USB 3.0 Flash Drive - 64GB', isRemovable: true },
  { name: 'Logitech G502 X Plus', type: 'input', vendor: 'Logitech Inc.', product: 'G502 X Plus Gaming Mouse', serialNumber: '2359LZ0PTA98', connected: true, firstConnected: '2026-02-10 11:00:00', lastConnected: '2026-05-01 08:15:00', driver: 'HID-compliant mouse (Microsoft)', powerRequired: 100, busType: 'USB 2.0', vid: '046D', pid: 'C08B', description: 'Logitech G502 X Plus LIGHTSPEED Wireless Gaming Mouse', isRemovable: true },
  { name: 'Corsair K95 RGB Platinum', type: 'input', vendor: 'Corsair Components Inc.', product: 'K95 RGB Platinum Keyboard', serialNumber: '1103LZ02AB34', connected: true, firstConnected: '2026-02-10 11:00:00', lastConnected: '2026-05-01 08:15:00', driver: 'HID Keyboard Device (Microsoft)', powerRequired: 500, busType: 'USB 3.0', vid: '1B1C', pid: '1B2D', description: 'Corsair K95 RGB Platinum Mechanical Gaming Keyboard', isRemovable: true },
  { name: 'Jabra Evolve2 85', type: 'audio', vendor: 'GN Audio A/S', product: 'Jabra Evolve2 85', serialNumber: '302BC5F8E901', connected: true, firstConnected: '2026-03-01 08:00:00', lastConnected: '2026-05-01 08:10:00', driver: 'Jabra Link 380 (Jabra)', powerRequired: 100, busType: 'USB 2.0', vid: '0B0E', pid: '2450', description: 'Jabra Evolve2 85 Wireless Headset with USB-A dongle', isRemovable: true },
  { name: 'DELL UltraSharp U2723QE Hub', type: 'other', vendor: 'Dell Inc.', product: 'U2723QE Monitor Hub', serialNumber: 'CN0W4R7X74200', connected: true, firstConnected: '2026-01-20 10:00:00', lastConnected: '2026-05-01 08:15:00', driver: 'USB Hub (Microsoft)', powerRequired: 900, busType: 'USB-C', vid: '05E3', pid: '0620', description: 'Dell UltraSharp U2723QE - Built-in USB-C Hub with 4x USB-A 3.2 ports', isRemovable: false },
  { name: 'Elgato Facecam Pro', type: 'imaging', vendor: 'Elgato Systems GmbH', product: 'Facecam Pro', serialNumber: 'EC2W8B5A00047', connected: true, firstConnected: '2026-04-10 15:00:00', lastConnected: '2026-05-01 08:14:00', driver: 'Elgato Facecam Pro Driver (1.3.0)', powerRequired: 500, busType: 'USB 3.0', vid: '0FD9', pid: '0082', description: 'Elgato Facecam Pro - 4K60 Webcam with Sony Starvis sensor', isRemovable: true },
  { name: 'TP-Link UB500 Bluetooth 5.0', type: 'network', vendor: 'TP-Link Technologies', product: 'UB500 Bluetooth Adapter', serialNumber: 'TLUB5002300107', connected: true, firstConnected: '2026-01-15 10:30:00', lastConnected: '2026-05-01 08:15:00', driver: 'BTHUSB.SYS (Microsoft)', powerRequired: 100, busType: 'USB 2.0', vid: '2357', pid: '0604', description: 'TP-Link UB500 Bluetooth 5.0 USB Adapter, CSR8510 chipset', isRemovable: true },
];

const HISTORY: UsbHistoryEntry[] = [
  { name: 'Samsung T7 Portable SSD', type: 'storage', serialNumber: 'S4TNX0R123456', firstSeen: '2026-03-15 14:30:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 47 },
  { name: 'SanDisk Ultra USB 3.0 Flash Drive', type: 'storage', serialNumber: '4C530001230415109372', firstSeen: '2026-04-20 09:00:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 12 },
  { name: 'Kingston DataTraveler 100 G3', type: 'storage', serialNumber: '50E5495130B2E0A0', firstSeen: '2026-01-05 16:00:00', lastSeen: '2026-04-28 14:00:00', timesConnected: 23 },
  { name: 'WD My Passport 2TB', type: 'storage', serialNumber: 'WX22DA04H3T9', firstSeen: '2025-12-10 10:00:00', lastSeen: '2026-04-15 18:30:00', timesConnected: 89 },
  { name: 'Seagate Backup Plus Slim 1TB', type: 'storage', serialNumber: 'NA9TJ5R2', firstSeen: '2025-11-20 09:00:00', lastSeen: '2026-03-30 11:00:00', timesConnected: 56 },
  { name: 'Logitech G502 X Plus', type: 'input', serialNumber: '2359LZ0PTA98', firstSeen: '2026-02-10 11:00:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 80 },
  { name: 'Corsair K95 RGB Platinum', type: 'input', serialNumber: '1103LZ02AB34', firstSeen: '2026-02-10 11:00:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 80 },
  { name: 'Razer DeathAdder V3 Pro', type: 'input', serialNumber: 'PM2345H167890', firstSeen: '2026-01-10 08:00:00', lastSeen: '2026-04-29 17:00:00', timesConnected: 34 },
  { name: 'Apple Magic Keyboard', type: 'input', serialNumber: 'F0T124503J', firstSeen: '2026-02-15 12:00:00', lastSeen: '2026-04-25 09:00:00', timesConnected: 8 },
  { name: 'Jabra Evolve2 85', type: 'audio', serialNumber: '302BC5F8E901', firstSeen: '2026-03-01 08:00:00', lastSeen: '2026-05-01 08:10:00', timesConnected: 62 },
  { name: 'Sony WH-1000XM5', type: 'audio', serialNumber: 'SNY78901234', firstSeen: '2026-03-20 14:00:00', lastSeen: '2026-04-28 10:00:00', timesConnected: 18 },
  { name: 'HyperX Cloud Alpha Wireless', type: 'audio', serialNumber: 'HYP3500BK004', firstSeen: '2026-01-20 13:00:00', lastSeen: '2026-03-15 19:00:00', timesConnected: 25 },
  { name: 'Elgato Facecam Pro', type: 'imaging', serialNumber: 'EC2W8B5A00047', firstSeen: '2026-04-10 15:00:00', lastSeen: '2026-05-01 08:14:00', timesConnected: 22 },
  { name: 'Canon EOS R6 Mark II', type: 'imaging', serialNumber: 'CNR62034589', firstSeen: '2026-03-28 10:00:00', lastSeen: '2026-04-15 16:00:00', timesConnected: 6 },
  { name: 'DELL UltraSharp U2723QE Hub', type: 'other', serialNumber: 'CN0W4R7X74200', firstSeen: '2026-01-20 10:00:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 102 },
  { name: 'TP-Link UB500 Bluetooth 5.0', type: 'network', serialNumber: 'TLUB5002300107', firstSeen: '2026-01-15 10:30:00', lastSeen: '2026-05-01 08:15:00', timesConnected: 107 },
  { name: 'YubiKey 5C NFC', type: 'other', serialNumber: 'YK524060289', firstSeen: '2026-01-05 09:00:00', lastSeen: '2026-04-30 09:15:00', timesConnected: 35 },
  { name: 'iPhone 15 Pro Max', type: 'other', serialNumber: 'F4G9X2N7YQ', firstSeen: '2026-03-10 10:00:00', lastSeen: '2026-04-28 20:00:00', timesConnected: 18 },
];

export class UsbManager {
  getConnectedDevices(): UsbDevice[] {
    return CONNECTED.map((d) => ({ ...d }));
  }

  getHistory(): UsbHistoryEntry[] {
    return HISTORY.map((h) => ({ ...h }));
  }

  ejectDevice(serialNumber: string): { success: boolean; message: string } {
    const device = CONNECTED.find((d) => d.serialNumber === serialNumber && d.type === 'storage');
    if (!device) {
      return { success: false, message: 'Only storage devices can be ejected' };
    }
    return { success: true, message: `Device "${device.name}" safely ejected` };
  }
}
