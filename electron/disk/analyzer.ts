export interface DiskCategory {
  name: string;
  sizeGB: number;
  fileCount: number;
  color: string;
  items?: { name: string; sizeMB: number; path: string }[];
}

export interface LargeFile {
  name: string;
  path: string;
  sizeMB: number;
  type: string;
  lastModified: string;
}

export interface TempFileCategory {
  name: string;
  sizeMB: number;
  fileCount: number;
  description: string;
  safeToDelete: boolean;
}

const SPACE_DISTRIBUTION: DiskCategory[] = [
  { name: 'System Files', sizeGB: 25.4, fileCount: 184320, color: '#58a6ff', items: [
    { name: 'Windows folder', sizeMB: 18400, path: 'C:\\Windows' },
    { name: 'System32', sizeMB: 6200, path: 'C:\\Windows\\System32' },
    { name: 'WinSxS', sizeMB: 7800, path: 'C:\\Windows\\WinSxS' },
    { name: 'DriverStore', sizeMB: 2300, path: 'C:\\Windows\\System32\\DriverStore' },
    { name: 'Installer cache', sizeMB: 890, path: 'C:\\Windows\\Installer' },
  ]},
  { name: 'Applications', sizeGB: 40.2, fileCount: 95240, color: '#3fb950', items: [
    { name: 'Microsoft Office 365', sizeMB: 4200, path: 'C:\\Program Files\\Microsoft Office' },
    { name: 'Visual Studio 2022', sizeMB: 8900, path: 'C:\\Program Files\\Microsoft Visual Studio' },
    { name: 'Adobe Creative Cloud', sizeMB: 5600, path: 'C:\\Program Files\\Adobe' },
    { name: 'JetBrains Toolbox', sizeMB: 3200, path: 'C:\\Users\\User\\AppData\\Local\\JetBrains' },
    { name: 'Docker Desktop', sizeMB: 2800, path: 'C:\\Program Files\\Docker' },
    { name: 'Node.js + npm global', sizeMB: 1800, path: 'C:\\Program Files\\nodejs' },
    { name: 'Python 3.12 + packages', sizeMB: 2100, path: 'C:\\Python312' },
    { name: 'Slack + Discord + Teams', sizeMB: 1600, path: 'C:\\Users\\User\\AppData\\Local' },
  ]},
  { name: 'Games', sizeGB: 30.1, fileCount: 42150, color: '#a371f7', items: [
    { name: 'Steam Library (Cyberpunk 2077)', sizeMB: 72000, path: 'D:\\SteamLibrary\\steamapps\\common\\Cyberpunk 2077' },
    { name: 'Steam Library (Baldur\'s Gate 3)', sizeMB: 145000, path: 'D:\\SteamLibrary\\steamapps\\common\\Baldurs Gate 3' },
    { name: 'Xbox Game Pass (Starfield)', sizeMB: 125000, path: 'C:\\XboxGames\\Starfield' },
    { name: 'Epic Games (Fortnite)', sizeMB: 42000, path: 'C:\\Program Files\\Epic Games\\Fortnite' },
  ]},
  { name: 'Documents', sizeGB: 8.3, fileCount: 28740, color: '#d29922', items: [
    { name: 'Projects', sizeMB: 3200, path: 'C:\\Users\\User\\Documents\\Projects' },
    { name: 'PDFs & eBooks', sizeMB: 1800, path: 'C:\\Users\\User\\Documents\\Books' },
    { name: 'Spreadsheets', sizeMB: 450, path: 'C:\\Users\\User\\Documents\\Finance' },
    { name: 'Notes', sizeMB: 280, path: 'C:\\Users\\User\\Documents\\Notes' },
    { name: 'Backups', sizeMB: 2100, path: 'C:\\Users\\User\\Documents\\Backups' },
  ]},
  { name: 'Media', sizeGB: 15.7, fileCount: 8540, color: '#db6d28', items: [
    { name: 'Photos', sizeMB: 5200, path: 'C:\\Users\\User\\Pictures' },
    { name: 'Videos (recordings)', sizeMB: 6800, path: 'C:\\Users\\User\\Videos' },
    { name: 'Music library', sizeMB: 3200, path: 'C:\\Users\\User\\Music' },
    { name: 'Wallpapers', sizeMB: 450, path: 'C:\\Users\\User\\Pictures\\Wallpapers' },
  ]},
  { name: 'Downloads', sizeGB: 12.1, fileCount: 3420, color: '#f85149', items: [
    { name: 'Installers (.exe/.msi)', sizeMB: 5200, path: 'C:\\Users\\User\\Downloads' },
    { name: 'ISO files', sizeMB: 3800, path: 'C:\\Users\\User\\Downloads' },
    { name: 'Archives (.zip/.rar)', sizeMB: 2100, path: 'C:\\Users\\User\\Downloads' },
    { name: 'Miscellaneous', sizeMB: 1200, path: 'C:\\Users\\User\\Downloads\\Misc' },
  ]},
  { name: 'Temp Files', sizeGB: 5.4, fileCount: 18600, color: '#8b949e', items: [
    { name: 'Windows Temp', sizeMB: 2100, path: 'C:\\Windows\\Temp' },
    { name: 'User Temp', sizeMB: 980, path: 'C:\\Users\\User\\AppData\\Local\\Temp' },
    { name: 'Browser Cache', sizeMB: 1500, path: 'C:\\Users\\User\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache' },
    { name: 'Recycle Bin', sizeMB: 820, path: 'C:\\$Recycle.Bin' },
  ]},
  { name: 'Free Space', sizeGB: 62.8, fileCount: 0, color: 'rgba(255,255,255,0.05)' },
];

