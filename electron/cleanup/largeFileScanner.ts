export interface LargeFileEntry {
  path: string;
  name: string;
  size: number;
  type: string;
  modified: string;
  extension: string;
}

const LARGE_FILES: LargeFileEntry[] = [
  { name: 'Windows_11_23H2.iso', path: 'C:\\Users\\User\\Downloads\\Windows_11_23H2.iso', size: 6_442_450_944, type: 'ISO', modified: '2026-04-15 10:30:00', extension: '.iso' },
  { name: 'Cyberpunk2077.vhdx', path: 'C:\\Users\\User\\VMs\\Cyberpunk2077.vhdx', size: 85_899_345_920, type: 'VM Disk', modified: '2026-04-28 18:00:00', extension: '.vhdx' },
  { name: 'project_backup_2026Q1.tar.gz', path: 'C:\\Users\\User\\Backups\\project_backup_2026Q1.tar.gz', size: 12_582_912_000, type: 'Archive', modified: '2026-04-01 12:00:00', extension: '.gz' },
  { name: 'demo_render_4k.mp4', path: 'C:\\Users\\User\\Videos\\Captures\\demo_render_4k.mp4', size: 4_294_967_296, type: 'Video', modified: '2026-04-18 15:00:00', extension: '.mp4' },
  { name: 'Visual_Studio_2022_Pro.iso', path: 'C:\\Users\\User\\Downloads\\Visual_Studio_2022_Pro.iso', size: 3_670_016_000, type: 'ISO', modified: '2026-03-20 14:00:00', extension: '.iso' },
  { name: 'docker-desktop-data.vhdx', path: 'C:\\Users\\User\\AppData\\Local\\Docker\\wsl\\data\\ext4.vhdx', size: 8_912_109_568, type: 'VM Disk', modified: '2026-05-01 08:10:00', extension: '.vhdx' },
  { name: 'minecraft_world_backup.zip', path: 'C:\\Users\\User\\Documents\\Backups\\minecraft_world_backup.zip', size: 2_201_166_848, type: 'Archive', modified: '2026-04-28 22:00:00', extension: '.zip' },
  { name: 'conference_recording.mp4', path: 'C:\\Users\\User\\Videos\\Captures\\conference_recording.mp4', size: 1_887_436_800, type: 'Video', modified: '2026-04-25 11:00:00', extension: '.mp4' },
  { name: 'nvidia_driver_555.99.exe', path: 'C:\\Users\\User\\Downloads\\nvidia_driver_555.99.exe', size: 754_974_720, type: 'Installer', modified: '2026-04-10 08:00:00', extension: '.exe' },
  { name: 'presentation_final.psd', path: 'C:\\Users\\User\\Documents\\Projects\\design\\presentation_final.psd', size: 545_259_520, type: 'Design', modified: '2026-04-29 16:00:00', extension: '.psd' },
  { name: 'training_dataset.csv', path: 'C:\\Users\\User\\Documents\\ML\\training_dataset.csv', size: 2_985_984_000, type: 'Data', modified: '2026-04-12 09:00:00', extension: '.csv' },
  { name: 'model_checkpoint.safetensors', path: 'C:\\Users\\User\\Documents\\ML\\models\\checkpoint.safetensors', size: 7_340_032_000, type: 'Model', modified: '2026-04-20 16:00:00', extension: '.safetensors' },
  { name: 'Oracle_VM_VirtualBox.iso', path: 'C:\\Users\\User\\Downloads\\Oracle_VM_VirtualBox.iso', size: 4_718_592_000, type: 'ISO', modified: '2026-03-10 08:00:00', extension: '.iso' },
  { name: 'movie_night_4k.mkv', path: 'D:\\Media\\Movies\\movie_night_4k.mkv', size: 32_212_254_720, type: 'Video', modified: '2026-04-30 20:00:00', extension: '.mkv' },
  { name: 'game_recording_20260430.mp4', path: 'D:\\Videos\\Captures\\game_recording_20260430.mp4', size: 8_053_063_680, type: 'Video', modified: '2026-04-30 23:00:00', extension: '.mp4' },
  { name: 'steam_backup_games.zip', path: 'D:\\Backups\\steam_backup_games.zip', size: 25_769_803_776, type: 'Archive', modified: '2026-04-15 14:00:00', extension: '.zip' },
  { name: 'linux_ubuntu_24.04.iso', path: 'D:\\ISOs\\linux_ubuntu_24.04.iso', size: 5_767_168_000, type: 'ISO', modified: '2026-04-05 10:00:00', extension: '.iso' },
  { name: 'code_project_v2.tar.xz', path: 'C:\\Users\\User\\Documents\\Projects\\code_project_v2.tar.xz', size: 356_515_840, type: 'Archive', modified: '2026-04-22 14:00:00', extension: '.xz' },
  { name: 'database_dump_202604.sql', path: 'C:\\Users\\User\\Documents\\DB\\database_dump_202604.sql', size: 890_241_024, type: 'Database', modified: '2026-04-30 06:00:00', extension: '.sql' },
  { name: 'adobe_premiere_project.prproj', path: 'C:\\Users\\User\\Videos\\Projects\\adobe_premiere_project.prproj', size: 234_881_024, type: 'Project', modified: '2026-04-26 19:00:00', extension: '.prproj' },
  { name: 'unity_project_backup.unitypackage', path: 'C:\\Users\\User\\Documents\\Unity\\project_backup.unitypackage', size: 1_234_567_890, type: 'Package', modified: '2026-04-18 11:00:00', extension: '.unitypackage' },
  { name: 'deep_learning_dataset.zip', path: 'D:\\Datasets\\deep_learning_dataset.zip', size: 15_728_640_000, type: 'Archive', modified: '2026-04-08 13:00:00', extension: '.zip' },
  { name: 'vm_snapshot_clean.qcow2', path: 'D:\\VMs\\snapshots\\vm_snapshot_clean.qcow2', size: 42_949_672_960, type: 'VM Disk', modified: '2026-04-25 10:00:00', extension: '.qcow2' },
  { name: 'music_collection.flac', path: 'D:\\Media\\Music\\collection\\music_collection.flac', size: 3_221_225_472, type: 'Audio', modified: '2026-04-10 17:00:00', extension: '.flac' },
  { name: 'node_modules_backup.tar', path: 'C:\\Users\\User\\Documents\\Projects\\node_modules_backup.tar', size: 498_073_600, type: 'Archive', modified: '2026-04-20 18:00:00', extension: '.tar' },
];

export class LargeFileScanner {
  async scanLargeFiles(
    minSizeMB?: number,
    _path?: string,
    onProgress?: (pct: number, current: string) => void,
  ): Promise<LargeFileEntry[]> {
    const minSizeBytes = (minSizeMB ?? 100) * 1_048_576;
    const filtered = LARGE_FILES.filter((f) => f.size >= minSizeBytes);

    // Simulate scan progress
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < filtered.length; i++) {
      const pct = Math.round(((i + 1) / filtered.length) * 100);
      onProgress?.(pct, filtered[i].name);
      await delay(40);
    }

    return [...filtered].sort((a, b) => b.size - a.size);
  }
}
