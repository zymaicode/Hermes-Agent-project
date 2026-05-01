export interface ScannedFile {
  name: string;
  path: string;
  sizeMB: number;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'installer' | 'code' | 'other';
  extension: string;
  lastModified: string;
  created: string;
  isDuplicate: boolean;
  duplicateGroup?: string;
  attributes: string[];
}

export interface ScanConfig {
  directories: string[];
  minSizeMB: number;
  maxSizeMB: number;
  fileTypes: string[];
  includeSystem: boolean;
  includeHidden: boolean;
  findDuplicates: boolean;
}

const BASE_DIR = 'C:\\Users\\Jason\\';

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function makePath(parent: string, name: string): string {
  return `${BASE_DIR}${parent}\\${name}`;
}

const FILE_POOL: Array<{ name: string; parent: string; sizeMB: number; type: ScannedFile['type']; ext: string; attributes: string[] }> = [
  // Documents
  { name: 'Project_Report_Q1.docx', parent: 'Documents', sizeMB: 45, type: 'document', ext: '.docx', attributes: ['archive'] },
  { name: 'budget_2025.xlsx', parent: 'Documents', sizeMB: 12, type: 'document', ext: '.xlsx', attributes: ['archive'] },
  { name: 'Resume_Updated.pdf', parent: 'Documents', sizeMB: 2, type: 'document', ext: '.pdf', attributes: ['archive'] },
  { name: 'MeetingNotes_2025-04-28.txt', parent: 'Documents', sizeMB: 0.05, type: 'document', ext: '.txt', attributes: ['archive'] },
  { name: 'presentation_slides.pptx', parent: 'Documents', sizeMB: 28, type: 'document', ext: '.pptx', attributes: ['archive'] },
  { name: 'contract_draft_v3.docx', parent: 'Documents', sizeMB: 8, type: 'document', ext: '.docx', attributes: ['archive'] },
  { name: 'taxes_2024.pdf', parent: 'Documents', sizeMB: 3, type: 'document', ext: '.pdf', attributes: ['archive'] },
  { name: 'server_config_backup.yaml', parent: 'Documents', sizeMB: 0.1, type: 'code', ext: '.yaml', attributes: ['archive'] },
  { name: 'readme_project.md', parent: 'Documents', sizeMB: 0.02, type: 'document', ext: '.md', attributes: ['archive'] },
  { name: 'database_schema.sql', parent: 'Documents', sizeMB: 0.5, type: 'code', ext: '.sql', attributes: ['archive'] },

  // Downloads
  { name: 'ubuntu-24.04-desktop-amd64.iso', parent: 'Downloads', sizeMB: 5800, type: 'installer', ext: '.iso', attributes: ['archive'] },
  { name: 'vscode-setup-x64.exe', parent: 'Downloads', sizeMB: 95, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'discord-setup.exe', parent: 'Downloads', sizeMB: 82, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'python-3.12.3-amd64.exe', parent: 'Downloads', sizeMB: 28, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'Firefox Installer.exe', parent: 'Downloads', sizeMB: 55, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'GIMP-2.10.38-setup.exe', parent: 'Downloads', sizeMB: 320, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'stock_prices_weekly.csv', parent: 'Downloads', sizeMB: 3, type: 'document', ext: '.csv', attributes: ['archive'] },
  { name: 'wallpaper_4k_nature.png', parent: 'Downloads', sizeMB: 22, type: 'image', ext: '.png', attributes: ['archive'] },
  { name: 'invoice_April_2025.pdf', parent: 'Downloads', sizeMB: 0.8, type: 'document', ext: '.pdf', attributes: ['archive'] },
  { name: 'ChromeSetup.exe', parent: 'Downloads', sizeMB: 2, type: 'installer', ext: '.exe', attributes: ['archive'] },
  { name: 'mysql-workbench-8.0.36.msi', parent: 'Downloads', sizeMB: 44, type: 'installer', ext: '.msi', attributes: ['archive'] },
  { name: 'backup_db_20250401.sql', parent: 'Downloads', sizeMB: 150, type: 'code', ext: '.sql', attributes: ['archive'] },

  // Desktop
  { name: 'todo_list.txt', parent: 'Desktop', sizeMB: 0.01, type: 'document', ext: '.txt', attributes: ['archive'] },
  { name: 'screenshot_tool.png', parent: 'Desktop', sizeMB: 1.5, type: 'image', ext: '.png', attributes: ['archive'] },
  { name: 'setup_wizard.lnk', parent: 'Desktop', sizeMB: 0.002, type: 'other', ext: '.lnk', attributes: ['archive'] },
  { name: 'old_shortcut.lnk', parent: 'Desktop', sizeMB: 0.002, type: 'other', ext: '.lnk', attributes: ['archive'] },

  // Videos
  { name: 'recording_2025-04-20_meeting.mp4', parent: 'Videos', sizeMB: 3200, type: 'video', ext: '.mp4', attributes: ['archive'] },
  { name: 'family_vacation_2024.mp4', parent: 'Videos', sizeMB: 4800, type: 'video', ext: '.mp4', attributes: ['archive'] },
  { name: 'tutorial_react_fundamentals.mp4', parent: 'Videos', sizeMB: 850, type: 'video', ext: '.mp4', attributes: ['archive'] },
  { name: 'screen_capture_demo.mkv', parent: 'Videos', sizeMB: 180, type: 'video', ext: '.mkv', attributes: ['archive'] },
  { name: 'webcam_test_20250401.avi', parent: 'Videos', sizeMB: 45, type: 'video', ext: '.avi', attributes: ['archive'] },

  // Pictures
  { name: 'IMG_20250425_143021.jpg', parent: 'Pictures', sizeMB: 8, type: 'image', ext: '.jpg', attributes: ['archive'] },
  { name: 'IMG_20250418_092145.jpg', parent: 'Pictures', sizeMB: 6, type: 'image', ext: '.jpg', attributes: ['archive'] },
  { name: 'screenshot_desktop.png', parent: 'Pictures', sizeMB: 3, type: 'image', ext: '.png', attributes: ['archive'] },
  { name: 'profile_photo.jpg', parent: 'Pictures', sizeMB: 1.2, type: 'image', ext: '.jpg', attributes: ['archive'] },
  { name: 'banner_design.psd', parent: 'Pictures', sizeMB: 120, type: 'image', ext: '.psd', attributes: ['archive'] },
  { name: 'logo_company_highres.png', parent: 'Pictures', sizeMB: 15, type: 'image', ext: '.png', attributes: ['archive'] },
  { name: 'DSC_4521.NEF', parent: 'Pictures', sizeMB: 48, type: 'image', ext: '.nef', attributes: ['archive'] },

  // Music
  { name: 'track_01_intro.mp3', parent: 'Music', sizeMB: 8, type: 'audio', ext: '.mp3', attributes: ['archive'] },
  { name: 'podcast_ep142.mp3', parent: 'Music', sizeMB: 65, type: 'audio', ext: '.mp3', attributes: ['archive'] },
  { name: 'sample_beat.flac', parent: 'Music', sizeMB: 34, type: 'audio', ext: '.flac', attributes: ['archive'] },
  { name: 'theme_song.wav', parent: 'Music', sizeMB: 50, type: 'audio', ext: '.wav', attributes: ['archive'] },
  { name: 'playlist_backup.m3u', parent: 'Music', sizeMB: 0.01, type: 'other', ext: '.m3u', attributes: ['archive'] },

  // AppData hidden/temp
  { name: 'temp_cache_data.bin', parent: 'AppData\\Local\\Temp', sizeMB: 340, type: 'other', ext: '.bin', attributes: ['hidden', 'archive'] },
  { name: 'crash_dump_2025-04-27.dmp', parent: 'AppData\\Local\\Temp', sizeMB: 520, type: 'other', ext: '.dmp', attributes: ['hidden', 'archive'] },
  { name: 'temporary_files_backup.tmp', parent: 'AppData\\Local\\Temp', sizeMB: 85, type: 'other', ext: '.tmp', attributes: ['hidden', 'archive'] },
  { name: 'installer_cache.msi', parent: 'AppData\\Local\\Temp', sizeMB: 210, type: 'installer', ext: '.msi', attributes: ['hidden', 'archive'] },
  { name: 'old_project_backup.zip', parent: 'AppData\\Local', sizeMB: 1200, type: 'archive', ext: '.zip', attributes: ['hidden', 'archive'] },
  { name: 'node_modules_backup.tar.gz', parent: 'AppData\\Local', sizeMB: 680, type: 'archive', ext: '.tar.gz', attributes: ['hidden', 'archive'] },
  { name: 'backup_registry_20250315.reg', parent: 'AppData\\Roaming', sizeMB: 14, type: 'other', ext: '.reg', attributes: ['hidden', 'archive'] },

  // Additional files
  { name: 'project_archive_2023.zip', parent: 'Documents', sizeMB: 2500, type: 'archive', ext: '.zip', attributes: ['archive'] },
  { name: 'virtualbox_vm_disk.vdi', parent: 'Documents', sizeMB: 8200, type: 'other', ext: '.vdi', attributes: ['archive'] },
  { name: 'docker_image_backup.tar', parent: 'Downloads', sizeMB: 1500, type: 'archive', ext: '.tar', attributes: ['archive'] },
  { name: 'font_collection_2025.zip', parent: 'Downloads', sizeMB: 180, type: 'archive', ext: '.zip', attributes: ['archive'] },
  { name: 'movie_trailer_4k.mp4', parent: 'Videos', sizeMB: 1800, type: 'video', ext: '.mp4', attributes: ['archive'] },
  { name: 'game_recording_session.mp4', parent: 'Videos', sizeMB: 6200, type: 'video', ext: '.mp4', attributes: ['archive'] },
];