const LARGE_FILES: LargeFile[] = [
  { name: 'pagefile.sys', path: 'C:\\pagefile.sys', sizeMB: 16384, type: 'System', lastModified: '2026-05-01 08:15:00' },
  { name: 'hiberfil.sys', path: 'C:\\hiberfil.sys', sizeMB: 12288, type: 'System', lastModified: '2026-05-01 08:15:00' },
  { name: 'Windows_11_23H2.iso', path: 'C:\\Users\\User\\Downloads\\Windows_11_23H2.iso', sizeMB: 6400, type: 'ISO', lastModified: '2026-04-15 10:30:00' },
  { name: 'Visual_Studio_2022_Pro.iso', path: 'C:\\Users\\User\\Downloads\\Visual_Studio_2022_Pro.iso', sizeMB: 3500, type: 'ISO', lastModified: '2026-03-20 14:00:00' },
  { name: 'docker-desktop-data.vhdx', path: 'C:\\Users\\User\\AppData\\Local\\Docker\\wsl\\data\\ext4.vhdx', sizeMB: 8500, type: 'Disk Image', lastModified: '2026-05-01 08:10:00' },
  { name: 'minecraft_world_backup.zip', path: 'C:\\Users\\User\\Documents\\Backups\\minecraft_world_backup.zip', sizeMB: 2100, type: 'Archive', lastModified: '2026-04-28 22:00:00' },
  { name: 'nvlddmkm.sys', path: 'C:\\Windows\\System32\\DriverStore\\FileRepository\\nv_dispi.inf_amd64\\nvlddmkm.sys', sizeMB: 68, type: 'Driver', lastModified: '2026-04-10 08:00:00' },
  { name: 'Chrome.dll', path: 'C:\\Program Files\\Google\\Chrome\\Application\\130.0.6723.117\\chrome.dll', sizeMB: 245, type: 'Application', lastModified: '2026-04-22 06:00:00' },
  { name: 'Teams.exe', path: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', sizeMB: 192, type: 'Application', lastModified: '2026-04-25 10:00:00' },
  { name: 'discord_voice_engine.node', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\app-1.0.9032\\modules\\discord_voice-1\\discord_voice\\discord_voice_engine.node', sizeMB: 87, type: 'Library', lastModified: '2026-04-20 12:00:00' },
  { name: 'demo_render_4k.mp4', path: 'C:\\Users\\User\\Videos\\Captures\\demo_render_4k.mp4', sizeMB: 4200, type: 'Video', lastModified: '2026-04-18 15:00:00' },
  { name: 'conference_recording.mp4', path: 'C:\\Users\\User\\Videos\\Captures\\conference_recording.mp4', sizeMB: 1800, type: 'Video', lastModified: '2026-04-25 11:00:00' },
  { name: 'presentation_final_editable.psd', path: 'C:\\Users\\User\\Documents\\Projects\\design\\presentation_final_editable.psd', sizeMB: 520, type: 'Design', lastModified: '2026-04-29 16:00:00' },
  { name: 'steamclient64.dll', path: 'C:\\Program Files (x86)\\Steam\\steamclient64.dll', sizeMB: 26, type: 'Library', lastModified: '2026-04-25 02:00:00' },
  { name: 'DismHost.exe', path: 'C:\\Windows\\Temp\\DismHost.exe', sizeMB: 15, type: 'Temp', lastModified: '2026-04-30 03:00:00' },
  { name: 'office_deployment_tool.exe', path: 'C:\\Users\\User\\Downloads\\office_deployment_tool.exe', sizeMB: 12, type: 'Installer', lastModified: '2026-04-01 09:00:00' },
  { name: 'nvidia_driver_555.99.exe', path: 'C:\\Users\\User\\Downloads\\nvidia_driver_555.99.exe', sizeMB: 720, type: 'Installer', lastModified: '2026-04-10 08:00:00' },
  { name: 'swapfile.sys', path: 'C:\\swapfile.sys', sizeMB: 256, type: 'System', lastModified: '2026-05-01 08:15:00' },
  { name: 'node_modules.tar.gz', path: 'C:\\Users\\User\\Documents\\Projects\\backup_node_modules.tar.gz', sizeMB: 450, type: 'Archive', lastModified: '2026-04-20 18:00:00' },
  { name: 'Sysmain.db', path: 'C:\\ProgramData\\Microsoft\\Windows\\AppRepository\\StateRepository-Machine.srd', sizeMB: 64, type: 'Database', lastModified: '2026-05-01 08:14:00' },
];

const TEMP_CATEGORIES: TempFileCategory[] = [
  { name: 'Windows Temp Files', sizeMB: 2100, fileCount: 4520, description: 'Temporary files created by Windows system processes and services.', safeToDelete: true },
  { name: 'User Temp Files', sizeMB: 980, fileCount: 3100, description: 'Temporary files created by user applications in %TEMP% folder.', safeToDelete: true },
  { name: 'Browser Cache', sizeMB: 1500, fileCount: 8200, description: 'Cached web pages, images, and scripts from Chrome, Firefox, and Edge.', safeToDelete: true },
  { name: 'Recycle Bin', sizeMB: 820, fileCount: 340, description: 'Files that have been deleted but not yet permanently removed.', safeToDelete: true },
  { name: 'Windows Update Cleanup', sizeMB: 1800, fileCount: 6500, description: 'Backup files from previous Windows updates. Safe to delete after system is stable.', safeToDelete: true },
  { name: 'Delivery Optimization Files', sizeMB: 620, fileCount: 180, description: 'Windows Update delivery optimization cache files shared with other PCs.', safeToDelete: true },
  { name: 'Log Files', sizeMB: 340, fileCount: 1200, description: 'Application and system log files. Some may be useful for troubleshooting.', safeToDelete: false },
  { name: 'Crash Dumps', sizeMB: 180, fileCount: 8, description: 'Memory dump files from application and system crashes. Useful for debugging.', safeToDelete: false },
  { name: 'Thumbnail Cache', sizeMB: 120, fileCount: 15000, description: 'Cached thumbnail images for files and folders in Explorer.', safeToDelete: true },
];

export class DiskAnalyzer {
  getSpaceDistribution(_drive: string): DiskCategory[] {
    return SPACE_DISTRIBUTION.map((c) => ({ ...c, items: c.items ? [...c.items] : undefined }));
  }

  getLargeFiles(_drive: string, limit?: number): LargeFile[] {
    const sorted = [...LARGE_FILES].sort((a, b) => b.sizeMB - a.sizeMB);
    return sorted.slice(0, limit ?? 20);
  }

  getTempFiles(): TempFileCategory[] {
    return TEMP_CATEGORIES.map((c) => ({ ...c }));
  }

  cleanTempFiles(categories: string[]): { freedMB: number; errors: string[] } {
    const selected = TEMP_CATEGORIES.filter((c) => categories.includes(c.name));
    let totalFreed = 0;
    const errors: string[] = [];
    for (const cat of selected) {
      if (cat.safeToDelete) {
        totalFreed += cat.sizeMB;
      } else {
        errors.push(`"${cat.name}" is not safe to delete automatically`);
      }
    }
    return { freedMB: totalFreed, errors };
  }
}
