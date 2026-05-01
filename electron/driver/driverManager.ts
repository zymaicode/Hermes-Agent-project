export interface DriverEntry {
  name: string;
  provider: string;
  version: string;
  date: string;
  className: string;
  hardwareId: string;
  path: string;
  isSigned: boolean;
  isThirdParty: boolean;
  status: 'running' | 'stopped' | 'error';
}

export interface DriverBackup {
  id: string;
  name: string;
  date: string;
  driverCount: number;
  totalSize: number;
  path: string;
  description: string;
  driverIds: string[];
}

export interface DriverVersionDiff {
  name: string;
  currentVersion: string;
  backupVersion: string | null;
  newerVersion: string | null;
  status: 'same' | 'newer' | 'older' | 'missing_in_backup' | 'new_in_backup';
}

const DRIVERS: DriverEntry[] = [
  // Display (8)
  { name: 'nvlddmkm.sys', provider: 'NVIDIA Corporation', version: '32.0.15.5612', date: '2025-08-15', className: 'Display', hardwareId: 'PCI\\VEN_10DE&DEV_2684', path: 'C:\\Windows\\System32\\drivers\\nvlddmkm.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'nvapi64.dll', provider: 'NVIDIA Corporation', version: '32.0.15.5612', date: '2025-08-15', className: 'Display', hardwareId: 'PCI\\VEN_10DE&DEV_2684', path: 'C:\\Windows\\System32\\nvapi64.dll', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'igdkmd64.sys', provider: 'Intel Corporation', version: '31.0.101.5522', date: '2025-06-20', className: 'Display', hardwareId: 'PCI\\VEN_8086&DEV_A780', path: 'C:\\Windows\\System32\\drivers\\igdkmd64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'amdxe.sys', provider: 'Advanced Micro Devices, Inc.', version: '24.3.1.00001', date: '2025-03-01', className: 'Display', hardwareId: 'PCI\\VEN_1002&DEV_7480', path: 'C:\\Windows\\System32\\drivers\\amdxe.sys', isSigned: true, isThirdParty: true, status: 'stopped' },
  { name: 'ati2mtag.sys', provider: 'Advanced Micro Devices, Inc.', version: '8.970.100.9001', date: '2024-01-15', className: 'Display', hardwareId: 'PCI\\VEN_1002&DEV_68B8', path: 'C:\\Windows\\System32\\drivers\\ati2mtag.sys', isSigned: false, isThirdParty: true, status: 'stopped' },
  { name: 'dxgkrnl.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Display', hardwareId: 'ROOT\\DXGKRNL', path: 'C:\\Windows\\System32\\drivers\\dxgkrnl.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'dxgmms2.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Display', hardwareId: 'ROOT\\DXGMMS2', path: 'C:\\Windows\\System32\\drivers\\dxgmms2.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'BasicDisplay.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Display', hardwareId: 'ROOT\\BASICDISPLAY', path: 'C:\\Windows\\System32\\drivers\\BasicDisplay.sys', isSigned: true, isThirdParty: false, status: 'stopped' },

  // Network (8)
  { name: 'rt640x64.sys', provider: 'Realtek Semiconductor Corp.', version: '10.68.307.2024', date: '2024-08-10', className: 'Network', hardwareId: 'PCI\\VEN_10EC&DEV_8168', path: 'C:\\Windows\\System32\\drivers\\rt640x64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'e1r68x64.sys', provider: 'Intel Corporation', version: '12.19.1.37', date: '2024-10-22', className: 'Network', hardwareId: 'PCI\\VEN_8086&DEV_15F3', path: 'C:\\Windows\\System32\\drivers\\e1r68x64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'athw8x.sys', provider: 'Qualcomm Atheros', version: '12.0.0.1118', date: '2024-06-05', className: 'Network', hardwareId: 'PCI\\VEN_168C&DEV_0042', path: 'C:\\Windows\\System32\\drivers\\athw8x.sys', isSigned: true, isThirdParty: true, status: 'stopped' },
  { name: 'netrtwlane.sys', provider: 'Realtek Semiconductor Corp.', version: '6001.16.131.0', date: '2025-01-15', className: 'Network', hardwareId: 'PCI\\VEN_10EC&DEV_C822', path: 'C:\\Windows\\System32\\drivers\\netrtwlane.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'mrvlpcie8897.sys', provider: 'Marvell Semiconductor', version: '15.68.17025.119', date: '2024-03-12', className: 'Network', hardwareId: 'PCI\\VEN_11AB&DEV_2B38', path: 'C:\\Windows\\System32\\drivers\\mrvlpcie8897.sys', isSigned: true, isThirdParty: true, status: 'error' },
  { name: 'ndis.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'Network', hardwareId: 'ROOT\\NDIS', path: 'C:\\Windows\\System32\\drivers\\ndis.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'tcpip.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Network', hardwareId: 'ROOT\\TCPIP', path: 'C:\\Windows\\System32\\drivers\\tcpip.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'wfplwfs.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Network', hardwareId: 'ROOT\\WFPLWFS', path: 'C:\\Windows\\System32\\drivers\\wfplwfs.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Audio (6)
  { name: 'RTKVHD64.sys', provider: 'Realtek Semiconductor Corp.', version: '6.0.9629.1', date: '2025-02-20', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01&VEN_10EC', path: 'C:\\Windows\\System32\\drivers\\RTKVHD64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'HdAudio.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01', path: 'C:\\Windows\\System32\\drivers\\HdAudio.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'AtihdWT6.sys', provider: 'Advanced Micro Devices, Inc.', version: '10.0.1.30', date: '2025-01-28', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01&VEN_1002', path: 'C:\\Windows\\System32\\drivers\\AtihdWT6.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'nvhda64.sys', provider: 'NVIDIA Corporation', version: '1.4.0.1', date: '2025-06-10', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01&VEN_10DE', path: 'C:\\Windows\\System32\\drivers\\nvhda64.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'IntcAzAudAddService.sys', provider: 'Intel Corporation', version: '10.25.0.8576', date: '2024-12-15', className: 'Audio', hardwareId: 'HDAUDIO\\FUNC_01&VEN_8086', path: 'C:\\Windows\\System32\\drivers\\IntcAzAudAddService.sys', isSigned: true, isThirdParty: true, status: 'stopped' },
  { name: 'drmk.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Audio', hardwareId: 'ROOT\\DRMK', path: 'C:\\Windows\\System32\\drivers\\drmk.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // USB (6)
  { name: 'usbhub.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'USB', hardwareId: 'USB\\ROOT_HUB30', path: 'C:\\Windows\\System32\\drivers\\usbhub.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'usbhub3.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'USB', hardwareId: 'USB\\ROOT_HUB30', path: 'C:\\Windows\\System32\\drivers\\usbhub3.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'xhci.sys', provider: 'Intel Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'USB', hardwareId: 'PCI\\VEN_8086&DEV_7AE0', path: 'C:\\Windows\\System32\\drivers\\xhci.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'usbehci.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'USB', hardwareId: 'PCI\\VEN_8086&DEV_7AE1', path: 'C:\\Windows\\System32\\drivers\\usbehci.sys', isSigned: true, isThirdParty: false, status: 'stopped' },
  { name: 'usbxhci.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'USB', hardwareId: 'PCI\\VEN_8086&DEV_7AE0', path: 'C:\\Windows\\System32\\drivers\\usbxhci.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ucx01000.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'USB', hardwareId: 'ROOT\\UCX01000', path: 'C:\\Windows\\System32\\drivers\\ucx01000.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Storage (7)
  { name: 'storahci.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'PCI\\VEN_8086&DEV_7AE2', path: 'C:\\Windows\\System32\\drivers\\storahci.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'stornvme.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'PCI\\VEN_144D&DEV_A80A', path: 'C:\\Windows\\System32\\drivers\\stornvme.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'iaStorAC.sys', provider: 'Intel Corporation', version: '18.37.6.1018', date: '2024-07-20', className: 'Storage', hardwareId: 'PCI\\VEN_8086&DEV_2822', path: 'C:\\Windows\\System32\\drivers\\iaStorAC.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'iaStorVD.sys', provider: 'Intel Corporation', version: '19.5.7.1008', date: '2025-01-12', className: 'Storage', hardwareId: 'PCI\\VEN_8086&DEV_467F', path: 'C:\\Windows\\System32\\drivers\\iaStorVD.sys', isSigned: true, isThirdParty: true, status: 'stopped' },
  { name: 'disk.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'ROOT\\DISK', path: 'C:\\Windows\\System32\\drivers\\disk.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'EhStorClass.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Storage', hardwareId: 'ROOT\\EHSTORCLASS', path: 'C:\\Windows\\System32\\drivers\\EhStorClass.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'volmgr.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Storage', hardwareId: 'ROOT\\VOLMGR', path: 'C:\\Windows\\System32\\drivers\\volmgr.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // System (7)
  { name: 'hal.dll', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\HAL', path: 'C:\\Windows\\System32\\hal.dll', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ntoskrnl.exe', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\NTOSKRNL', path: 'C:\\Windows\\System32\\ntoskrnl.exe', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'CI.dll', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\CI', path: 'C:\\Windows\\System32\\CI.dll', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'FLTMGR.SYS', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\FLTMGR', path: 'C:\\Windows\\System32\\drivers\\FLTMGR.SYS', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'clipsp.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\CLIPSP', path: 'C:\\Windows\\System32\\drivers\\clipsp.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ksecdd.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\KSECDD', path: 'C:\\Windows\\System32\\drivers\\ksecdd.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'Wdf01000.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'System', hardwareId: 'ROOT\\WDF', path: 'C:\\Windows\\System32\\drivers\\Wdf01000.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Bluetooth (4)
  { name: 'bthport.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Bluetooth', hardwareId: 'ROOT\\BTHPORT', path: 'C:\\Windows\\System32\\drivers\\bthport.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'BTHUSB.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Bluetooth', hardwareId: 'USB\\VID_8087&PID_0029', path: 'C:\\Windows\\System32\\drivers\\BTHUSB.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ibtusb.sys', provider: 'Intel Corporation', version: '23.30.0.3', date: '2025-03-08', className: 'Bluetooth', hardwareId: 'USB\\VID_8087&PID_0029', path: 'C:\\Windows\\System32\\drivers\\ibtusb.sys', isSigned: true, isThirdParty: true, status: 'running' },
  { name: 'rtkbt.sys', provider: 'Realtek Semiconductor Corp.', version: '1.9.1051.3010', date: '2024-09-18', className: 'Bluetooth', hardwareId: 'USB\\VID_0BDA&PID_C822', path: 'C:\\Windows\\System32\\drivers\\rtkbt.sys', isSigned: true, isThirdParty: true, status: 'stopped' },

  // HID/Input (4)
  { name: 'i8042prt.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'HID', hardwareId: 'ACPI\\PNP0303', path: 'C:\\Windows\\System32\\drivers\\i8042prt.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'mouclass.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'HID', hardwareId: 'HID\\MOUSE', path: 'C:\\Windows\\System32\\drivers\\mouclass.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'kbdclass.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'HID', hardwareId: 'HID\\KEYBOARD', path: 'C:\\Windows\\System32\\drivers\\kbdclass.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'hidusb.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'HID', hardwareId: 'USB\\HID', path: 'C:\\Windows\\System32\\drivers\\hidusb.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Printer (2)
  { name: 'usbprint.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'Printer', hardwareId: 'USB\\PRINT', path: 'C:\\Windows\\System32\\drivers\\usbprint.sys', isSigned: true, isThirdParty: false, status: 'stopped' },
  { name: 'prnms009.sys', provider: 'HP Inc.', version: '11.2.0.0', date: '2024-04-15', className: 'Printer', hardwareId: 'PRINT\\HP_LaserJet', path: 'C:\\Windows\\System32\\drivers\\prnms009.sys', isSigned: true, isThirdParty: true, status: 'error' },

  // Chipset/ACPI (6)
  { name: 'acpi.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Chipset', hardwareId: 'ROOT\\ACPI_HAL', path: 'C:\\Windows\\System32\\drivers\\acpi.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'pci.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Chipset', hardwareId: 'ROOT\\PCI', path: 'C:\\Windows\\System32\\drivers\\pci.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'intelppm.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'Chipset', hardwareId: 'ACPI\\GENUINEINTEL', path: 'C:\\Windows\\System32\\drivers\\intelppm.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'amdppm.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3201', date: '2024-09-01', className: 'Chipset', hardwareId: 'ACPI\\AUTHENTICAMD', path: 'C:\\Windows\\System32\\drivers\\amdppm.sys', isSigned: true, isThirdParty: false, status: 'stopped' },
  { name: 'LPC.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Chipset', hardwareId: 'ROOT\\LPC', path: 'C:\\Windows\\System32\\drivers\\LPC.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'msisadrv.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Chipset', hardwareId: 'ROOT\\MSISADRV', path: 'C:\\Windows\\System32\\drivers\\msisadrv.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // File System/Minifilter (4)
  { name: 'Wof.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Filter', hardwareId: 'ROOT\\WOF', path: 'C:\\Windows\\System32\\drivers\\Wof.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'FileInfo.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Filter', hardwareId: 'ROOT\\FILEINFO', path: 'C:\\Windows\\System32\\drivers\\FileInfo.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'Ntfs.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Filter', hardwareId: 'ROOT\\NTFS', path: 'C:\\Windows\\System32\\drivers\\Ntfs.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'fastfat.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Filter', hardwareId: 'ROOT\\FASTFAT', path: 'C:\\Windows\\System32\\drivers\\fastfat.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Security (4)
  { name: 'cng.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Security', hardwareId: 'ROOT\\CNG', path: 'C:\\Windows\\System32\\drivers\\cng.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'tpm.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Security', hardwareId: 'ACPI\\MSFT0101', path: 'C:\\Windows\\System32\\drivers\\tpm.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'fvevol.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Security', hardwareId: 'ROOT\\FVEVOL', path: 'C:\\Windows\\System32\\drivers\\fvevol.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'mssecflt.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Security', hardwareId: 'ROOT\\MSSECFLT', path: 'C:\\Windows\\System32\\drivers\\mssecflt.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Power/Battery (2)
  { name: 'CmBatt.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Battery', hardwareId: 'ACPI\\PNP0C0A', path: 'C:\\Windows\\System32\\drivers\\CmBatt.sys', isSigned: true, isThirdParty: false, status: 'running' },
  { name: 'ACPI.sys', provider: 'Microsoft Corporation', version: '10.0.19041.3636', date: '2024-11-01', className: 'Battery', hardwareId: 'ACPI\\HAL', path: 'C:\\Windows\\System32\\drivers\\acpi.sys', isSigned: true, isThirdParty: false, status: 'running' },

  // Firmware/BIOS (1)
  { name: 'spldr.sys', provider: 'Microsoft Corporation', version: '10.0.19041.1', date: '2024-05-10', className: 'Firmware', hardwareId: 'ROOT\\SPLDR', path: 'C:\\Windows\\System32\\drivers\\spldr.sys', isSigned: true, isThirdParty: false, status: 'running' },
];

let backups: DriverBackup[] = [
  {
    id: 'bkp-001',
    name: '初始完整备份',
    date: '2026-04-15T10:30:00',
    driverCount: 52,
    totalSize: 524_000_000,
    path: 'D:\\DriverBackup\\初始完整备份_20260415',
    description: '系统安装后的完整驱动备份',
    driverIds: ['nvlddmkm.sys', 'igdkmd64.sys', 'dxgkrnl.sys', 'rt640x64.sys', 'RTKVHD64.sys', 'storahci.sys', 'stornvme.sys', 'ntoskrnl.exe', 'hal.dll', 'acpi.sys'],
  },
  {
    id: 'bkp-002',
    name: '显示驱动备份',
    date: '2026-04-20T14:00:00',
    driverCount: 8,
    totalSize: 120_000_000,
    path: 'D:\\DriverBackup\\显示驱动备份_20260420',
    description: 'GPU驱动更新前的备份',
    driverIds: ['nvlddmkm.sys', 'nvapi64.dll', 'igdkmd64.sys', 'amdxe.sys', 'dxgkrnl.sys', 'dxgmms2.sys', 'BasicDisplay.sys'],
  },
  {
    id: 'bkp-003',
    name: '网络和音频驱动',
    date: '2026-04-25T09:15:00',
    driverCount: 14,
    totalSize: 180_000_000,
    path: 'D:\\DriverBackup\\网络音频驱动_20260425',
    description: '网络和音频驱动定期备份',
    driverIds: ['rt640x64.sys', 'e1r68x64.sys', 'ndis.sys', 'tcpip.sys', 'RTKVHD64.sys', 'HdAudio.sys', 'AtihdWT6.sys', 'nvhda64.sys'],
  },
];

let nextBackupId = 4;

function backupId(): string {
  return `bkp-${String(nextBackupId++).padStart(3, '0')}`;
}

export class DriverManager {
  listDrivers(): DriverEntry[] {
    return DRIVERS;
  }

  getDriverDetail(hardwareId: string): DriverEntry | null {
    return DRIVERS.find((d) => d.hardwareId === hardwareId) || null;
  }

  async createBackup(name: string, driverIds?: string[]): Promise<DriverBackup> {
    const selected = driverIds && driverIds.length > 0
      ? DRIVERS.filter((d) => driverIds.includes(d.name))
      : DRIVERS;

    const totalSize = selected.length * 8_000_000 + Math.random() * 20_000_000;
    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10).replace(/-/g, '');

    const backup: DriverBackup = {
      id: backupId(),
      name,
      date: now,
      driverCount: selected.length,
      totalSize: Math.round(totalSize),
      path: `D:\\DriverBackup\\${name}_${dateStr}`,
      description: '',
      driverIds: selected.map((d) => d.name),
    };

    backups.push(backup);
    return backup;
  }

  listBackups(): DriverBackup[] {
    return backups;
  }

  async restoreBackup(backupId: string): Promise<{ success: boolean; message: string; restoredCount: number }> {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) {
      return { success: false, message: '备份不存在', restoredCount: 0 };
    }
    return {
      success: true,
      message: `已成功从备份 "${backup.name}" 还原 ${backup.driverCount} 个驱动`,
      restoredCount: backup.driverCount,
    };
  }

  getVersionDiff(backupId: string): DriverVersionDiff[] {
    const backup = backups.find((b) => b.id === backupId);
    if (!backup) return [];

    const results: DriverVersionDiff[] = [];
    const lookup = new Map(DRIVERS.map((d) => [d.name, d]));

    for (const name of backup.driverIds) {
      const current = lookup.get(name);
      if (current) {
        results.push({
          name,
          currentVersion: current.version,
          backupVersion: current.version,
          newerVersion: null,
          status: 'same',
        });
      } else {
        results.push({
          name,
          currentVersion: '已删除',
          backupVersion: null,
          newerVersion: null,
          status: 'missing_in_backup',
        });
      }
    }

    // Check for drivers not in backup
    const backupNames = new Set(backup.driverIds);
    for (const d of DRIVERS) {
      if (!backupNames.has(d.name)) {
        results.push({
          name: d.name,
          currentVersion: d.version,
          backupVersion: null,
          newerVersion: null,
          status: 'new_in_backup',
        });
      }
    }

    // Scatter some version differences for realism
    const diffNames = [
      { n: 'nvlddmkm.sys', v: '32.0.15.5550', s: 'newer' as const },
      { n: 'RTKVHD64.sys', v: '6.0.9500.1', s: 'older' as const },
      { n: 'mrvlpcie8897.sys', v: '15.68.17025.130', s: 'newer' as const },
    ];

    for (const diff of diffNames) {
      const entry = results.find((r) => r.name === diff.n);
      if (entry) {
        if (diff.s === 'newer') {
          entry.newerVersion = diff.v;
          entry.status = 'newer';
        } else {
          entry.backupVersion = diff.v;
          entry.status = 'older';
        }
      }
    }

    return results;
  }

  deleteBackup(backupId: string): boolean {
    const idx = backups.findIndex((b) => b.id === backupId);
    if (idx === -1) return false;
    backups.splice(idx, 1);
    return true;
  }
}
