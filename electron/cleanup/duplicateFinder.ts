export interface DuplicateGroup {
  hash: string;
  size: number;
  count: number;
  files: Array<{ path: string; name: string; modified: string }>;
}

const DUPLICATE_GROUPS: DuplicateGroup[] = [
  {
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
    size: 524_288_000,
    count: 3,
    files: [
      { path: 'C:\\Users\\User\\Documents\\Projects\\report_final.pdf', name: 'report_final.pdf', modified: '2026-04-20 10:00:00' },
      { path: 'C:\\Users\\User\\Downloads\\report_final.pdf', name: 'report_final.pdf', modified: '2026-04-20 10:00:00' },
      { path: 'C:\\Users\\User\\Desktop\\report_final_backup.pdf', name: 'report_final_backup.pdf', modified: '2026-04-20 11:00:00' },
    ],
  },
  {
    hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
    size: 1_073_741_824,
    count: 2,
    files: [
      { path: 'C:\\Users\\User\\Videos\\vacation_2025.mp4', name: 'vacation_2025.mp4', modified: '2025-12-25 15:00:00' },
      { path: 'D:\\Backups\\Videos\\vacation_2025.mp4', name: 'vacation_2025.mp4', modified: '2025-12-25 15:30:00' },
    ],
  },
  {
    hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
    size: 15_728_640,
    count: 2,
    files: [
      { path: 'C:\\Users\\User\\Pictures\\Screenshots\\screenshot_001.png', name: 'screenshot_001.png', modified: '2026-04-30 09:00:00' },
      { path: 'C:\\Users\\User\\Documents\\Notes\\screenshots\\screenshot_001.png', name: 'screenshot_001.png', modified: '2026-04-30 09:05:00' },
    ],
  },
  {
    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
    size: 256_901_120,
    count: 3,
    files: [
      { path: 'C:\\Users\\User\\Music\\Downloads\\song_remix.mp3', name: 'song_remix.mp3', modified: '2026-04-15 20:00:00' },
      { path: 'C:\\Users\\User\\Downloads\\song_remix.mp3', name: 'song_remix.mp3', modified: '2026-04-15 19:45:00' },
      { path: 'D:\\Media\\Music\\song_remix.mp3', name: 'song_remix.mp3', modified: '2026-04-16 08:00:00' },
    ],
  },
  {
    hash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    size: 45_056_000,
    count: 2,
    files: [
      { path: 'C:\\Users\\User\\Documents\\Resume\\resume_2026.docx', name: 'resume_2026.docx', modified: '2026-04-10 14:00:00' },
      { path: 'C:\\Users\\User\\Desktop\\resume_2026.docx', name: 'resume_2026.docx', modified: '2026-04-10 14:30:00' },
    ],
  },
  {
    hash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
    size: 734_003_200,
    count: 2,
    files: [
      { path: 'C:\\Users\\User\\Downloads\\setup_toolkit.exe', name: 'setup_toolkit.exe', modified: '2026-03-20 10:00:00' },
      { path: 'C:\\Users\\User\\Downloads\\setup_toolkit (1).exe', name: 'setup_toolkit (1).exe', modified: '2026-03-21 10:00:00' },
    ],
  },
  {
    hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    size: 2_147_483_648,
    count: 2,
    files: [
      { path: 'C:\\Users\\User\\Documents\\Backups\\system_image_202601.wim', name: 'system_image_202601.wim', modified: '2026-01-15 06:00:00' },
      { path: 'D:\\Backups\\system_image_202601.wim', name: 'system_image_202601.wim', modified: '2026-01-15 06:30:00' },
    ],
  },
  {
    hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3',
    size: 89_128_960,
    count: 3,
    files: [
      { path: 'C:\\Users\\User\\Pictures\\photo_album\\IMG_4521.jpg', name: 'IMG_4521.jpg', modified: '2026-04-28 12:00:00' },
      { path: 'C:\\Users\\User\\Pictures\\export\\IMG_4521.jpg', name: 'IMG_4521.jpg', modified: '2026-04-28 12:00:00' },
      { path: 'C:\\Users\\User\\OneDrive\\Pictures\\IMG_4521.jpg', name: 'IMG_4521.jpg', modified: '2026-04-28 12:05:00' },
    ],
  },
];

export class DuplicateFinder {
  async scanForDuplicates(
    _paths?: string[],
    onProgress?: (pct: number) => void,
  ): Promise<DuplicateGroup[]> {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < DUPLICATE_GROUPS.length; i++) {
      const pct = Math.round(((i + 1) / DUPLICATE_GROUPS.length) * 100);
      onProgress?.(pct);
      await delay(120);
    }

    return DUPLICATE_GROUPS.map((g) => ({
      ...g,
      files: g.files.map((f) => ({ ...f })),
    }));
  }
}
