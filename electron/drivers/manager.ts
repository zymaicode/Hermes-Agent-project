export interface DriverEntry {
  name: string;
  provider: string;
  version: string;
  date: string;
  status: 'running' | 'stopped' | 'error';
  type: 'kernel' | 'file_system' | 'filter' | 'display' | 'network' | 'audio' | 'usb' | 'other';
  deviceName: string;
  deviceClass: string;
  infFile: string;
  signed: boolean;
  baseAddress: string;
  sizeKB: number;
}

export type DriverDetail = DriverEntry & {
  dependencies: string[];
  dependentDrivers: string[];
  pnpId: string;
  hardwareIds: string[];
  registryPath: string;
};

function hex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(8, '0');
}

const DRIVERS: DriverEntry[] = [
  // Kernel drivers
  { name: 'ntoskrnl.exe', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'kernel', deviceName: '\\Device\\NtosKrnl', deviceClass: 'System', infFile: 'ntoskrnl.inf', signed: true, baseAddress: hex(0xFFFFF80000000000 + 0x200000), sizeKB: 15360 },
  { name: 'hal.dll', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'kernel', deviceName: '\\Device\\Hal', deviceClass: 'System', infFile: 'hal.inf', signed: true, baseAddress: hex(0xFFFFF80000000000 + 0x100000), sizeKB: 1024 },
  { name: 'ksecdd.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'kernel', deviceName: '\\Device\\KSecDD', deviceClass: 'Security', infFile: 'ksecdd.inf', signed: true, baseAddress: hex(0xFFFFF80000100000 + 0x50000), sizeKB: 320 },
  { name: 'clipsp.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1150', date: '2024-07-10', status: 'running', type: 'kernel', deviceName: '\\Device\\ClipSp', deviceClass: 'Security', infFile: 'clipsp.inf', signed: true, baseAddress: hex(0xFFFFF80000150000 + 0x30000), sizeKB: 192 },
  { name: 'cmimcext.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'running', type: 'kernel', deviceName: '\\Device\\CmimcExt', deviceClass: 'System', infFile: 'cmimcext.inf', signed: true, baseAddress: hex(0xFFFFF80000180000 + 0x20000), sizeKB: 128 },

  // File system drivers
  { name: 'ntfs.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'file_system', deviceName: '\\FileSystem\\Ntfs', deviceClass: 'Volume', infFile: 'ntfs.inf', signed: true, baseAddress: hex(0xFFFFF80001000000 + 0x800000), sizeKB: 8192 },
  { name: 'fastfat.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'file_system', deviceName: '\\FileSystem\\Fastfat', deviceClass: 'Volume', infFile: 'fastfat.inf', signed: true, baseAddress: hex(0xFFFFF80001800000 + 0x100000), sizeKB: 1024 },
  { name: 'exfat.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'file_system', deviceName: '\\FileSystem\\Exfat', deviceClass: 'Volume', infFile: 'exfat.inf', signed: true, baseAddress: hex(0xFFFFF80001900000 + 0x120000), sizeKB: 1152 },
  { name: 'cdfs.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'stopped', type: 'file_system', deviceName: '\\FileSystem\\Cdfs', deviceClass: 'Volume', infFile: 'cdfs.inf', signed: true, baseAddress: hex(0xFFFFF80001A00000 + 0x80000), sizeKB: 512 },

  // Filter drivers
  { name: 'fltMgr.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'filter', deviceName: '\\FileSystem\\Filters\\FltMgr', deviceClass: 'Filter', infFile: 'fltMgr.inf', signed: true, baseAddress: hex(0xFFFFF80002000000 + 0x400000), sizeKB: 4096 },
  { name: 'wof.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'filter', deviceName: '\\FileSystem\\Filters\\Wof', deviceClass: 'Filter', infFile: 'wof.inf', signed: true, baseAddress: hex(0xFFFFF80002400000 + 0x80000), sizeKB: 512 },
  { name: 'wcifs.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'filter', deviceName: '\\FileSystem\\Filters\\Wcifs', deviceClass: 'Filter', infFile: 'wcifs.inf', signed: true, baseAddress: hex(0xFFFFF80002480000 + 0x60000), sizeKB: 384 },

  // Display drivers
  { name: 'nvlddmkm.sys', provider: 'NVIDIA Corporation', version: '32.0.15.6094', date: '2025-02-28', status: 'running', type: 'display', deviceName: '\\Device\\Video0', deviceClass: 'Display', infFile: 'oem12.inf', signed: true, baseAddress: hex(0xFFFFF80003000000 + 0xC00000), sizeKB: 12288 },
  { name: 'nvhda64.sys', provider: 'NVIDIA Corporation', version: '1.4.0.1', date: '2025-02-28', status: 'running', type: 'audio', deviceName: '\\Device\\Hdaudio\\Nvidia', deviceClass: 'MEDIA', infFile: 'oem13.inf', signed: true, baseAddress: hex(0xFFFFF80003C00000 + 0x100000), sizeKB: 1024 },
  { name: 'atikmdag.sys', provider: 'Advanced Micro Devices, Inc.', version: '24.12.1.241206a', date: '2025-01-20', status: 'stopped', type: 'display', deviceName: '\\Device\\Video1', deviceClass: 'Display', infFile: 'oem5.inf', signed: true, baseAddress: hex(0xFFFFF80003D00000 + 0xA00000), sizeKB: 10240 },
  { name: 'igdkmd64.sys', provider: 'Intel Corporation', version: '31.0.101.5376', date: '2025-03-10', status: 'stopped', type: 'display', deviceName: '\\Device\\Video2', deviceClass: 'Display', infFile: 'oem8.inf', signed: true, baseAddress: hex(0xFFFFF80004700000 + 0x800000), sizeKB: 8192 },

  // Network drivers
  { name: 'tcpip.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'network', deviceName: '\\Device\\Tcp', deviceClass: 'Net', infFile: 'tcpip.inf', signed: true, baseAddress: hex(0xFFFFF80005000000 + 0x600000), sizeKB: 6144 },
  { name: 'ndis.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'network', deviceName: '\\Device\\Ndis', deviceClass: 'Net', infFile: 'ndis.inf', signed: true, baseAddress: hex(0xFFFFF80005600000 + 0x200000), sizeKB: 2048 },
  { name: 'rt640x64.sys', provider: 'Realtek Semiconductor Corp.', version: '10.72.524.2024', date: '2024-09-15', status: 'running', type: 'network', deviceName: '\\Device\\NDMP2', deviceClass: 'Net', infFile: 'oem20.inf', signed: true, baseAddress: hex(0xFFFFF80005800000 + 0x80000), sizeKB: 512 },
  { name: 'netwtw14.sys', provider: 'Intel Corporation', version: '23.60.1.2', date: '2025-01-05', status: 'running', type: 'network', deviceName: '\\Device\\NDMP3', deviceClass: 'Net', infFile: 'oem25.inf', signed: true, baseAddress: hex(0xFFFFF80005880000 + 0x180000), sizeKB: 1536 },
  { name: 'Qcamain10x64.sys', provider: 'Qualcomm Atheros', version: '12.0.0.1249', date: '2024-11-20', status: 'stopped', type: 'network', deviceName: '\\Device\\NDMP4', deviceClass: 'Net', infFile: 'oem30.inf', signed: true, baseAddress: hex(0xFFFFF80005A00000 + 0x100000), sizeKB: 1024 },

  // Audio drivers
  { name: 'RTKVHD64.sys', provider: 'Realtek Semiconductor Corp.', version: '6.0.9746.1', date: '2025-02-10', status: 'running', type: 'audio', deviceName: '\\Device\\Hdaudio\\Realtek', deviceClass: 'MEDIA', infFile: 'oem14.inf', signed: true, baseAddress: hex(0xFFFFF80005B00000 + 0x800000), sizeKB: 8192 },
  { name: 'IntcAudioBus.sys', provider: 'Intel Corporation', version: '10.29.0.10350', date: '2025-01-25', status: 'running', type: 'audio', deviceName: '\\Device\\Hdaudio\\Intel', deviceClass: 'MEDIA', infFile: 'oem15.inf', signed: true, baseAddress: hex(0xFFFFF80006300000 + 0x400000), sizeKB: 4096 },

  // USB drivers
  { name: 'USBXHCI.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'usb', deviceName: '\\Device\\USBXHCI', deviceClass: 'USB', infFile: 'usbxhci.inf', signed: true, baseAddress: hex(0xFFFFF80006700000 + 0x80000), sizeKB: 512 },
  { name: 'usbhub3.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'usb', deviceName: '\\Device\\USBHUB3', deviceClass: 'USB', infFile: 'usbhub3.inf', signed: true, baseAddress: hex(0xFFFFF80006780000 + 0x100000), sizeKB: 1024 },
  { name: 'USBSTOR.SYS', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'usb', deviceName: '\\Device\\USBSTOR', deviceClass: 'USB', infFile: 'usbstor.inf', signed: true, baseAddress: hex(0xFFFFF80006880000 + 0x60000), sizeKB: 384 },
  { name: 'hidusb.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'usb', deviceName: '\\Device\\HIDUSB', deviceClass: 'HIDClass', infFile: 'hidusb.inf', signed: true, baseAddress: hex(0xFFFFF800068E0000 + 0x20000), sizeKB: 128 },

  // Other drivers
  { name: 'ahci.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'other', deviceName: '\\Device\\Scsi\\AHCI', deviceClass: 'SCSIAdapter', infFile: 'mshdc.inf', signed: true, baseAddress: hex(0xFFFFF80006900000 + 0x100000), sizeKB: 1024 },
  { name: 'storport.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'other', deviceName: '\\Device\\RaidPort0', deviceClass: 'SCSIAdapter', infFile: 'storport.inf', signed: true, baseAddress: hex(0xFFFFF80006A00000 + 0x80000), sizeKB: 512 },
  { name: 'nvme.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'other', deviceName: '\\Device\\Nvme0', deviceClass: 'SCSIAdapter', infFile: 'stornvme.inf', signed: true, baseAddress: hex(0xFFFFF80006A80000 + 0x60000), sizeKB: 384 },
  { name: 'kbdclass.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'running', type: 'other', deviceName: '\\Device\\KeyboardClass0', deviceClass: 'Keyboard', infFile: 'keyboard.inf', signed: true, baseAddress: hex(0xFFFFF80006AE0000 + 0x8000), sizeKB: 32 },
  { name: 'mouclass.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'running', type: 'other', deviceName: '\\Device\\MouseClass0', deviceClass: 'Mouse', infFile: 'msmouse.inf', signed: true, baseAddress: hex(0xFFFFF80006AE8000 + 0x8000), sizeKB: 32 },
  { name: 'monitor.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1882', date: '2024-09-20', status: 'running', type: 'other', deviceName: '\\Device\\Monitor0', deviceClass: 'Monitor', infFile: 'monitor.inf', signed: true, baseAddress: hex(0xFFFFF80006AF0000 + 0x10000), sizeKB: 64 },
  { name: 'vmbus.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'stopped', type: 'other', deviceName: '\\Device\\VMBus', deviceClass: 'System', infFile: 'vmbus.inf', signed: true, baseAddress: hex(0xFFFFF80006B00000 + 0x80000), sizeKB: 512 },
  { name: 'parport.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'stopped', type: 'other', deviceName: '\\Device\\Parallel0', deviceClass: 'Ports', infFile: 'msports.inf', signed: true, baseAddress: hex(0xFFFFF80006B80000 + 0x20000), sizeKB: 128 },
  { name: 'netbt.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3037', date: '2024-12-10', status: 'running', type: 'network', deviceName: '\\Device\\NetBT', deviceClass: 'Net', infFile: 'netbt.inf', signed: true, baseAddress: hex(0xFFFFF80006BA0000 + 0x40000), sizeKB: 256 },
  { name: 'afd.sys', provider: 'Microsoft Corporation', version: '10.0.26100.3323', date: '2025-01-15', status: 'running', type: 'network', deviceName: '\\Device\\Afd', deviceClass: 'Net', infFile: 'afd.inf', signed: true, baseAddress: hex(0xFFFFF80006BE0000 + 0x50000), sizeKB: 320 },
  { name: 'ElgatoVAD.sys', provider: 'Elgato Systems GmbH', version: '1.1.0.16', date: '2024-08-15', status: 'running', type: 'audio', deviceName: '\\Device\\ElgatoVAD', deviceClass: 'MEDIA', infFile: 'oem35.inf', signed: true, baseAddress: hex(0xFFFFF80006C30000 + 0x60000), sizeKB: 384 },
  { name: 'hrdevmon.sys', provider: 'Microsoft Corporation', version: '10.0.26100.1', date: '2024-06-01', status: 'error', type: 'other', deviceName: '\\Device\\HrDevMon', deviceClass: 'System', infFile: 'hrdevmon.inf', signed: true, baseAddress: hex(0xFFFFF80006C90000 + 0x8000), sizeKB: 32 },
];

const DETAILS: Record<string, Omit<DriverDetail, keyof DriverEntry>> = {
  'ntoskrnl.exe': {
    dependencies: ['hal.dll', 'ksecdd.sys', 'fltMgr.sys'],
    dependentDrivers: ['ntfs.sys', 'tcpip.sys', 'ndis.sys', 'USBXHCI.sys', 'ahci.sys'],
    pnpId: 'ROOT\\NTOSKRNL\\0000',
    hardwareIds: ['ROOT\\NTOSKRNL'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\NTOSKRNL',
  },
  'nvlddmkm.sys': {
    dependencies: ['ntoskrnl.exe'],
    dependentDrivers: ['nvhda64.sys'],
    pnpId: 'PCI\\VEN_10DE&DEV_2684&SUBSYS_88771043&REV_A1',
    hardwareIds: ['PCI\\VEN_10DE&DEV_2684', 'PCI\\VEN_10DE&DEV_2684&SUBSYS_88771043'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\nvlddmkm',
  },
  'nvhda64.sys': {
    dependencies: ['nvlddmkm.sys'],
    dependentDrivers: [],
    pnpId: 'HDAUDIO\\FUNC_01&VEN_10DE&DEV_009E',
    hardwareIds: ['HDAUDIO\\FUNC_01&VEN_10DE'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\NVHDA',
  },
  'RTKVHD64.sys': {
    dependencies: ['IntcAudioBus.sys'],
    dependentDrivers: [],
    pnpId: 'HDAUDIO\\FUNC_01&VEN_10EC&DEV_0897',
    hardwareIds: ['HDAUDIO\\FUNC_01&VEN_10EC&DEV_0897'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\IntcAzAudAddService',
  },
  'rt640x64.sys': {
    dependencies: ['ndis.sys'],
    dependentDrivers: [],
    pnpId: 'PCI\\VEN_10EC&DEV_8168&SUBSYS_86771043',
    hardwareIds: ['PCI\\VEN_10EC&DEV_8168'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\rt640x64',
  },
  'netwtw14.sys': {
    dependencies: ['ndis.sys'],
    dependentDrivers: [],
    pnpId: 'PCI\\VEN_8086&DEV_2725&SUBSYS_00248086',
    hardwareIds: ['PCI\\VEN_8086&DEV_2725'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Netwtw14',
  },
  'USBXHCI.sys': {
    dependencies: ['ntoskrnl.exe'],
    dependentDrivers: ['usbhub3.sys', 'USBSTOR.SYS', 'hidusb.sys'],
    pnpId: 'PCI\\VEN_8086&DEV_7AE0',
    hardwareIds: ['PCI\\VEN_8086&DEV_7AE0'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBXHCI',
  },
  'hrdevmon.sys': {
    dependencies: [],
    dependentDrivers: [],
    pnpId: 'ROOT\\HRDEVMON\\0000',
    hardwareIds: ['ROOT\\HRDEVMON'],
    registryPath: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\hrdevmon',
  },
};

function defaultDetail(d: DriverEntry): DriverDetail {
  return {
    ...d,
    dependencies: ['ntoskrnl.exe'],
    dependentDrivers: [],
    pnpId: `ROOT\\${d.name.replace(/\.\w+$/, '').toUpperCase()}\\0000`,
    hardwareIds: [`ROOT\\${d.name.replace(/\.\w+$/, '').toUpperCase()}`],
    registryPath: `HKLM\\SYSTEM\\CurrentControlSet\\Services\\${d.name.replace(/\.\w+$/, '')}`,
  };
}

export class DriverManager {
  getDrivers(): DriverEntry[] {
    return DRIVERS;
  }

  getDriverDetails(name: string): DriverDetail | null {
    const d = DRIVERS.find((d) => d.name === name);
    if (!d) return null;
    return DETAILS[name] ? { ...d, ...DETAILS[name] } : defaultDetail(d);
  }

  getProblemDrivers(): DriverEntry[] {
    return DRIVERS.filter((d) => d.status === 'error');
  }
}