export class FileScanner {
  private cancelled = false;
  private recentScans: Array<{ timestamp: number; totalFiles: number; totalSizeMB: number; duplicates: number }> = [];

  cancel(): void {
    this.cancelled = true;
  }

  async scanFiles(
    _config: ScanConfig,
    progress: (pct: number, phase: string, found: number) => void,
  ): Promise<{
    files: ScannedFile[];
    totalSizeMB: number;
    totalFiles: number;
    duplicates: ScannedFile[];
    categories: Record<string, { count: number; totalMB: number }>;
  }> {
    this.cancelled = false;
    const allFiles: ScannedFile[] = [];

    // Phase 1: Scanning directories (0-20%)
    let fileIndex = 0;
    for (const f of FILE_POOL.slice(0, 20)) {
      if (this.cancelled) break;
      allFiles.push({
        name: f.name,
        path: makePath(f.parent, f.name),
        sizeMB: f.sizeMB,
        type: f.type,
        extension: f.ext,
        lastModified: daysAgo(Math.floor(Math.random() * 90)),
        created: daysAgo(Math.floor(Math.random() * 365)),
        isDuplicate: false,
        attributes: f.attributes,
      });
      fileIndex++;
      progress(Math.round((fileIndex / FILE_POOL.length) * 20), 'Scanning directories...', allFiles.length);
      await this.delay(60);
    }

    if (this.cancelled) return this.emptyResult();

    // Phase 2: Analyzing files (20-50%)
    for (const f of FILE_POOL.slice(20, 40)) {
      if (this.cancelled) break;
      allFiles.push({
        name: f.name,
        path: makePath(f.parent, f.name),
        sizeMB: f.sizeMB,
        type: f.type,
        extension: f.ext,
        lastModified: daysAgo(Math.floor(Math.random() * 90)),
        created: daysAgo(Math.floor(Math.random() * 365)),
        isDuplicate: false,
        attributes: f.attributes,
      });
      fileIndex++;
      progress(20 + Math.round((fileIndex - 20) / (FILE_POOL.length - 20) * 30), 'Analyzing files...', allFiles.length);
      await this.delay(50);
    }

    if (this.cancelled) return this.emptyResult();

    // Continue with remaining
    for (const f of FILE_POOL.slice(40)) {
      if (this.cancelled) break;
      allFiles.push({
        name: f.name,
        path: makePath(f.parent, f.name),
        sizeMB: f.sizeMB,
        type: f.type,
        extension: f.ext,
        lastModified: daysAgo(Math.floor(Math.random() * 90)),
        created: daysAgo(Math.floor(Math.random() * 365)),
        isDuplicate: false,
        attributes: f.attributes,
      });
      fileIndex++;
    }

    // Phase 3: Checking duplicates (50-80%)
    progress(50, 'Checking for duplicates...', allFiles.length);
    const dupMap = new Map<string, ScannedFile[]>();
    for (const f of allFiles) {
      const key = `${f.name}|${f.sizeMB}`;
      if (!dupMap.has(key)) dupMap.set(key, []);
      dupMap.get(key)!.push(f);
    }

    const duplicates: ScannedFile[] = [];
    let dupGroup = 0;
    for (const [, group] of dupMap) {
      if (group.length > 1) {
        const groupId = String(dupGroup++);
        for (const f of group) {
          f.isDuplicate = true;
          f.duplicateGroup = groupId;
        }
        duplicates.push(...group.slice(1)); // first file is "original", rest are duplicates
      }
    }
    progress(80, 'Building results...', allFiles.length);
    await this.delay(300);

    if (this.cancelled) return this.emptyResult();

    // Phase 4: Build categories
    const categories: Record<string, { count: number; totalMB: number }> = {};
    for (const f of allFiles) {
      if (!categories[f.type]) categories[f.type] = { count: 0, totalMB: 0 };
      categories[f.type].count++;
      categories[f.type].totalMB += f.sizeMB;
    }

    progress(100, 'Scan complete', allFiles.length);

    const totalSizeMB = allFiles.reduce((s, f) => s + f.sizeMB, 0);

    this.recentScans.unshift({
      timestamp: Date.now(),
      totalFiles: allFiles.length,
      totalSizeMB,
      duplicates: duplicates.length,
    });
    this.recentScans = this.recentScans.slice(0, 10);

    return { files: allFiles, totalSizeMB, totalFiles: allFiles.length, duplicates, categories };
  }

  getRecentScans(): Array<{ timestamp: number; totalFiles: number; totalSizeMB: number; duplicates: number }> {
    return this.recentScans;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private emptyResult() {
    return { files: [], totalSizeMB: 0, totalFiles: 0, duplicates: [], categories: {} };
  }
}
